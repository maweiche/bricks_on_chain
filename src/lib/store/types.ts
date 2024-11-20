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
  
  