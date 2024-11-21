import { User } from '../store/types'

export const db = {
  async getUser(address: string): Promise<User | null> {
    const res = await fetch(`/api/users?address=${address}`)
    const data = await res.json()
    return data.user
  },

  async createUser(userData: Omit<User, 'id' | 'joinedAt'>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.user
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...userData }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.user
  },
}
