import { StateCreator } from 'zustand'
import { User } from '../types'
import { db } from '@/lib/db'

export interface AuthSlice {
  user: User | null
  isLoading: boolean
  error: string | null
  isAdmin: boolean
  checkAuth: (address: string) => Promise<void>
  createProfile: (userData: Omit<User, 'id' | 'joinedAt'>) => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
  disconnect: () => void
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
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

  createProfile: async (userData) => {
    set({ isLoading: true, error: null })
    try {
      const user = await db.createUser(userData)
      set({ user, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateProfile: async (userData) => {
    const currentUser = get().user
    if (!currentUser) throw new Error('No user logged in')
    
    set({ isLoading: true, error: null })
    try {
      const updatedUser = await db.updateUser(currentUser.id, userData)
      set({ user: updatedUser, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  disconnect: () => set({ 
    user: null, 
    isAdmin: false, 
    error: null 
  })
})