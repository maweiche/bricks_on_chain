import { PubSub } from 'graphql-subscriptions'
import { IProperty, IInvestment, IProposal } from './types'

// Define event payload types
export interface PubSubEvents {
  // Property events
  PROPERTY_UPDATED: { property: IProperty }
  PROPERTY_CREATED: { property: IProperty }
  PROPERTY_DELETED: { propertyId: string }

  // Investment events
  INVESTMENT_CREATED: { investment: IInvestment }
  INVESTMENT_UPDATED: { investment: IInvestment }

  // Proposal events
  PROPOSAL_CREATED: { proposal: IProposal }
  PROPOSAL_UPDATED: { proposal: IProposal }
  PROPOSAL_DELETED: { proposalId: string }
  PROPOSAL_VOTE: { proposal: IProposal }

  // Settings events
  SETTINGS_UPDATED: { settings: any }

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
  SETTINGS: {
    UPDATED: 'SETTINGS_UPDATED',
  },
  PROPOSAL: {
    CREATED: 'PROPOSAL_CREATED',
    VOTE: (id: string) => `PROPOSAL_VOTE_${id}`,
    UPDATED: (id: string) => `PROPOSAL_UPDATED_${id}`,
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
export function isValidEvent(
  event: string | number
): event is keyof PubSubEvents {
  return event in pubsub
}
