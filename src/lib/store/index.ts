import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { AuthSlice, createAuthSlice } from './slices/authSlice'
import { CartItem, CartSlice, createCartSlice } from './slices/cartSlice'
import { createPropertySlice, PropertyFilters, PropertySlice } from './slices/propertySlice'
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice'
import { createUserSlice, UserSlice } from './slices/userSlice'
import { createProposalSlice, ProposalSlice, Proposal, ProposalFilters } from './slices/proposalSlice'

type StoreState = PropertySlice &
  UserSlice &
  AuthSlice &
  SettingsSlice &
  CartSlice &
  ProposalSlice

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createPropertySlice(...a),
      ...createUserSlice(...a),
      ...createAuthSlice(...a),
      ...createSettingsSlice(...a),
      ...createCartSlice(...a),
      ...createProposalSlice(...a),
    }),
    {
      name: 'real-estate-store',
      partialize: (state) => ({
        user: state.user,
        isAdmin: state.isAdmin,
        investments: state.investments,
        votes: state.votes,
        filters: state.filters as PropertyFilters,
        settings: state.settings,
        items: state.items,
        proposals: state.proposals, 
        selectedProposal: state.selectedProposal,
      }),
    }
  )
)

export type { Property, User, Investment, Vote } from './types'
export type { PropertyFilters } from './slices/propertySlice'
export type { UserSettings } from './slices/settingsSlice'
export type { CartItem } from './slices/cartSlice'
export type { Proposal } from './slices/proposalSlice' 