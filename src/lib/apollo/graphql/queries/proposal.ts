import { gql } from 'graphql-tag'

export const GET_PROPOSALS = gql`
  query GetProposals($input: ProposalsQueryInput) {
    proposals(input: $input) {
      nodes {
        id
        title
        description
        creator {
          id
          address
          name
        }
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
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`

export const GET_PROPOSAL = gql`
  query GetProposal($id: ID!) {
    proposal(id: $id) {
      id
      title
      description
      creator {
        id
        address
        name
      }
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
      updatedAt
    }
  }
`
