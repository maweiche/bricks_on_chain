import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PropertySlice, createPropertySlice } from './slices/propertySlice'
import { UserSlice, createUserSlice } from './slices/userSlice'
import { AuthSlice, createAuthSlice } from './slices/authSlice'

type StoreState = PropertySlice & UserSlice & AuthSlice

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createPropertySlice(...a),
      ...createUserSlice(...a),
      ...createAuthSlice(...a),
    }),
    {
      name: 'real-estate-store',
      partialize: (state) => ({
        user: state.user,
        investments: state.investments,
        votes: state.votes,
        filters: state.filters,
      }),
    }
  )
)

export type { Property, User, Investment, Vote } from './types'
export type { PropertyFilters } from './slices/propertySlice'
