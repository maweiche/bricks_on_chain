import { AuthenticationError, UserInputError } from 'apollo-server'
import { ObjectId } from 'mongodb'
import { EVENTS, pubsub, PubSubEvents } from '../pubsub'
import type { Context } from '../types'
import { connectToDatabase } from '@/lib/mongodb'

// Types for resolvers
interface PropertyFilterInput {
  type?: 'house' | 'apartment' | 'commercial'
  funded?: boolean
  minPrice?: number
  maxPrice?: number
  location?: string
  minRoi?: number
  maxRoi?: number
}

interface PropertiesArgs {
  filter?: PropertyFilterInput
  first?: number
  after?: string
}

interface CreatePropertyInput {
  title: string
  description: string
  location: string
  price: number
  type: 'house' | 'apartment' | 'commercial'
  images: string[]
  fundingGoal: number
  roi: number
}

interface PurchasePropertyInput {
  propertyId: string
  fractionCount: number
  totalAmount: number
}

interface UpdatePropertyInput {
  id: string
  title?: string
  description?: string
  location?: string
  price?: number
  type?: 'house' | 'apartment' | 'commercial'
  images?: string[]
  fundingGoal?: number
  roi?: number
  funded?: boolean
  currentFunding?: number
  tokenAddress?: string
  mintAuthority?: string
}

export const typeDefs = `
  enum PropertyType {
    house
    apartment
    commercial
  }

  type Property {
    _id: String!
    title: String!
    description: String!
    location: String!
    price: Float!
    type: PropertyType!
    images: [String!]!
    funded: Boolean!
    fundingGoal: Float!
    currentFunding: Float!
    roi: Float!
    tokenAddress: String
    mintAuthority: String
    investments: [Investment!]!
    investorCount: Int!
    fundingProgress: Float!
    createdAt: Date!
    updatedAt: Date!
  }

  input CreatePropertyInput {
    title: String!
    description: String!
    location: String!
    price: Float!
    type: PropertyType!
    images: [String!]!
    fundingGoal: Float!
    roi: Float!
  }

  input UpdatePropertyInput {
    id: String!
    title: String
    description: String
    location: String
    price: Float
    type: PropertyType
    images: [String!]
    fundingGoal: Float
    roi: Float
    funded: Boolean
    currentFunding: Float
    tokenAddress: String
    mintAuthority: String
  }

  input PurchasePropertyInput {
    propertyId: String!
    fractionCount: Int!
    totalAmount: Float!
    pricePerFraction: Float!
  }

  input PropertyFilterInput {
    type: PropertyType
    funded: Boolean
    minPrice: Float
    maxPrice: Float
    location: String
    minRoi: Float
    maxRoi: Float
  }

  type PropertyConnection {
    edges: [PropertyEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PropertyEdge {
    node: Property!
    cursor: String!
  }

  extend type Query {
    property(id: String!): Property
    properties(filter: PropertyFilterInput, first: Int, after: String): [Property!]!
    featuredProperties: [Property!]!
    myInvestedProperties: [Property!]!
  }

  extend type Mutation {
    createProperty(input: CreatePropertyInput!): Property!
    updateProperty(input: UpdatePropertyInput!): Property!
    purchaseProperty(input: PurchasePropertyInput!): Property!
    deleteProperty(id: String!): Boolean!
  }

  extend type Subscription {
    propertyUpdated(id: String!): Property!
  }
`

export const resolvers = {
  Query: {
    properties: async (
      _: unknown,
      { filter = {}, first = 10, after }: PropertiesArgs,
      { db }: Context
    ) => {
      try {
        const query: Record<string, any> = {}

        // Build filter query
        if (filter.type) query.type = filter.type.toLowerCase()
        if (filter.funded !== undefined) query.funded = filter.funded
        if (filter.location) query.location = new RegExp(filter.location, 'i')

        // Handle price range
        if (filter.minPrice || filter.maxPrice) {
          query.price = {}
          if (filter.minPrice) query.price.$gte = filter.minPrice
          if (filter.maxPrice) query.price.$lte = filter.maxPrice
        }

        // Handle ROI range
        if (filter.minRoi || filter.maxRoi) {
          query.roi = {}
          if (filter.minRoi) query.roi.$gte = filter.minRoi
          if (filter.maxRoi) query.roi.$lte = filter.maxRoi
        }

        const properties = await db
          .collection('properties')
          .find(query)
          .limit(first)
          .skip(after ? parseInt(after) : 0)
          .toArray()

        return properties
      } catch (error) {
        console.error('Error in properties resolver:', error)
        throw error
      }
    },

    property: async (_: unknown, { id }: { id: string }, { db }: Context) => {
      try {
        console.log('Fetching property:', id)
        const property = await db.collection('properties').findOne({
          _id: id as any,
        })

        if (!property) throw new UserInputError('Property not found')
        return property
      } catch (error) {
        console.error('Error in property resolver:', error)
        throw error
      }
    },

    featuredProperties: async (_: unknown, __: unknown, { db }: Context) => {
      try {
        return await db
          .collection('properties')
          .find({ featured: true })
          .toArray()
      } catch (error) {
        console.error('Error in featuredProperties resolver:', error)
        throw error
      }
    },

    myInvestedProperties: async (
      _: unknown,
      __: unknown,
      { db, user }: Context
    ) => {
      try {
        if (!user) throw new AuthenticationError('Not authenticated')

        // Get all investments for the user
        const investments = await db
          .collection('investments')
          .find({ userId: user._id })
          .toArray()

        // Get unique property IDs
        const propertyIds = Array.from(
          new Set(investments.map((inv) => new ObjectId(inv.propertyId)))
        )

        // Fetch properties
        return await db
          .collection('properties')
          .find({ _id: { $in: propertyIds } })
          .toArray()
      } catch (error) {
        console.error('Error in myInvestedProperties resolver:', error)
        throw error
      }
    },
  },

  Mutation: {
    createProperty: async (
      _: unknown,
      { input }: { input: CreatePropertyInput },
      { db, user }: Context
    ) => {
      try {
        if (!user?.role || user.role !== 'admin') {
          throw new AuthenticationError('Not authorized')
        }

        const property = {
          ...input,
          funded: false,
          currentFunding: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = await db.collection('properties').insertOne(property)
        return {
          ...property,
          _id: result.insertedId,
        }
      } catch (error) {
        console.error('Error in createProperty resolver:', error)
        throw error
      }
    },

    purchaseProperty: async (
      _: unknown,
      { input }: { input: PurchasePropertyInput },
      { user }: Context
    ) => {
      if (!user) {
        // turned off for test users
        // throw new AuthenticationError('Not authenticated');
      }
      const { propertyId, fractionCount, totalAmount } = input
      // Connect to MongoDB
      const { client, db } = await connectToDatabase()
      const session = await client.startSession()
      await db.command({
        collMod: 'investments',
        validationAction: 'warn',
      })
      try {
        await session.withTransaction(async () => {
          // Update property funding
          const property = await db
            .collection('properties')
            .findOne({ _id: propertyId } as any, { session })

          if (!property) {
            throw new UserInputError('Property not found')
          }

          if (property.funded) {
            throw new UserInputError('Property is already fully funded')
          }

          const newFunding = property.currentFunding + totalAmount
          if (newFunding > property.fundingGoal) {
            throw new UserInputError('Purchase would exceed funding goal')
          }

          // Update property
          await db.collection('properties').updateOne(
            { _id: propertyId } as any,
            {
              $set: {
                currentFunding: newFunding,
                funded: newFunding >= property.fundingGoal,
                updatedAt: new Date(),
              },
            },
            { session }
          )

          // Create investment record
          await db.collection('investments').insertOne(
            {
              propertyId: propertyId,
              userId: user ? user._id : 'user_1732106067757',
              amount: totalAmount,
              fractionCount,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { session }
          )
        })
      } finally {
        await session.endSession()
      }

      // Return updated property
      return await db
        .collection('properties')
        .findOne({ _id: propertyId as any })
    },

    updateProperty: async (
      _: unknown,
      { input }: { input: UpdatePropertyInput },
      { db, user }: Context
    ) => {
      try {
        if (!user?.role || user.role !== 'admin') {
          throw new AuthenticationError('Not authorized')
        }

        const { id, ...updateData } = input
        const result = await db.collection('properties').findOneAndUpdate(
          { _id: id as any },
          {
            $set: {
              ...updateData,
              updatedAt: new Date(),
            },
          },
          { returnDocument: 'after' }
        )

        if (!result) throw new UserInputError('Property not found')
        if (!result.value) throw new UserInputError('Property not found')

        const updatedProperty = result.value
        const channel = `${EVENTS.PROPERTY.UPDATED}_${id}`
        await pubsub.publish(channel, {
          propertyUpdated: updatedProperty,
        })

        return updatedProperty
      } catch (error) {
        console.error('Error in updateProperty resolver:', error)
        throw error
      }
    },

    deleteProperty: async (
      _: unknown,
      { id }: { id: string },
      { db, user }: Context
    ) => {
      try {
        if (!user?.role || user.role !== 'admin') {
          throw new AuthenticationError('Not authorized')
        }

        // Check for existing investments
        const investmentCount = await db
          .collection('investments')
          .countDocuments({ propertyId: new ObjectId(id) })

        if (investmentCount > 0) {
          throw new UserInputError(
            'Cannot delete property with existing investments'
          )
        }

        const result = await db
          .collection('properties')
          .deleteOne({ _id: id as any })

        return result.deletedCount === 1
      } catch (error) {
        console.error('Error in deleteProperty resolver:', error)
        throw error
      }
    },
  },

  Subscription: {
    propertyUpdated: {
      subscribe: () => {
        return pubsub.asyncIterator(EVENTS.PROPERTY.UPDATED) as AsyncIterator<
          PubSubEvents['PROPERTY_UPDATED']
        >
      },
    },
  },

  // Field Resolvers
  Property: {
    investments: async (parent: any, _: unknown, { db }: Context) => {
      return await db
        .collection('investments')
        .find({ propertyId: parent._id })
        .toArray()
    },

    investorCount: async (parent: any, _: unknown, { db }: Context) => {
      return await db
        .collection('investments')
        .distinct('userId', { propertyId: parent._id })
        .then((investors) => investors.length)
    },

    fundingProgress: (parent: any) => {
      return (parent.currentFunding / parent.fundingGoal) * 100
    },
  },
}
