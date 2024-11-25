import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import mongoose from 'mongoose'
import { schema } from './schema'
import { pubsub } from './pubsub'
import { User } from '@/lib/models'
import type { Context } from './types'
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

const server = new ApolloServer<Context>({
  schema,
})

export default startServerAndCreateNextHandler(server, {
  context: async (req, res): Promise<Context> => {
    const address = req.headers['x-wallet-address'] as string
    
    let user
    if (address) {
      const dbUser = await User.findOne({ address })
      if (dbUser) {
        user = {
          id: dbUser._id.toString(),
          address: dbUser.address,
          role: dbUser.role
        }
      }
    }

    return {
      req,
      res,
      user,
      pubsub
    }
  },
})