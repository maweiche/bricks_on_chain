import { makeExecutableSchema } from '@graphql-tools/schema'
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge'
import { scalarTypeDefs, scalarResolvers } from './scalars'
import { typeDefs as userTypeDefs, resolvers as userResolvers } from './user'
import { typeDefs as propertyTypeDefs, resolvers as propertyResolvers } from './property'
import { typeDefs as investmentTypeDefs, resolvers as investmentResolvers } from './investment'
import { typeDefs as proposalTypeDefs, resolvers as proposalResolvers } from './proposal'
import { typeDefs as settingsTypeDefs, resolvers as settingsResolvers } from './settings'

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

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})