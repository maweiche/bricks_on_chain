import { gql } from 'graphql-tag'

export const GET_PROPERTIES = gql`
  query GetProperties {
    properties {
      _id
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
      createdAt
      updatedAt
    }
  }
`

export const GET_PROPERTY = gql`
  query GetProperty($id: String!) {
    property(id: $id) {
      _id
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
      createdAt
      updatedAt
    }
  }
`

export const GET_FEATURED_PROPERTIES = gql`
  query GetFeaturedProperties {
    featuredProperties {
      _id
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
      createdAt
      updatedAt
    }
  }
`

export const GET_MY_INVESTED_PROPERTIES = gql`
  query GetMyInvestedProperties {
    myInvestedProperties {
      _id
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
      investments {
        _id
        amount
        fractionCount
        status
        purchaseDate
      }
      createdAt
      updatedAt
    }
  }
`
