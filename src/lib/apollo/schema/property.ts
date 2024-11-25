import { AuthenticationError, UserInputError } from 'apollo-server'
import { Property, Investment } from '@/lib/models'
import { EVENTS, pubsub, PubSubEvents } from '../pubsub'

import type { Context } from '../types'
import type { FilterQuery } from 'mongoose'
import { PubSub } from 'graphql-subscriptions'
import { string } from 'zod';

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

export const typeDefs = `#graphql
  enum PropertyType {
    house
    apartment
    commercial
  }

  type Property {
    id: ID!
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
    id: ID!
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
    property(id: ID!): Property
    properties(
      filter: PropertyFilterInput
      first: Int
      after: String
    ): PropertyConnection!
    featuredProperties: [Property!]!
    myInvestedProperties: [Property!]!
  }

  extend type Mutation {
    createProperty(input: CreatePropertyInput!): Property!
    updateProperty(input: UpdatePropertyInput!): Property!
    deleteProperty(id: ID!): Boolean!
  }

  extend type Subscription {
    propertyUpdated(id: ID!): Property!
  }
`

export const resolvers = {
  Query: {
    property: async (_: unknown, { id }: { id: string }) => {
      const property = await Property.findById(id)
      if (!property) throw new UserInputError('Property not found')
      return property
    },

    properties: async (_: unknown, { filter = {}, first = 10, after }: PropertiesArgs) => {
      const query: FilterQuery<typeof Property> = {}
      
      if (filter?.type) query.type = filter.type
      if (filter?.funded !== undefined) query.funded = filter.funded
      if (filter?.minPrice) query.price = { $gte: filter.minPrice }
      if (filter?.maxPrice) {
        query.price = { ...query.price, $lte: filter.maxPrice }
      }
      if (filter?.location) {
        query.location = { $regex: filter.location, $options: 'i' }
      }
      if (filter?.minRoi) query.roi = { $gte: filter.minRoi }
      if (filter?.maxRoi) {
        query.roi = { ...query.roi, $lte: filter.maxRoi }
      }

      if (after) {
        query._id = { $gt: after }
      }

      const properties = await Property.find(query)
        .sort({ _id: 1 })
        .limit(first + 1)

      const hasNextPage = properties.length > first
      const edges = properties.slice(0, first).map(property => ({
        node: property,
        cursor: property._id.toString(),
      }))

      const totalCount = await Property.countDocuments(query)

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount,
      }
    },

    featuredProperties: async () => {
      return await Property.find({ featured: true }).limit(6)
    },

    myInvestedProperties: async (_: unknown, __: unknown, { user }: Context) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      const investments = await Investment.find({ userId: user.id })
      const propertyIds = Array(new Set(investments.map(inv => inv.propertyId)))
      
      return await Property.find({ _id: { $in: propertyIds } })
    },
  },

  Mutation: {
    createProperty: async (_: unknown, { input }: { input: CreatePropertyInput }, { user }: Context) => {
      if (!user?.role || user.role !== 'admin') {
        throw new AuthenticationError('Not authorized')
      }

      const property = await Property.create({
        ...input,
        funded: false,
        currentFunding: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return property
    },

    updateProperty: async (_: unknown, { input }: { input: UpdatePropertyInput }, { user }: Context) => {
      if (!user?.role || user.role !== 'admin') {
        throw new AuthenticationError('Not authorized')
      }

      const { id, ...updateData } = input
      const property = await Property.findByIdAndUpdate(
        id,
        { 
          $set: { 
            ...updateData,
            updatedAt: new Date(),
          }
        },
        { new: true }
      )

      if (!property) throw new UserInputError('Property not found')

      const channel = `${EVENTS.PROPERTY.UPDATED}_${id}`
      await pubsub.publish(channel, {
        propertyUpdated: property
      })

      return property
    },

    deleteProperty: async (_: unknown, { id }: { id: string }, { user }: Context) => {
      if (!user?.role || user.role !== 'admin') {
        throw new AuthenticationError('Not authorized')
      }

      const investmentCount = await Investment.countDocuments({ propertyId: id })
      if (investmentCount > 0) {
        throw new UserInputError('Cannot delete property with existing investments')
      }

      const result = await Property.deleteOne({ _id: id })
      return result.deletedCount === 1
    },
  },

  Subscription: {
    propertyUpdated: {
      subscribe: (_: unknown, { id }: { id: string }) => {
        return pubsub.asyncIterator(EVENTS.PROPERTY.UPDATED) as AsyncIterator<PubSubEvents['PROPERTY_UPDATED']>
      }
    }
  },

  Property: {
    investments: async (parent: { id: string }) => {
      return await Investment.find({ propertyId: parent.id })
    },

    investorCount: async (parent: { id: string }) => {
      const investments = await Investment.find({ propertyId: parent.id })
      const uniqueInvestors = Array.from(
        new Set(investments.map(inv => inv.userId))
      )
      return uniqueInvestors.length
    },

    fundingProgress: (parent: { currentFunding: number; fundingGoal: number }) => {
      return (parent.currentFunding / parent.fundingGoal) * 100
    },
  },
}