import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { schema } from '@/lib/apollo/schema'
import { pubsub } from '@/lib/apollo/pubsub'
import type { Context } from '@/lib/apollo/types'
import { User as UserType } from '@/lib/apollo/types'
import { connectToDatabase } from '@/lib/mongodb'
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

const server = new ApolloServer<Context>({
  schema,
})

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res): Promise<Context> => {
    const db = (await connectToDatabase()).db
    const address = req.headers['x-wallet-address'] as string
    let user: UserType | null = null
    if (address) {
      const dbUser = await db.collection('users').findOne({ address })
      if (dbUser) {
        user = {
          _id: dbUser._id.toString(),
          address: dbUser.address,
          role: dbUser.role,
        }
      }
    }

    return {
      req,
      res,
      db,
      user: user || null,
      pubsub,
    }
  },
})

export async function GET() {
  return new Response('Use POST for GraphQL queries and mutations', {
    status: 405,
    headers: { Allow: 'POST' },
  })
}

export async function POST(request: Request) {
  console.log('auth post pinged')
  return handler(request)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers':
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    },
  })
}
