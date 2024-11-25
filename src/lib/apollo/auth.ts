// src/lib/apollo/auth.ts

import { User } from '@/lib/models'
import type { NextApiRequest } from 'next'
import type { Document } from 'mongoose'

interface AuthUser {
  id: string
  address: string
  role: 'user' | 'admin'
}

// Default user settings
const DEFAULT_USER_SETTINGS = {
  theme: 'system' as const,
  notifications: {
    email: true,
    push: true,
    investmentUpdates: true,
    marketingUpdates: false,
  },
  display: {
    compactView: false,
    showProfitLoss: true,
    currency: 'USD' as const,
  },
}

export async function getUser(req: NextApiRequest): Promise<AuthUser | null> {
  try {
    const address = req.headers['x-wallet-address']
    if (!address || Array.isArray(address)) return null

    // Find or create user
    let user = await User.findOne({ address })
    
    if (!user) {
      user = await User.create({
        address,
        role: 'user',
        joinedAt: new Date(),
        settings: DEFAULT_USER_SETTINGS,
      })
    }

    return {
      id: user._id.toString(),
      address: user.address,
      role: user.role,
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}