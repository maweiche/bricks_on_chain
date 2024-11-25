// src/lib/apollo/schema/settings.ts

import { User } from '@/lib/models'
import { AuthenticationError, UserInputError } from 'apollo-server'
import type { Context } from '../types'
import { pubsub, EVENTS } from '../pubsub'

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    investmentUpdates: boolean
    marketingUpdates: boolean
  }
  display: {
    compactView: boolean
    showProfitLoss: boolean
    currency: 'USD' | 'EUR' | 'GBP'
  }
}

export const typeDefs = `#graphql
  enum Theme {
    light
    dark
    system
  }

  enum Currency {
    USD
    EUR
    GBP
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
    theme: Theme!
    notifications: NotificationSettings!
    display: DisplaySettings!
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

  input UpdateUserSettingsInput {
    theme: Theme
    notifications: NotificationSettingsInput
    display: DisplaySettingsInput
  }

  extend type Query {
    userSettings: UserSettings!
  }

  extend type Mutation {
    updateUserSettings(input: UpdateUserSettingsInput!): UserSettings!
  }
`

export const resolvers = {
  Query: {
    userSettings: async (_: unknown, __: unknown, { user }: Context) => {
      if (!user) throw new AuthenticationError('Authentication required')

      const dbUser = await User.findById(user.id)
      if (!dbUser) throw new UserInputError('User not found')

      return dbUser.settings || {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          investmentUpdates: true,
          marketingUpdates: false,
        },
        display: {
          compactView: false,
          showProfitLoss: true,
          currency: 'USD',
        }
      }
    }
  },

  Mutation: {
    updateUserSettings: async (
      _: unknown,
      { input }: { input: Partial<UserSettings> },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError('Authentication required')

      const dbUser = await User.findById(user.id)
      if (!dbUser) throw new UserInputError('User not found')

      // Merge new settings with existing ones
      const updatedSettings = {
        ...dbUser.settings,
        ...input,
        notifications: {
          ...dbUser.settings?.notifications,
          ...input.notifications
        },
        display: {
          ...dbUser.settings?.display,
          ...input.display
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { 
          $set: { 
            settings: updatedSettings,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      )

      if (!updatedUser) throw new UserInputError('Failed to update settings')

      await pubsub.publish(EVENTS.SETTINGS.UPDATED, {
        settingsUpdated: updatedUser.settings
      })

      return updatedUser.settings
    }
  }
}