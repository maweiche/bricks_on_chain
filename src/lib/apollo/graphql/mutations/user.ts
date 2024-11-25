import { gql } from 'graphql-tag'

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($settings: UserSettingsInput!) {
    updateUserSettings(settings: $settings) {
      id
      settings {
        theme
        notifications {
          email
          push
          investmentUpdates
          marketingUpdates
        }
        display {
          compactView
          showProfitLoss
          currency
        }
      }
    }
  }
`

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      address
      role
      updatedAt
    }
  }
`