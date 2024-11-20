import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PropertySlice, createPropertySlice } from './slices/propertySlice'
import { UserSlice, createUserSlice } from './slices/userSlice'
import { AuthSlice, createAuthSlice } from './slices/authSlice'
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice'

type StoreState = PropertySlice & UserSlice & AuthSlice & SettingsSlice

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createPropertySlice(...a),
      ...createUserSlice(...a),
      ...createAuthSlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: 'real-estate-store',
      partialize: (state) => ({
        user: state.user,
        investments: state.investments,
        votes: state.votes,
        filters: state.filters,
        settings: state.settings,
      }),
    }
  )
)

export type { Property, User, Investment, Vote } from './types'
export type { PropertyFilters } from './slices/propertySlice'
export type { UserSettings } from './slices/settingsSlice'