import { AuthenticationError, UserInputError } from 'apollo-server'
import type { Context } from '../types'
import { ObjectId } from 'mongodb'

// Types
interface UpdateUserInput {
  name?: string
  email?: string
  avatar?: string
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

export const typeDefs = `
  enum UserRole {
    user
    admin
  }

  type NotificationSettings {
    email: Boolean!
    push: Boolean!
    investmentUpdates: Boolean!
    marketingUpdates: Boolean!
  }

  type DisplaySettings {
    compactView: Boolean!
    showProfitLoss: Boolean!
    currency: Currency!
  }

  type UserSettings {
    theme: Theme
    notifications: NotificationSettings!
    display: DisplaySettings!
  }

  type User {
    _id: ID!
    address: String!
    name: String
    email: String
    avatar: String
    role: UserRole!
    joinedAt: Date!
    settings: UserSettings
    investments: [Investment!]!
  }

  input UpdateUserInput {
    name: String
    email: String
    avatar: String
  }

  input NotificationSettingsInput {
    email: Boolean
    push: Boolean
    investmentUpdates: Boolean
    marketingUpdates: Boolean
  }

  input DisplaySettingsInput {
    compactView: Boolean
    showProfitLoss: Boolean
    currency: Currency
  }

  input UserSettingsInput {
    theme: Theme
    notifications: NotificationSettingsInput
    display: DisplaySettingsInput
  }

  extend type Query {
    me: User
    user(id: ID!): User
    users(offset: Int, limit: Int, role: UserRole): [User!]!
  }

  extend type Mutation {
    updateUser(input: UpdateUserInput!): User!
    updateUserSettings(settings: UserSettingsInput!): User!
    updateUserRole(userId: ID!, role: UserRole!): User!
  }
`

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { user, db }: Context) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      const dbUser = await db
        .collection('users')
        .findOne({ address: user.address })
      if (!dbUser) throw new UserInputError('User not found')

      return dbUser
    },

    user: async (_: unknown, { id }: { id: string }, { db }: Context) => {
      const user = await db
        .collection('users')
        .findOne({ _id: new ObjectId(id) })
      if (!user) throw new UserInputError('User not found')
      return user
    },

    users: async (
      _: unknown,
      { offset = 0, limit = 10, role }: UsersQueryInput,
      { db }: Context
    ) => {
      const query = role ? { role } : {}
      return await db
        .collection('users')
        .find(query)
        .sort({ joinedAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray()
    },
  },

  Mutation: {
    updateUser: async (
      _: unknown,
      { input }: { input: UpdateUserInput },
      { user, db }: Context
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      const updatedUser = await db.collection('users').findOneAndUpdate(
        { address: user.address },
        {
          $set: {
            ...input,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      )
      if (!updatedUser) throw new UserInputError('User not found')
      if (!updatedUser.value) throw new UserInputError('User not found')
      return updatedUser.value
    },

    updateUserSettings: async (
      _: unknown,
      { settings }: { settings: UpdateSettingsInput },
      { user, db }: Context
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated')

      const updatedUser = await db
        .collection('users')
        .findOneAndUpdate(
          { address: user.address },
          { $set: { settings } },
          { returnDocument: 'after' }
        )
      if (!updatedUser) throw new UserInputError('User not found')
      if (!updatedUser.value) throw new UserInputError('User not found')
      return updatedUser.value
    },

    updateUserRole: async (
      _: unknown,
      { userId, role }: UpdateRoleInput,
      { user, db }: Context
    ) => {
      if (!user?.role || user.role !== 'admin') {
        throw new AuthenticationError('Not authorized')
      }

      if (userId === user._id) {
        throw new UserInputError('Cannot change your own role')
      }

      const updatedUser = await db
        .collection('users')
        .findOneAndUpdate(
          { _id: new ObjectId(userId) },
          { $set: { role } },
          { returnDocument: 'after' }
        )
      if (!updatedUser) throw new UserInputError('User not found')
      if (!updatedUser.value) throw new UserInputError('User not found')
      return updatedUser.value
    },
  },

  User: {
    investments: async (
      parent: { _id: string },
      _: unknown,
      { db }: Context
    ) => {
      return await db
        .collection('investments')
        .find({ userId: parent._id })
        .sort({ purchaseDate: -1 })
        .toArray()
    },
  },
}
