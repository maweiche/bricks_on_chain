import { gql } from 'graphql-tag'

export const ME_QUERY = gql`
  query Me {
    me {
      id
      address
      name
      email
      avatar
      role
      joinedAt
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

export const GET_USERS = gql`
  query GetUsers($offset: Int, $limit: Int, $role: UserRole) {
    users(offset: $offset, limit: $limit, role: $role) {
      id
      address
      name
      email
      avatar
      role
      joinedAt
    }
  }
`
