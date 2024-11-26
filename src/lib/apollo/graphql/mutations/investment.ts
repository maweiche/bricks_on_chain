import { gql } from 'graphql-tag'

export const CREATE_INVESTMENT = gql`
  mutation CreateInvestment($input: CreateInvestmentInput!) {
    createInvestment(input: $input) {
      id
      user {
        id
        address
      }
      property {
        id
        title
        currentFunding
        fundingGoal
      }
      amount
      fractionCount
      status
      purchaseDate
      transactionSignature
    }
  }
`

export const CANCEL_INVESTMENT = gql`
  mutation CancelInvestment($id: ID!) {
    cancelInvestment(id: $id) {
      id
      status
      updatedAt
    }
  }
`
