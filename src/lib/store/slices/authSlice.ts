import { StateCreator } from 'zustand'

import { db } from '@/lib/db'

import { User } from '../types'

export interface AuthSlice {
  user: User | null
  isLoading: boolean
  error: string | null
  isAdmin: boolean
  isSimulated: boolean
  showProfileDialog: boolean
  setShowProfileDialog: (show: boolean) => void
  createProfile: (user: User) => Promise<void>
  updateProfile: (user: User) => Promise<void>
  checkAuth: (address: string) => Promise<void>
  disconnect: () => void
  simulateAuth: (user: User) => void
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  isAdmin: false,
  isLoading: false,
  error: null,
  isSimulated: false,
  showProfileDialog: false,
  setShowProfileDialog: (show) => set({ showProfileDialog: show }),
  checkAuth: async (address: string) => {
    try {
      const res = await fetch(`/api/users?address=${address}`)
      const data = await res.json()

      if (!data.user) {
        set({ user: null, isAdmin: false, isSimulated: false })
        return
      }

      set({
        user: data.user,
        isAdmin: data.user.role === 'admin',
        isSimulated: false,
      })
    } catch (error) {
      console.error('Auth check failed:', error)
      set({ user: null, isAdmin: false, isSimulated: false })
    }
  },

  simulateAuth: (user: User) => {
    set({
      user,
      isAdmin: user.role === 'admin',
      isLoading: false,
      error: null,
    })
  },

  createProfile: async (user: User) => {
    try {
      await db.createUser(user)
      set({ user, isAdmin: user.role === 'admin', error: null })
    } catch (error) {
      console.error('Failed to create profile:', error)
      set({ user: null, isAdmin: false, error: 'Failed to create profile' })
    }
  },

  updateProfile: async (user: User) => {
    try {
      await db.updateUser(user.id, user)
      set({ user, isAdmin: user.role === 'admin', error: null })
    } catch (error) {
      console.error('Failed to update profile:', error)
      set({ user: null, isAdmin: false, error: 'Failed to update profile' })
    }
  },

  disconnect: () =>
    set({
      user: null,
      isAdmin: false,
      error: null,
      isSimulated: false,
    }),
})
