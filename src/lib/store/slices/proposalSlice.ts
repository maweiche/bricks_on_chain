import { StateCreator } from 'zustand'
import { Property, User } from '../types'

export enum Status {
  ACTIVE = 'ACTIVE',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  AVAILABLE = 'available',
  FUNDED = 'funded',
  ALL = 'all',
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
  status: Status
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

export interface ProposalFilters {
  status?: Status
  type?: 'PROPERTY_IMPROVEMENT' | 'MAINTENANCE' | 'POLICY_CHANGE' | 'OTHER'
  propertyId?: string
  search?: string
}

export interface ProposalSlice {
  proposals: Proposal[]
  selectedProposal: Proposal | null
  proposalFilters: ProposalFilters
  proposalLoading: boolean
  proposalError: string | null

  // Actions remain the same
  setProposals: (proposals: Proposal[]) => void
  setSelectedProposal: (proposal: Proposal | null) => void
  setProposalFilters: (filters: ProposalFilters) => void
  setProposalLoading: (loading: boolean) => void
  setProposalError: (error: string | null) => void

  // CRUD operations remain the same
  createProposal: (
    proposal: Omit<
      Proposal,
      'id' | 'createdAt' | 'updatedAt' | 'status' | 'votingPower' | 'votes'
    >
  ) => Promise<void>
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<void>
  deleteProposal: (id: string) => Promise<void>

  // Renamed vote operations
  submitProposalVote: (
    proposalId: string,
    vote: 'for' | 'against',
    userAddress: string,
    votingPower: number
  ) => Promise<void> // renamed from vote
  removeProposalVote: (proposalId: string, userAddress: string) => Promise<void> // renamed from removeVote

  // Utilities remain the same
  calculateVotingPower: (userInvestments: any[]) => number
  getFilteredProposals: () => Proposal[]
  checkUserVote: (
    proposalId: string,
    userAddress: string
  ) => 'for' | 'against' | null
  getUserVotingPower: (userAddress: string) => Promise<number>
}

export const createProposalSlice: StateCreator<ProposalSlice> = (set, get) => ({
  proposals: [],
  selectedProposal: null,
  proposalFilters: {},
  proposalLoading: false,
  proposalError: null,

  // Basic state setters
  setProposals: (proposals) => set({ proposals }),
  setSelectedProposal: (proposal) => set({ selectedProposal: proposal }),
  setProposalFilters: (filters) => set({ proposalFilters: filters }),
  setProposalLoading: (loading) => set({ proposalLoading: loading }),
  setProposalError: (error) => set({ proposalError: error }),

  // CRUD operations
  createProposal: async (proposalData) => {
    const { setProposalLoading, setProposalError } = get()
    setProposalLoading(true)

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposalData),
      })

      if (!response.ok) throw new Error('Failed to create proposal')

      const newProposal = await response.json()
      set((state) => ({
        proposals: [...state.proposals, newProposal],
      }))
    } catch (error) {
      setProposalError(
        error instanceof Error ? error.message : 'Failed to create proposal'
      )
      throw error
    } finally {
      setProposalLoading(false)
    }
  },

  updateProposal: async (id, updates) => {
    const { setProposalLoading, setProposalError } = get()
    setProposalLoading(true)

    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update proposal')

      const updatedProposal = await response.json()
      set((state) => ({
        proposals: state.proposals.map((p) =>
          p.id === id ? updatedProposal : p
        ),
      }))
    } catch (error) {
      setProposalError(
        error instanceof Error ? error.message : 'Failed to update proposal'
      )
      throw error
    } finally {
      setProposalLoading(false)
    }
  },

  deleteProposal: async (id) => {
    const { setProposalLoading, setProposalError } = get()
    setProposalLoading(true)

    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete proposal')

      set((state) => ({
        proposals: state.proposals.filter((p) => p.id !== id),
      }))
    } catch (error) {
      setProposalError(
        error instanceof Error ? error.message : 'Failed to delete proposal'
      )
      throw error
    } finally {
      setProposalLoading(false)
    }
  },

  submitProposalVote: async (
    proposalId,
    voteType,
    userAddress,
    votingPower
  ) => {
    const { setProposalLoading, setProposalError } = get()
    setProposalLoading(true)

    try {
      const response = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, userAddress, votingPower }),
      })

      if (!response.ok) throw new Error('Failed to cast vote')

      const updatedProposal = await response.json()
      set((state) => ({
        proposals: state.proposals.map((p) =>
          p.id === proposalId ? updatedProposal : p
        ),
      }))
    } catch (error) {
      setProposalError(
        error instanceof Error ? error.message : 'Failed to cast vote'
      )
      throw error
    } finally {
      setProposalLoading(false)
    }
  },

  removeProposalVote: async (proposalId, userAddress) => {
    const { setProposalLoading, setProposalError } = get()
    setProposalLoading(true)

    try {
      const response = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress }),
      })

      if (!response.ok) throw new Error('Failed to remove vote')

      const updatedProposal = await response.json()
      set((state) => ({
        proposals: state.proposals.map((p) =>
          p.id === proposalId ? updatedProposal : p
        ),
      }))
    } catch (error) {
      setProposalError(
        error instanceof Error ? error.message : 'Failed to remove vote'
      )
      throw error
    } finally {
      setProposalLoading(false)
    }
  },

  calculateVotingPower: (userInvestments) => {
    return userInvestments.reduce((total, inv) => total + inv.fractionCount, 0)
  },

  getFilteredProposals: () => {
    const { proposals, proposalFilters } = get()
    return proposals.filter((proposal) => {
      if (proposalFilters.status && proposal.status !== proposalFilters.status)
        return false
      if (proposalFilters.type && proposal.type !== proposalFilters.type)
        return false
      if (
        proposalFilters.propertyId &&
        proposal.propertyId !== proposalFilters.propertyId
      )
        return false
      if (proposalFilters.search) {
        const search = proposalFilters.search.toLowerCase()
        return (
          proposal.title.toLowerCase().includes(search) ||
          proposal.description.toLowerCase().includes(search)
        )
      }
      return true
    })
  },

  checkUserVote: (proposalId, userAddress) => {
    const proposal = get().proposals.find((p) => p.id === proposalId)
    if (!proposal) return null

    if (proposal.votes.for.includes(userAddress)) return 'for'
    if (proposal.votes.against.includes(userAddress)) return 'against'
    return null
  },

  getUserVotingPower: async (userAddress: string) => {
    const { setProposalError } = get()

    try {
      const response = await fetch(`/api/users?address=${userAddress}`)
      if (!response.ok) throw new Error('Failed to fetch user data')

      const data = await response.json()
      const user = data.user

      if (!user || !user.investments) {
        return 0
      }

      const totalVotingPower = user.investments.reduce(
        (total: any, investment: { fractionCount: any }) => {
          return total + (investment.fractionCount || 0)
        },
        0
      )

      return totalVotingPower
    } catch (error) {
      setProposalError(
        error instanceof Error
          ? error.message
          : 'Failed to calculate voting power'
      )
      console.error('Error calculating voting power:', error)
      return 0
    }
  },
})
