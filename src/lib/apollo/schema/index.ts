import { makeExecutableSchema } from '@graphql-tools/schema'
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge'
import { print } from 'graphql'
import { scalarTypeDefs, scalarResolvers } from './scalars'
import { typeDefs as userTypeDefs, resolvers as userResolvers } from './user'
import {
  typeDefs as propertyTypeDefs,
  resolvers as propertyResolvers,
} from './property'
import {
  typeDefs as investmentTypeDefs,
  resolvers as investmentResolvers,
} from './investment'
import {
  typeDefs as proposalTypeDefs,
  resolvers as proposalResolvers,
} from './proposal'
import {
  typeDefs as settingsTypeDefs,
  resolvers as settingsResolvers,
} from './settings'

// Debug: Log individual typeDefs and resolvers
console.log('Loaded TypeDefs:', {
  scalar: !!scalarTypeDefs,
  user: !!userTypeDefs,
  property: !!propertyTypeDefs,
  investment: !!investmentTypeDefs,
  proposal: !!proposalTypeDefs,
  settings: !!settingsTypeDefs,
})

console.log('Loaded Resolvers:', {
  scalar: Object.keys(scalarResolvers || {}),
  user: Object.keys(userResolvers?.Query || {}).concat(
    Object.keys(userResolvers?.Mutation || {})
  ),
  property: Object.keys(propertyResolvers?.Query || {}).concat(
    Object.keys(propertyResolvers?.Mutation || {})
  ),
  investment: Object.keys(investmentResolvers?.Query || {}).concat(
    Object.keys(investmentResolvers?.Mutation || {})
  ),
  proposal: Object.keys(proposalResolvers?.Query || {}).concat(
    Object.keys(proposalResolvers?.Mutation || {})
  ),
  settings: Object.keys(settingsResolvers?.Query || {}).concat(
    Object.keys(settingsResolvers?.Mutation || {})
  ),
})

const typeDefs = mergeTypeDefs([
  scalarTypeDefs,
  userTypeDefs,
  propertyTypeDefs,
  investmentTypeDefs,
  proposalTypeDefs,
  settingsTypeDefs,
])

const resolvers = mergeResolvers([
  scalarResolvers,
  userResolvers,
  propertyResolvers,
  investmentResolvers,
  proposalResolvers,
  settingsResolvers,
])

// Debug: Log merged schema
console.log('Merged Schema:', print(typeDefs))
console.log(
  'Merged Resolvers Query Methods:',
  Object.keys(resolvers.Query || {})
)
console.log(
  'Merged Resolvers Mutation Methods:',
  Object.keys(resolvers.Mutation || {})
)

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

// Debug: Test schema
const schemaQueries = schema.getQueryType()?.getFields() || {}
console.log('Available Queries in Schema:', Object.keys(schemaQueries))
