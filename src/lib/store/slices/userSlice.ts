import { StateCreator } from 'zustand'

import { Investment, User, Vote } from '../types'

export interface UserSlice {
  user: User | null
  investments: Investment[]
  votes: Vote[]

  setUser: (user: User | null) => void
  setInvestments: (investments: Investment[]) => void
  addInvestment: (investment: Investment) => void
  addVote: (vote: Vote) => void
  removeVote: (proposalId: string) => void
  getTotalInvested: () => number
  getActiveInvestments: () => Investment[]
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  user: null,
  investments: [],
  votes: [],

  setUser: (user) => set({ user }),
  setInvestments: (investments) => set({ investments }),
  addInvestment: (investment) =>
    set((state) => ({
      investments: [...state.investments, investment],
    })),
  addVote: (vote) =>
    set((state) => ({
      votes: [...state.votes, vote],
    })),
  removeVote: (proposalId) =>
    set((state) => ({
      votes: state.votes.filter((v) => v.proposalId !== proposalId),
    })),

  getTotalInvested: () => {
    const { investments } = get()
    return investments.reduce((total, inv) => total + inv.amount, 0)
  },
  getActiveInvestments: () => {
    const { investments } = get()
    return investments.filter((inv) => inv.status === 'active')
  },
})
