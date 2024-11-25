import { Proposal } from '@/lib/models'
import { AuthenticationError, UserInputError } from 'apollo-server'
import type { Context } from '../types'
import type { Document } from 'mongoose'

interface ProposalDocument extends Document {
  title: string
  description: string
  type: 'PROPERTY_IMPROVEMENT' | 'MAINTENANCE' | 'POLICY_CHANGE' | 'OTHER'
  status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED'
  creatorId: string
  startDate: Date
  endDate: Date
  propertyId?: string
  requiredQuorum: number
  votingPower: {
    for: number
    against: number
    total: number
  }
  votes: {
    for: string[]
    against: string[]
  }
}

interface CreateProposalInput {
  title: string
  description: string
  type: 'PROPERTY_IMPROVEMENT' | 'MAINTENANCE' | 'POLICY_CHANGE' | 'OTHER'
  startDate: Date
  endDate: Date
  propertyId?: string
  requiredQuorum: number
}

interface VoteInput {
  proposalId: string
  vote: 'for' | 'against'
}

interface ProposalsQueryInput {
  offset?: number
  limit?: number
  status?: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED'
}

export const typeDefs = `#graphql
  type Vote {
    id: ID!
    proposalId: ID!
    userId: ID!
    vote: String!
    timestamp: Date!
  }
  
  type Proposal {
    id: ID!
    title: String!
    description: String!
    creator: User!
    type: String!
    status: String!
    startDate: Date!
    endDate: Date!
    propertyId: ID
    requiredQuorum: Int!
    votingPower: {
      for: Int!
      against: Int!
      total: Int!
    }
    votes: {
      for: [ID!]!
      against: [ID!]!
    }
    createdAt: Date!
    updatedAt: Date!
  }
  
  type CreateProposalResponse {
    proposal: Proposal!
  }
  
  type CreateProposalError {
    code: String!
    message: String!
    details: JSON
  }
  
  input CreateProposalInput {
    title: String!
    description: String!
    type: String!
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
    status: String
  }
  
  extend type Query {
    proposals(input: ProposalsQueryInput): [Proposal!]!
  }
  
  extend type Mutation {
    createProposal(input: CreateProposalInput!): CreateProposalResponse
    vote(input: VoteInput!): Proposal
  }
`

export const resolvers = {
  Query: {
    proposals: async (_: any, { input }: { input: ProposalsQueryInput }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view proposals')
      }

      const query: Record<string, any> = {}

      if (input?.status) {
        query.status = input.status
      }

      const proposals = await Proposal.find(query)
      return proposals
    }
  },
  Mutation: {
    createProposal: async (_: any, { input }: { input: CreateProposalInput }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create a proposal')
      }

      const proposal = new Proposal({
        ...input,
        creatorId: user.id
      })

      await proposal.save()

      return { proposal }
    },
    vote: async (_: any, { input }: { input: VoteInput }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to vote')
      }

      const proposal = await Proposal.findById(input.proposalId)

      if (!proposal) {
        throw new UserInputError('Proposal not found')
      }

      if (proposal.votes.for.includes(user.id) || proposal.votes.against.includes(user.id)) {
        throw new UserInputError('You have already voted on this proposal')
      }

      if (input.vote === 'for') {
        proposal.votes.for.push(user.id)
        proposal.votingPower.for++
      } else {
        proposal.votes.against.push(user.id)
        proposal.votingPower.against++
      }

      proposal.votingPower.total++

      await proposal.save()

      return proposal
    }
  }
}

export interface Vote {
    id: string
    proposalId: string
    userId: string
    vote: 'for' | 'against'
    timestamp: Date
  }
  
  export interface Proposal {
    id: string
    title: string
    description: string
    creator: {
      id: string
      address: string
      name?: string
    }
    type: 'PROPERTY_IMPROVEMENT' | 'MAINTENANCE' | 'POLICY_CHANGE' | 'OTHER'
    status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED'
    startDate: Date
    endDate: Date
    propertyId?: string
    requiredQuorum: number
    votingPower: {
      for: number
      against: number
      total: number
    }
    votes: {
      for: string[]
      against: string[]
    }
    createdAt: Date
    updatedAt: Date
  }
  
  export interface CreateProposalResponse {
    proposal: {
      id: string
      title: string
      description: string
      type: 'PROPERTY_IMPROVEMENT' | 'MAINTENANCE' | 'POLICY_CHANGE' | 'OTHER'
      status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED'
      creator: {
        id: string
        address: string
        name?: string
      }
      startDate: string
      endDate: string
      propertyId?: string
      requiredQuorum: number
      votingPower: {
        for: number
        against: number
        total: number
      }
      votes: {
        for: string[]
        against: string[]
      }
      createdAt: string
      updatedAt: string
    }
  }
  
  export interface CreateProposalError {
    code: string
    message: string
    details?: Record<string, string[]>
  }