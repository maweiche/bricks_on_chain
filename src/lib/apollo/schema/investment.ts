import { AuthenticationError, UserInputError } from 'apollo-server'
import { PubSub as GraphQLPubSub } from 'graphql-subscriptions'
import { Investment, Property, User } from '@/lib/models'
import { pubsub, EVENTS, PubSubEvents } from '../pubsub'
import mongoose from 'mongoose'
import { Context } from '../types'

export const typeDefs = `#graphql
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

      const investment = await Investment.findById(id)
      if (!investment) throw new UserInputError('Investment not found')

      // Only allow users to view their own investments unless they're admin
      if (user.role !== 'admin' && investment.userId !== user.id) {
        throw new AuthenticationError('Not authorized')
      }

      return investment
    },

    investments: async (_: any, { propertyId, status, first = 10, after }: any, { user }: any) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      // Build query
      const query: any = {}
      if (propertyId) query.propertyId = propertyId
      if (status) query.status = status
      if (user.role !== 'admin') query.userId = user.id
      if (after) query._id = { $gt: new mongoose.Types.ObjectId(after) }

      const investments = await Investment.find(query)
        .sort({ _id: 1 })
        .limit(first + 1)

      const hasNextPage = investments.length > first
      const edges = investments.slice(0, first).map(investment => ({
        node: investment,
        cursor: investment._id.toString(),
      }))

      const totalCount = await Investment.countDocuments(query)

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
      return await Investment.find({ userId: user.id })
    },

    myInvestmentStats: async (_: any, __: any, { user }: any) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      const investments = await Investment.find({ userId: user.id })
      const propertyIds = Array.from(new Set(investments.map(inv => inv.propertyId)))
      const properties = await Property.find({ _id: { $in: propertyIds } })

      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
      const totalProperties = propertyIds.length
      const totalEstimatedReturns = investments.reduce((sum, inv) => {
        const property = properties.find(p => p._id.toString() === inv.propertyId)
        return sum + (inv.amount * (1 + (property?.roi || 0) / 100))
      }, 0)
      const averageRoi = properties.reduce((sum, prop) => sum + prop.roi, 0) / totalProperties

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
        const property = await Property.findById(input.propertyId).session(session)
        if (!property) throw new UserInputError('Property not found')
        
        // Validate investment
        if (property.funded) {
          throw new UserInputError('Property is already fully funded')
        }
        
        if (property.currentFunding + input.amount > property.fundingGoal) {
          throw new UserInputError('Investment amount exceeds remaining funding goal')
        }

        // Create investment
        const investment = await Investment.create([{
          userId: user.id,
          propertyId: input.propertyId,
          amount: input.amount,
          fractionCount: input.fractionCount,
          status: 'active',
          purchaseDate: new Date(),
          transactionSignature: input.transactionSignature,
        }], { session })

        // Update property funding
        await Property.findByIdAndUpdate(
          input.propertyId,
          {
            $inc: { currentFunding: input.amount },
            $set: {
              funded: property.currentFunding + input.amount >= property.fundingGoal,
              updatedAt: new Date(),
            },
          },
          { session }
        )

        await session.commitTransaction()

        // Publish events
        pubsub.publish(EVENTS.INVESTMENT.CREATED, {
          investmentCreated: investment[0],
          propertyId: input.propertyId,
        })

        return investment[0]
      } catch (error) {
        await session.abortTransaction()
        throw error
      } finally {
        session.endSession()
      }
    },

    cancelInvestment: async (_: any, { id }: any, { user }: any) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      const session = await mongoose.startSession()
      session.startTransaction()

      try {
        const investment = await Investment.findById(id).session(session)
        if (!investment) throw new UserInputError('Investment not found')

        if (user.role !== 'admin' && investment.userId !== user.id) {
          throw new AuthenticationError('Not authorized')
        }

        if (investment.status !== 'pending') {
          throw new UserInputError('Only pending investments can be cancelled')
        }

        // Update investment status
        const updatedInvestment = await Investment.findByIdAndUpdate(
          id,
          { $set: { status: 'completed', updatedAt: new Date() } },
          { new: true, session }
        )

        // Update property funding
        await Property.findByIdAndUpdate(
          investment.propertyId,
          {
            $inc: { currentFunding: -investment.amount },
            $set: { funded: false, updatedAt: new Date() },
          },
          { session }
        )

        await session.commitTransaction()

        // Publish update event
        pubsub.publish(EVENTS.INVESTMENT.UPDATED, {
          myInvestmentUpdated: updatedInvestment,
          userId: user.id,
        })

        return updatedInvestment
      } catch (error) {
        await session.abortTransaction()
        throw error
      } finally {
        session.endSession()
      }
    },
  },

  Subscription: {
    investmentCreated: {
      subscribe: (_: unknown, { propertyId }: { propertyId?: string }) => 
        (pubsub as any).asyncIterator(
          `${EVENTS.INVESTMENT.CREATED}_${propertyId || ''}`
        )
    },
    myInvestmentUpdated: {
      subscribe: (_: unknown, __: unknown, { user }: Context) => {
        if (!user) throw new AuthenticationError('Not authenticated')
        return (pubsub as any).asyncIterator(
          `${EVENTS.INVESTMENT.UPDATED}_${user.id}`
        )
      }
    }
  },

  Investment: {
    user: async (parent: { userId: any }) => {
      return await User.findById(parent.userId)
    },

    property: async (parent: { propertyId: any }) => {
      return await Property.findById(parent.propertyId)
    },

    roi: async (parent: { propertyId: any }) => {
      const property = await Property.findById(parent.propertyId)
      return property?.roi || 0
    },

    estimatedReturns: async (parent: { propertyId: any; amount: number }) => {
      const property = await Property.findById(parent.propertyId)
      return parent.amount * (1 + (property?.roi || 0) / 100)
    },
  },
}