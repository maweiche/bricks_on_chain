import { AuthenticationError, UserInputError } from 'apollo-server'
import { pubsub, EVENTS } from '../pubsub'
import mongoose from 'mongoose'
import { Context } from '../types'
import { connectToDatabase } from '@/lib/mongodb'

export const typeDefs = `
  enum InvestmentStatus {
    pending
    active
    completed
  }

  type Investment {
    id: ID!
    user: User!
    property: Property!
    amount: Float!
    fractionCount: Int!
    status: InvestmentStatus!
    purchaseDate: Date!
    transactionSignature: String
    roi: Float!
    estimatedReturns: Float!
  }

  input CreateInvestmentInput {
    propertyId: ID!
    amount: Float!
    fractionCount: Int!
    transactionSignature: String
  }

  type Query {
    investment(id: ID!): Investment
    investments(
      propertyId: ID
      status: InvestmentStatus
      first: Int
      after: String
    ): InvestmentConnection!
    myInvestments: [Investment!]!
    myInvestmentStats: InvestmentStats!
  }

  type Mutation {
    createInvestment(input: CreateInvestmentInput!): Investment!
    cancelInvestment(id: ID!): Investment!
  }

  type Subscription {
    investmentCreated(propertyId: ID): Investment!
    myInvestmentUpdated: Investment!
  }
  
  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type InvestmentConnection {
    edges: [InvestmentEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type InvestmentEdge {
    node: Investment!
    cursor: String!
  }

  type InvestmentStats {
    totalInvested: Float!
    totalProperties: Int!
    averageRoi: Float!
    totalEstimatedReturns: Float!
  }

  extend type Query {
    investment(id: ID!): Investment
    investments(
      propertyId: ID
      status: InvestmentStatus
      first: Int
      after: String
    ): InvestmentConnection!
    myInvestments: [Investment!]!
    myInvestmentStats: InvestmentStats!
  }

  extend type Mutation {
    createInvestment(input: CreateInvestmentInput!): Investment!
    cancelInvestment(id: ID!): Investment!
  }

  extend type Subscription {
    investmentCreated(propertyId: ID): Investment!
    myInvestmentUpdated: Investment!
  }
`

export const resolvers = {
  Query: {
    investment: async (_: any, { id }: any, { user }: { user: any }) => {
      if (!user) throw new AuthenticationError('Not authenticated')
      const db = (await connectToDatabase()).db
      const investment = await db.collection('investments').findOne({ _id: id })

      if (!investment) throw new UserInputError('Investment not found')

      // Only allow users to view their own investments unless they're admin
      if (user.role !== 'admin' && investment.userId !== user.id) {
        throw new AuthenticationError('Not authorized')
      }

      return investment
    },

    investments: async (
      _: any,
      { propertyId, status, first = 10, after }: any,
      { user }: any
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      // Build query
      const query: any = {}
      if (propertyId) query.propertyId = propertyId
      if (status) query.status = status
      if (user.role !== 'admin') query.userId = user.id
      if (after) query._id = { $gt: new mongoose.Types.ObjectId(after) }
      const db = (await connectToDatabase()).db
      // const investment = await db.collection('investments').findOne({ _id: id })
      const investments = db.collection('investments').find(query)
      const hasNextPage = (await investments.count()) > first
      const edges = (await investments.limit(first).toArray()).map((node) => ({
        node,
        cursor: node._id.toString(),
      }))

      const totalCount = await db
        .collection('investments')
        .countDocuments(query)

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount,
      }
    },

    myInvestments: async (_: any, __: any, { user }: any) => {
      if (!user) throw new AuthenticationError('Not authenticated')
      const db = (await connectToDatabase()).db
      return await db
        .collection('investments')
        .find({ userId: user.id })
        .toArray()
    },

    myInvestmentStats: async (_: any, __: any, { user }: any) => {
      if (!user) throw new AuthenticationError('Not authenticated')
      const db = (await connectToDatabase()).db
      const investments = await db
        .collection('investments')
        .find({ userId: user.id })
        .toArray()
      const propertyIds = Array.from(
        new Set(investments.map((inv) => inv.propertyId))
      )
      const properties = await db
        .collection('properties')
        .find({ _id: { $in: propertyIds } })
        .toArray()

      const totalInvested = investments.reduce(
        (sum, inv) => sum + inv.amount,
        0
      )
      const totalProperties = propertyIds.length
      const totalEstimatedReturns = investments.reduce((sum, inv) => {
        const property = properties.find(
          (p) => p._id.toString() === inv.propertyId
        )
        return sum + inv.amount * (1 + (property?.roi || 0) / 100)
      }, 0)
      const averageRoi =
        properties.reduce((sum, prop) => sum + prop.roi, 0) / totalProperties

      return {
        totalInvested,
        totalProperties,
        averageRoi,
        totalEstimatedReturns,
      }
    },
  },

  Mutation: {
    createInvestment: async (_: any, { input }: any, { user }: any) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      const session = await mongoose.startSession()
      session.startTransaction()

      try {
        const db = (await connectToDatabase()).db

        const property = await db
          .collection('properties')
          .findOne({ _id: input.propertyId })
        if (!property) throw new UserInputError('Property not found')

        // Validate investment
        if (property.funded) {
          throw new UserInputError('Property is already fully funded')
        }

        if (property.currentFunding + input.amount > property.fundingGoal) {
          throw new UserInputError(
            'Investment amount exceeds remaining funding goal'
          )
        }

        // Create investment
        const investment = await db.collection('investments').insertOne({
          userId: user.id,
          propertyId: input.propertyId,
          amount: input.amount,
          fractionCount: input.fractionCount,
          status: 'active',
          purchaseDate: new Date(),
          transactionSignature: input.transactionSignature,
        })

        // Update property funding
        await db.collection('properties').updateOne(
          input.propertyId,
          {
            $inc: { currentFunding: input.amount },
            $set: {
              funded:
                property.currentFunding + input.amount >= property.fundingGoal,
              updatedAt: new Date(),
            },
          },
          { session }
        )

        await session.commitTransaction()

        // Publish events
        pubsub.publish(EVENTS.INVESTMENT.CREATED, {
          investmentCreated: investment.insertedId,
          propertyId: input.propertyId,
        })

        return investment
      } catch (error) {
        await session.abortTransaction()
        throw error
      } finally {
        session.endSession()
      }
    },

    cancelInvestment: async (_: any, { id }: any, { user }: any) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      const db = (await connectToDatabase()).db

      try {
        const investment = await db
          .collection('investments')
          .findOne({ _id: id })
        if (!investment) throw new UserInputError('Investment not found')

        if (user.role !== 'admin' && investment.userId !== user.id) {
          throw new AuthenticationError('Not authorized')
        }

        if (investment.status !== 'pending') {
          throw new UserInputError('Only pending investments can be cancelled')
        }

        // Update investment status
        const updatedInvestment = await db
          .collection('investments')
          .updateOne(id, {
            $set: { status: 'completed', updatedAt: new Date() },
          })

        // Update property funding
        await db.collection('properties').updateOne(investment.propertyId, {
          $inc: { currentFunding: -investment.amount },
          $set: { updatedAt: new Date() },
        })

        await db.collection('properties').updateOne(investment.propertyId, {
          $set: { funded: false },
          $currentFunding: -investment.amount,
        })
        // Publish update event
        pubsub.publish(EVENTS.INVESTMENT.UPDATED, {
          myInvestmentUpdated: updatedInvestment,
          userId: user.id,
        })

        return updatedInvestment
      } catch (error) {
        console.error(error)
        throw error
      }
    },
  },

  Subscription: {
    investmentCreated: {
      subscribe: (_: unknown, { propertyId }: { propertyId?: string }) =>
        (pubsub as any).asyncIterator(
          `${EVENTS.INVESTMENT.CREATED}_${propertyId || ''}`
        ),
    },
    myInvestmentUpdated: {
      subscribe: (_: unknown, __: unknown, { user }: Context) => {
        if (!user) throw new AuthenticationError('Not authenticated')
        return (pubsub as any).asyncIterator(
          `${EVENTS.INVESTMENT.UPDATED}_${user._id}`
        )
      },
    },
  },

  Investment: {
    user: async (parent: { userId: any }) => {
      const db = (await connectToDatabase()).db
      return await db.collection('users').findOne({ _id: parent.userId })
    },

    property: async (parent: { propertyId: any }) => {
      const db = (await connectToDatabase()).db
      return await db
        .collection('properties')
        .findOne({ _id: parent.propertyId })
    },

    roi: async (parent: { propertyId: any }) => {
      const db = (await connectToDatabase()).db
      const property = await db
        .collection('properties')
        .findOne({ _id: parent.propertyId })
      return property?.roi || 0
    },

    estimatedReturns: async (parent: { propertyId: any; amount: number }) => {
      const db = (await connectToDatabase()).db
      const property = await db
        .collection('properties')
        .findOne({ _id: parent.propertyId })
      return parent.amount * (1 + (property?.roi || 0) / 100)
    },
  },
}
