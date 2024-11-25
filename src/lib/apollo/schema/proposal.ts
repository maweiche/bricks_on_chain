// src/lib/apollo/schema/proposal.ts

import { Proposal } from '@/lib/models'
import { AuthenticationError, UserInputError } from 'apollo-server'
import { pubsub, EVENTS } from '../pubsub'
import type { 
  Context,
  CreateProposalInput, 
  VoteInput, 
  ProposalsQueryInput,
  ProposalStatus 
} from '../types'

export const typeDefs = `#graphql
  enum ProposalType {
    PROPERTY_IMPROVEMENT
    MAINTENANCE
    POLICY_CHANGE
  }

  enum ProposalStatus {
    ACTIVE
    PASSED
    REJECTED
    EXECUTED
  }

  type VotingPower {
    for: Int!
    against: Int!
    total: Int!
  }

  type ProposalVotes {
    for: [ID!]!
    against: [ID!]!
  }

  type Proposal {
    id: ID!
    title: String!
    description: String!
    creator: User!
    type: ProposalType!
    status: ProposalStatus!
    startDate: Date!
    endDate: Date!
    propertyId: ID
    requiredQuorum: Int!
    votingPower: VotingPower!
    votes: ProposalVotes!
    createdAt: Date!
    updatedAt: Date!
  }

  type ProposalConnection {
    nodes: [Proposal!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  input CreateProposalInput {
    title: String!
    description: String!
    type: ProposalType!
    startDate: Date!
    endDate: Date!
    propertyId: ID
    requiredQuorum: Int!
  }

  input VoteInput {
    proposalId: ID!
    vote: String!
  }

  input ProposalsQueryInput {
    offset: Int
    limit: Int
    status: ProposalStatus
    type: ProposalType
    propertyId: ID
  }

  extend type Query {
    proposals(input: ProposalsQueryInput): ProposalConnection!
    proposal(id: ID!): Proposal
  }

  extend type Mutation {
    createProposal(input: CreateProposalInput!): Proposal!
    vote(input: VoteInput!): Proposal!
  }

  extend type Subscription {
    proposalUpdated(id: ID!): Proposal!
  }
`

export const resolvers = {
  Query: {
    // ... rest of your resolvers stay the same ...
  },

  Mutation: {
    createProposal: async (
      _parent: unknown,
      { input }: { input: CreateProposalInput },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError('Authentication required')

      const proposal = await Proposal.create({
        ...input,
        creatorId: user.id,
        status: 'ACTIVE' as ProposalStatus,
        votingPower: { for: 0, against: 0, total: 0 },
        votes: { for: [], against: [] }
      })

      await pubsub.publish(EVENTS.PROPOSAL.CREATED, {
        proposalCreated: proposal
      })

      return proposal
    },

    vote: async (
      _parent: unknown,
      { input: { proposalId, vote } }: { input: VoteInput },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError('Authentication required')

      const proposal = await Proposal.findById(proposalId)
      if (!proposal) throw new UserInputError('Proposal not found')

      if (proposal.status !== 'ACTIVE') {
        throw new UserInputError('Proposal is not active')
      }

      if (
        proposal.votes.for.includes(user.id) ||
        proposal.votes.against.includes(user.id)
      ) {
        throw new UserInputError('Already voted')
      }

      const voteArray = vote === 'for' ? 'for' : 'against'
      
      await Proposal.findByIdAndUpdate(
        proposalId,
        {
          $push: { [`votes.${voteArray}`]: user.id },
          $inc: {
            [`votingPower.${voteArray}`]: 1,
            'votingPower.total': 1
          }
        },
        { new: true }
      )

      const updatedProposal = await Proposal.findById(proposalId)
      if (!updatedProposal) throw new UserInputError('Proposal not found')

      const channel = `PROPOSAL_UPDATED_${proposalId}` as const
      await pubsub.publish(channel, {
        proposalUpdated: updatedProposal
      })

      return updatedProposal
    }
  },

  Subscription: {
    proposalUpdated: {
      subscribe: (_parent: unknown, { id }: { id: string }) => {
        const channel = `PROPOSAL_UPDATED_${id}`
        return (pubsub as any).asyncIterator(
          channel
        )
      }
    }
  }
}