// src/lib/apollo-client.ts

import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: '/api/graphql',
  headers: {
    'x-wallet-address':
      typeof window !== 'undefined'
        ? localStorage.getItem('walletAddress') || ''
        : '',
  },
})

// WebSocket link for subscriptions
const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/graphql`,
          connectionParams: {
            walletAddress: localStorage.getItem('walletAddress') || '',
          },
        })
      )
    : null

// Split links based on operation type
const splitLink =
  typeof window !== 'undefined' && wsLink != null
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          )
        },
        wsLink,
        httpLink
      )
    : httpLink

// Create Apollo Client
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          properties: {
            // Merge function for pagination
            keyArgs: ['filter'],
            merge(existing, incoming, { args }) {
              if (!args) return incoming

              const merged = existing ? existing.edges.slice(0) : []
              const existingNodes = new Set(
                merged.map((edge: { node: { id: any } }) => edge.node.id)
              )

              incoming.edges.forEach((edge: { node: { id: unknown } }) => {
                if (!existingNodes.has(edge.node.id)) {
                  merged.push(edge)
                }
              })

              return {
                ...incoming,
                edges: merged,
              }
            },
          },
        },
      },
    },
  }),
})
