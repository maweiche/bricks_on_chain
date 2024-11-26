import type { NextApiRequest } from 'next'
import { connectToDatabase } from '../mongodb'

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
    const db = (await connectToDatabase()).db
    const user = await db.collection('users').findOne({ address })

    let newUserId

    if (!user) {
      const newUser = await db.collection('users').insertOne({
        address: address.toLowerCase(),
        role: 'user',
        joinedAt: new Date(),
        settings: DEFAULT_USER_SETTINGS,
      })

      newUserId = newUser.insertedId
    }

    return {
      id: newUserId?.toString() || user!._id.toString(),
      address: address,
      role: 'user',
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}
