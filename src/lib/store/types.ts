import { UserSettings } from '../store'

export interface Property {
  id: string
  title: string
  description: string
  location: string
  price: number
  type: string
  images: string[]
  funded: boolean
  fundingGoal: number
  currentFunding: number
  roi: number
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  address: string
  name?: string
  email?: string
  avatar?: string
  joinedAt: Date
  role: 'user' | 'admin'
  settings?: UserSettings
}

export interface Investment {
  id: string
  propertyId: string
  userId: string
  amount: number
  tokens: number
  status: 'pending' | 'active' | 'completed'
  timestamp: Date
}

export interface Vote {
  id: string
  proposalId: string
  userId: string
  vote: 'for' | 'against'
  timestamp: Date
}

interface Proposal {
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
