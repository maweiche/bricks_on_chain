import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { AuthSlice, createAuthSlice } from './slices/authSlice'
import { CartItem, CartSlice, createCartSlice } from './slices/cartSlice'
import { createPropertySlice, PropertySlice } from './slices/propertySlice'
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice'
import { createUserSlice, UserSlice } from './slices/userSlice'

type StoreState = PropertySlice &
  UserSlice &
  AuthSlice &
  SettingsSlice &
  CartSlice

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createPropertySlice(...a),
      ...createUserSlice(...a),
      ...createAuthSlice(...a),
      ...createSettingsSlice(...a),
      ...createCartSlice(...a),
    }),
    {
      name: 'real-estate-store',
      partialize: (state) => ({
        user: state.user,
        investments: state.investments,
        votes: state.votes,
        filters: state.filters,
        settings: state.settings,
        items: state.items,
      }),
    }
  )
)

export type { Property, User, Investment, Vote } from './types'
export type { PropertyFilters } from './slices/propertySlice'
export type { UserSettings } from './slices/settingsSlice'
export type { CartItem } from './slices/cartSlice'
