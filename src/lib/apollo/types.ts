import { PubSubEvents } from './pubsub'
import { PubSub } from 'graphql-subscriptions'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Document, ObjectId, Types } from 'mongoose'

// Base document interface
interface BaseDocument {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Model interfaces
export interface IProperty extends BaseDocument {
  title: string
  description: string
  location: string
  price: number
  type: 'house' | 'apartment' | 'commercial'
  images: string[]
  funded: boolean
  fundingGoal: number
  currentFunding: number
  roi: number
  tokenAddress?: string
  mintAuthority?: string
}

export interface IInvestment extends BaseDocument {
  userId: string
  propertyId: string
  amount: number
  fractionCount: number
  status: 'pending' | 'active' | 'completed'
  purchaseDate: Date
  transactionSignature?: string
}

export interface IUser extends BaseDocument {
  address: string
  name?: string
  email?: string
  avatar?: string
  role: 'user' | 'admin'
  settings: {
    theme: 'light' | 'dark' | 'system'
    notifications: {
      email: boolean
      push: boolean
      investmentUpdates: boolean
      marketingUpdates: boolean
    }
    display: {
      compactView: boolean
      showProfitLoss: boolean
      currency: 'USD' | 'EUR' | 'GBP'
    }
  }
  joinedAt: Date
}

export interface User {
  id: string
  address: string
  role: 'user' | 'admin'
}

export interface Context {
  req: NextApiRequest
  res: NextApiResponse
  user?: User
  pubsub: PubSub & {
    asyncIterator<T extends keyof PubSubEvents>(
      triggers: T | T[]
    ): AsyncIterator<PubSubEvents[T]>
  }
}
// Error classes
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class UserInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserInputError'
  }
}

// Utility types
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  hasMore: boolean
  nextCursor?: string
}

export interface SubscriptionFilter {
  propertyId?: string
  userId?: string
}

export type ProposalType = 'PROPERTY_IMPROVEMENT' | 'MAINTENANCE' | 'POLICY_CHANGE' | 'OTHER'
export type ProposalStatus = 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED'

export interface VotingPower {
  for: number
  against: number
  total: number
}

export interface Votes {
  for: string[]
  against: string[]
}

export interface IProposal extends Document {
  title: string
  description: string
  type: ProposalType
  status: ProposalStatus
  creatorId: Types.ObjectId
  startDate: Date
  endDate: Date
  propertyId?: Types.ObjectId
  requiredQuorum: number
  votingPower: VotingPower
  votes: Votes
  createdAt: Date
  updatedAt: Date
}

export interface CreateProposalInput {
  title: string
  description: string
  type: ProposalType
  startDate: Date
  endDate: Date
  propertyId?: string
  requiredQuorum: number
}

export interface VoteInput {
  proposalId: string
  vote: 'for' | 'against'
}

export interface ProposalFilters {
  status?: ProposalStatus
  type?: ProposalType
  propertyId?: string
  creatorId?: string
  offset?: number
  limit?: number
}

export interface ProposalConnection {
  nodes: IProposal[]
  pageInfo: {
    hasNextPage: boolean
    endCursor?: string
  }
  totalCount: number
}


export interface CreateProposalInput {
  title: string
  description: string
  type: ProposalType
  startDate: Date
  endDate: Date
  propertyId?: string
  requiredQuorum: number
}

export interface VoteInput {
  proposalId: string
  vote: 'for' | 'against'
}

export interface ProposalsQueryInput {
  offset?: number
  limit?: number
  status?: ProposalStatus
  type?: ProposalType
  propertyId?: string
}