import { gql } from 'graphql-tag'

export const CREATE_PROPERTY = gql`
  mutation CreateProperty($input: CreatePropertyInput!) {
    createProperty(input: $input) {
      id
      title
      description
      location
      price
      type
      images
      fundingGoal
      roi
      createdAt
    }
  }
`
export const PURCHASE_PROPERTY = gql`
  mutation PurchaseProperty($input: PurchasePropertyInput!) {
    purchaseProperty(input: $input) {
      _id
      title
      currentFunding
      fundingGoal
      funded
    }
  }
`

export const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($input: UpdatePropertyInput!) {
    updateProperty(input: $input) {
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
      updatedAt
    }
  }
`

export const DELETE_PROPERTY = gql`
  mutation DeleteProperty($id: ID!) {
    deleteProperty(id: $id)
  }
`
