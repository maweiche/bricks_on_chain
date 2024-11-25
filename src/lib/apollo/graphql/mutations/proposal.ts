import { gql } from 'graphql-tag'

export const CREATE_PROPOSAL = gql`
  mutation CreateProposal($input: CreateProposalInput!) {
    createProposal(input: $input) {
      id
      title
      description
      type
      status
      startDate
      endDate
      propertyId
      requiredQuorum
      votingPower {
        for
        against
        total
      }
      votes {
        for
        against
      }
      createdAt
    }
  }
`

export const VOTE_ON_PROPOSAL = gql`
  mutation VoteOnProposal($input: VoteInput!) {
    vote(input: $input) {
      id
      votingPower {
        for
        against
        total
      }
      votes {
        for
        against
      }
      status
      updatedAt
    }
  }
`

export const EXECUTE_PROPOSAL = gql`
  mutation ExecuteProposal($id: ID!) {
    executeProposal(id: $id) {
      id
      status
      updatedAt
    }
  }
`