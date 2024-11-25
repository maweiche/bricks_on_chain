import { User, Investment } from '@/lib/models'
import { AuthenticationError, UserInputError } from 'apollo-server'
import type { Context } from '../types'
import type { Document } from 'mongoose'

interface UserDocument extends Document {
  address: string
  name?: string
  email?: string
  avatar?: string
  role: 'user' | 'admin'
  joinedAt: Date
  settings: {
    theme?: string
    notifications: {
      email: boolean
      push: boolean
      investmentUpdates: boolean
      marketingUpdates: boolean
    }
    display: {
      compactView: boolean
      showProfitLoss: boolean
      currency: string
    }
  }
}

interface UpdateSettingsInput {
  theme?: string
  notifications?: {
    email?: boolean
    push?: boolean
    investmentUpdates?: boolean
    marketingUpdates?: boolean
  }
  display?: {
    compactView?: boolean
    showProfitLoss?: boolean
    currency?: string
  }
}

interface UpdateRoleInput {
  userId: string
  role: 'user' | 'admin'
}

interface UsersQueryInput {
  offset?: number
  limit?: number
  role?: 'user' | 'admin'
}

export const typeDefs = `#graphql
  enum UserRole {
    user
    admin
  }

  type NotificationsSettings {
    email: Boolean!
    push: Boolean!
    investmentUpdates: Boolean!
    marketingUpdates: Boolean!
  }

  type DisplaySettings {
    compactView: Boolean!
    showProfitLoss: Boolean!
    currency: String!
  }

  type UserSettings {
    theme: String
    notifications: NotificationsSettings!
    display: DisplaySettings!
  }

  type User {
    id: ID!
    address: String!
    name: String
    email: String
    avatar: String
    role: UserRole!
    joinedAt: Date!
    settings: UserSettings
    investments: [Investment!]!
  }

  input NotificationsSettingsInput {
    email: Boolean
    push: Boolean
    investmentUpdates: Boolean
    marketingUpdates: Boolean
  }

  input DisplaySettingsInput {
    compactView: Boolean
    showProfitLoss: Boolean
    currency: String
  }

  input UserSettingsInput {
    theme: String
    notifications: NotificationsSettingsInput
    display: DisplaySettingsInput
  }

  extend type Query {
    me: User
    user(id: ID!): User
    users(offset: Int, limit: Int, role: UserRole): [User!]!
  }

  extend type Mutation {
    updateUserSettings(settings: UserSettingsInput!): User!
    updateUserRole(userId: ID!, role: UserRole!): User!
  }
`

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { user }: Context) => {
      if (!user) throw new AuthenticationError('Not authenticated')
      
      const dbUser = await User.findOne({ address: user.address })
      if (!dbUser) throw new UserInputError('User not found')
      
      return dbUser
    },
    
    user: async (_: unknown, { id }: { id: string }) => {
      const user = await User.findById(id)
      if (!user) throw new UserInputError('User not found')
      return user
    },
    
    users: async (_: unknown, { offset = 0, limit = 10, role }: UsersQueryInput) => {
      const query = role ? { role } : {}
      return await User.find(query)
        .sort({ joinedAt: -1 })
        .skip(offset)
        .limit(limit)
    },
  },

  Mutation: {
    updateUser: async (
      _: unknown, 
      { input }: { input: Partial<typeof User> }, 
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      const updatedUser = await User.findOneAndUpdate(
        { address: user.address },
        { 
          $set: {
            ...input,
            updatedAt: new Date()
          }
        },
        { new: true }
      )

      if (!updatedUser) throw new UserInputError('User not found')
      return updatedUser
    },
    updateUserSettings: async (_: unknown, { settings }: { settings: UpdateSettingsInput }, { user }: Context) => {
      if (!user) throw new AuthenticationError('Not authenticated')
      
      const updatedUser = await User.findOneAndUpdate(
        { address: user.address },
        { $set: { settings } },
        { new: true, runValidators: true }
      )
      
      if (!updatedUser) throw new UserInputError('User not found')
      return updatedUser
    },

    updateUserRole: async (_: unknown, { userId, role }: UpdateRoleInput, { user }: Context) => {
      if (!user?.role || user.role !== 'admin') {
        throw new AuthenticationError('Not authorized')
      }

      // Prevent admin from changing their own role
      if (userId === user.id) {
        throw new UserInputError('Cannot change your own role')
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { role } },
        { new: true, runValidators: true }
      )

      if (!updatedUser) throw new UserInputError('User not found')
      return updatedUser
    },
  },

  User: {
    investments: async (parent: UserDocument) => {
      return await Investment.find({ userId: parent._id })
        .sort({ purchaseDate: -1 })
    },
  },
}