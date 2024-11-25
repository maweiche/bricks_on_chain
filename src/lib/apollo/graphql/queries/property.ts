import { gql } from 'graphql-tag'

export const GET_PROPERTIES = gql`
  query GetProperties($filter: PropertyFilterInput, $first: Int, $after: String) {
    properties(filter: $filter, first: $first, after: $after) {
      edges {
        node {
          id
          title
          description
          location
          price
          type
          images
          funded
          fundingGoal
          currentFunding
          roi
          tokenAddress
          mintAuthority
          investorCount
          fundingProgress
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`

export const GET_PROPERTY = gql`
  query GetProperty($id: ID!) {
    property(id: $id) {
      id
      title
      description
      location
      price
      type
      images
      funded
      fundingGoal
      currentFunding
      roi
      tokenAddress
      mintAuthority
      investments {
        id
        amount
        fractionCount
        status
        purchaseDate
        transactionSignature
      }
      investorCount
      fundingProgress
      createdAt
      updatedAt
    }
  }
`

export const GET_FEATURED_PROPERTIES = gql`
  query GetFeaturedProperties {
    featuredProperties {
      id
      title
      description
      location
      price
      type
      images
      funded
      fundingGoal
      currentFunding
      roi
      fundingProgress
    }
  }
`

export const GET_MY_INVESTED_PROPERTIES = gql`
  query GetMyInvestedProperties {
    myInvestedProperties {
      id
      title
      description
      location
      price
      type
      images
      funded
      fundingGoal
      currentFunding
      roi
      fundingProgress
      investments {
        id
        amount
        fractionCount
        status
        purchaseDate
      }
    }
  }
`