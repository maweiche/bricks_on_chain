import { StateCreator } from 'zustand'
import { User } from '../types'
import { db } from '@/lib/db'

export interface AuthSlice {
  user: User | null
  isLoading: boolean
  error: string | null
  isAdmin: boolean
  checkAuth: (address: string) => Promise<void>
  disconnect: () => void
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  isAdmin: false,
  isLoading: false,
  error: null,

  checkAuth: async (address: string) => {
    try {
      const res = await fetch(`/api/users?address=${address}`)
      const data = await res.json()
      
      if (!data.user) {
        set({ user: null, isAdmin: false })
        return
      }
  
      // Set both states together
      set({
        user: data.user,
        isAdmin: data.user.role === 'admin'
      })
    } catch (error) {
      console.error('Auth check failed:', error)
      set({ user: null, isAdmin: false })
    }
  },

  disconnect: () => set({ 
    user: null, 
    isAdmin: false, 
    error: null 
  })
})