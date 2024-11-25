// src/lib/apollo/graphql/queries/investment.ts

import { gql } from 'graphql-tag'

export const GET_INVESTMENTS = gql`
  query GetInvestments(
    $userId: ID
    $propertyId: ID
    $status: InvestmentStatus
    $offset: Int
    $limit: Int
  ) {
    investments(
      userId: $userId
      propertyId: $propertyId
      status: $status
      offset: $offset
      limit: $limit
    ) {
      id
      user {
        id
        address
        name
      }
      property {
        id
        title
        location
      }
      amount
      fractionCount
      status
      purchaseDate
      transactionSignature
    }
  }
`

export const GET_INVESTMENT = gql`
  query GetInvestment($id: ID!) {
    investment(id: $id) {
      id
      user {
        id
        address
        name
      }
      property {
        id
        title
        location
        price
        roi
      }
      amount
      fractionCount
      status
      purchaseDate
      transactionSignature
    }
  }
`