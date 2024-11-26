import gql from 'graphql-tag'

// Import individual type definitions
import { typeDefs as userTypeDefs } from './user'
import { typeDefs as propertyTypeDefs } from './property'
import { typeDefs as investmentTypeDefs } from './investment'
import { typeDefs as proposalTypeDefs } from './proposal'
import { typeDefs as settingsTypeDefs } from './settings'
import { scalarTypeDefs } from './scalars'

// Base type definitions
export const baseTypeDefs = gql`
  # Base types that tie everything together
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`

// Merge all type definitions
export const typeDefs = [
  baseTypeDefs,
  scalarTypeDefs,
  userTypeDefs,
  propertyTypeDefs,
  investmentTypeDefs,
  proposalTypeDefs,
  settingsTypeDefs,
]

export default typeDefs
