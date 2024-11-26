import { AuthenticationError, UserInputError } from 'apollo-server'
import { ObjectId } from 'mongodb'
import { pubsub, EVENTS } from '../pubsub'
import type {
  Context,
  CreateProposalInput,
  VoteInput,
  ProposalsQueryInput,
  ProposalStatus,
} from '../types'
import { connectToDatabase } from '@/lib/mongodb'

export const typeDefs = `
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
    proposals: async (
      _parent: unknown,
      { input }: { input: ProposalsQueryInput }
    ) => {
      const { offset = 0, limit = 10, ...query } = input
      const db = (await connectToDatabase()).db
      const proposals = await db
        .collection('proposals')
        .find(query)
        .skip(offset)
        .limit(limit)
        .toArray()

      const totalCount = await db.collection('proposals').countDocuments(query)

      return {
        nodes: proposals,
        pageInfo: { offset, limit },
        totalCount,
      }
    },

    proposal: async (_parent: unknown, { id }: { id: string }) => {
      const db = (await connectToDatabase()).db
      return await db.collection('proposals').findOne({ _id: new ObjectId(id) })
    },
  },

  Mutation: {
    createProposal: async (
      _parent: unknown,
      { input }: { input: CreateProposalInput },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError('Authentication required')
      const db = (await connectToDatabase()).db
      const proposal = await db.collection('proposals').insertOne({
        ...input,
        creatorId: user._id,
        status: 'ACTIVE' as ProposalStatus,
        votingPower: { for: 0, against: 0, total: 0 },
        votes: { for: [], against: [] },
      })

      await pubsub.publish(EVENTS.PROPOSAL.CREATED, {
        proposalCreated: proposal,
      })

      return proposal
    },

    vote: async (
      _parent: unknown,
      { input: { proposalId, vote } }: { input: VoteInput },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError('Authentication required')
      const db = (await connectToDatabase()).db
      const proposal = await db
        .collection('proposals')
        .findOne({ _id: new ObjectId(proposalId) })
      if (!proposal) throw new UserInputError('Proposal not found')

      if (proposal.status !== 'ACTIVE') {
        throw new UserInputError('Proposal is not active')
      }

      if (
        proposal.votes.for.includes(user._id) ||
        proposal.votes.against.includes(user._id)
      ) {
        throw new UserInputError('Already voted')
      }

      const voteArray = vote === 'for' ? 'for' : 'against'

      await db.collection('proposals').findOneAndUpdate(
        { _id: new ObjectId(proposalId) },
        {
          $set: {
            [`votes.${voteArray}`]: [...proposal.votes[voteArray], user._id],
          },
          $inc: {
            [`votingPower.${voteArray}`]: 1,
            'votingPower.total': 1,
          },
        }
      )

      const updatedProposal = await db
        .collection('proposals')
        .findOne({ _id: new ObjectId(proposalId) })
      if (!updatedProposal) throw new UserInputError('Proposal not found')

      const channel = `PROPOSAL_UPDATED_${proposalId}` as const
      await pubsub.publish(channel, {
        proposalUpdated: updatedProposal,
      })

      return updatedProposal
    },
  },

  Subscription: {
    proposalUpdated: {
      subscribe: (_parent: unknown, { id }: { id: string }) => {
        const channel = `PROPOSAL_UPDATED_${id}`
        return (pubsub as any).asyncIterator(channel)
      },
    },
  },
}
