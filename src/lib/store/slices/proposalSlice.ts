import { StateCreator } from 'zustand'
import { Property, User } from '../types'

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

export interface ProposalFilters {
  status?: Proposal['status']
  type?: Proposal['type']
  propertyId?: string
  search?: string
}

export interface ProposalSlice {
  proposals: Proposal[]
  selectedProposal: Proposal | null
  filters: ProposalFilters
  loading: boolean
  error: string | null

  // Actions
  setProposals: (proposals: Proposal[]) => void
  setSelectedProposal: (proposal: Proposal | null) => void
  setFilters: (filters: ProposalFilters) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // CRUD operations
  createProposal: (
    proposal: Omit<
      Proposal,
      'id' | 'createdAt' | 'updatedAt' | 'status' | 'votingPower' | 'votes'
    >
  ) => Promise<void>
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<void>
  deleteProposal: (id: string) => Promise<void>

  // Voting operations
  vote: (
    proposalId: string,
    vote: 'for' | 'against',
    userAddress: string,
    votingPower: number
  ) => Promise<void>
  removeVote: (proposalId: string, userAddress: string) => Promise<void>

  // Utilities
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
  filters: {},
  loading: false,
  error: null,

  // Basic state setters
  setProposals: (proposals) => set({ proposals }),
  setSelectedProposal: (proposal) => set({ selectedProposal: proposal }),
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // CRUD operations
  createProposal: async (proposalData) => {
    const { setLoading, setError } = get()
    setLoading(true)

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
      setError(
        error instanceof Error ? error.message : 'Failed to create proposal'
      )
      throw error
    } finally {
      setLoading(false)
    }
  },

  updateProposal: async (id, updates) => {
    const { setLoading, setError } = get()
    setLoading(true)

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
      setError(
        error instanceof Error ? error.message : 'Failed to update proposal'
      )
      throw error
    } finally {
      setLoading(false)
    }
  },

  deleteProposal: async (id) => {
    const { setLoading, setError } = get()
    setLoading(true)

    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete proposal')

      set((state) => ({
        proposals: state.proposals.filter((p) => p.id !== id),
      }))
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to delete proposal'
      )
      throw error
    } finally {
      setLoading(false)
    }
  },

  // Voting operations
  vote: async (proposalId, voteType, userAddress, votingPower) => {
    const { setLoading, setError } = get()
    setLoading(true)

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
      setError(error instanceof Error ? error.message : 'Failed to cast vote')
      throw error
    } finally {
      setLoading(false)
    }
  },

  removeVote: async (proposalId, userAddress) => {
    const { setLoading, setError } = get()
    setLoading(true)

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
      setError(error instanceof Error ? error.message : 'Failed to remove vote')
      throw error
    } finally {
      setLoading(false)
    }
  },

  // Utilities
  calculateVotingPower: (userInvestments) => {
    return userInvestments.reduce((total, inv) => total + inv.fractionCount, 0)
  },

  getFilteredProposals: () => {
    const { proposals, filters } = get()
    return proposals.filter((proposal) => {
      if (filters.status && proposal.status !== filters.status) return false
      if (filters.type && proposal.type !== filters.type) return false
      if (filters.propertyId && proposal.propertyId !== filters.propertyId)
        return false
      if (filters.search) {
        const search = filters.search.toLowerCase()
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
    const { setError } = get()

    try {
      // Fetch user data from the API
      const response = await fetch(`/api/users?address=${userAddress}`)
      if (!response.ok) throw new Error('Failed to fetch user data')

      const data = await response.json()
      const user = data.user

      if (!user || !user.investments) {
        return 0
      }

      // Calculate total voting power from all investments
      const totalVotingPower = user.investments.reduce(
        (total: any, investment: { fractionCount: any }) => {
          return total + (investment.fractionCount || 0)
        },
        0
      )

      return totalVotingPower
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to calculate voting power'
      )
      console.error('Error calculating voting power:', error)
      return 0
    }
  },
})
