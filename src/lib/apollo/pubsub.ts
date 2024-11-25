import { PubSub } from 'graphql-subscriptions'
import type { Document } from 'mongoose'

// Define base model interfaces
interface IProperty extends Document {
  _id: string
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
  createdAt: Date
  updatedAt: Date
}

interface IInvestment extends Document {
  _id: string
  userId: string
  propertyId: string
  amount: number
  fractionCount: number
  status: 'pending' | 'active' | 'completed'
  purchaseDate: Date
  transactionSignature?: string
}

// Define event payload types
export interface PubSubEvents {
  // Property events
  'PROPERTY_UPDATED': { property: IProperty }
  'PROPERTY_CREATED': { property: IProperty }
  'PROPERTY_DELETED': { propertyId: string }
  
  // Investment events
  'INVESTMENT_CREATED': { investment: IInvestment }
  'INVESTMENT_UPDATED': { investment: IInvestment }
  
  // Property-specific events
  [key: `PROPERTY_UPDATED_${string}`]: { property: IProperty }
  [key: `INVESTMENT_CREATED_${string}`]: { investment: IInvestment }
  [key: `INVESTMENT_UPDATED_${string}`]: { investment: IInvestment }
}

export const EVENTS = {
  PROPERTY: {
    UPDATED: 'PROPERTY_UPDATED',
    CREATED: 'PROPERTY_CREATED',
    DELETED: 'PROPERTY_DELETED',
  },
  INVESTMENT: {
    CREATED: 'INVESTMENT_CREATED',
    UPDATED: 'INVESTMENT_UPDATED',
  },
} as const

// Create PubSub instance with proper typing for asyncIterator
const pubsub = new PubSub() as PubSub & {
  asyncIterator<T extends keyof PubSubEvents>(
    triggers: T | T[]
  ): AsyncIterator<PubSubEvents[T]>
}

export { pubsub }

// Type guard for checking if a string is a valid event
export function isValidEvent(event: string | number): event is keyof PubSubEvents {
  return event in pubsub
}