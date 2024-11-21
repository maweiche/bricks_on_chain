import { StateCreator } from 'zustand'

import { db } from '@/lib/db'

import { User } from '../types'

export interface AuthSlice {
  user: User | null
  isLoading: boolean
  error: string | null
  isAdmin: boolean
  isSimulated: boolean // Add this flag
  createProfile: (user: User) => Promise<void>
  updateProfile: (user: User) => Promise<void>
  checkAuth: (address: string) => Promise<void>
  disconnect: () => void
  simulateAuth: (user: User) => void // Add this method
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  isAdmin: false,
  isLoading: false,
  error: null,
  isSimulated: false,

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
        isSimulated: false
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
      isSimulated: true,
      error: null
    })
  },

  createProfile: async (user: User) => {
    try {
      const res = await db.createUser(user)
      set({ user, isAdmin: user.role === 'admin', error: null })
    } catch (error) {
      console.error('Failed to create profile:', error)
      set({ user: null, isAdmin: false, error: 'Failed to create profile' })
    }
  },

  updateProfile: async (user: User) => {
    try {
      const res = await db.updateUser(user.id, user)
      set({ user, isAdmin: user.role === 'admin', error: null })
    } catch (error) {
      console.error('Failed to update profile:', error)
      set({ user: null, isAdmin: false, error: 'Failed to update profile' })
    }
  },

  disconnect: () => set({ 
    user: null, 
    isAdmin: false, 
    error: null,
    isSimulated: false 
  })
})