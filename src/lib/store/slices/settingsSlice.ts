// lib/store/slices/settingsSlice.ts
import { StateCreator } from 'zustand'

import { AuthSlice } from './authSlice'

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    investmentUpdates: boolean
    marketingUpdates: boolean
  }
  display: {
    compactView: boolean
    showProfitLoss: boolean
    currency: 'USD' | 'EUR' | 'GBP'
  }
}

// Update the interface to include access to AuthSlice
export interface SettingsSlice {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    investmentUpdates: true,
    marketingUpdates: false,
  },
  display: {
    compactView: false,
    showProfitLoss: true,
    currency: 'USD',
  },
}

// Add AuthSlice to the generic type to access user state
export const createSettingsSlice: StateCreator<
  SettingsSlice & AuthSlice,
  [],
  [],
  SettingsSlice
> = (set, get) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: async (newSettings) => {
    const userId = get().user?.id
    if (!userId) throw new Error('No user logged in')

    try {
      const response = await fetch(`/api/users/${userId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      const data = await response.json()
      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }))

      return data.settings
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  },
})
