import { NextRequest, NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongodb'

// Validation schemas
const CartItemSchema = z.object({
  propertyId: z.string(),
  propertyTitle: z.string(),
  fractionCount: z.number().min(1),
  pricePerFraction: z.number().min(0),
  totalAmount: z.number().min(0),
})

const CheckoutRequestSchema = z.object({
  items: z.array(CartItemSchema),
  wallet: z.string(), // Solana public key
})

function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const { items, wallet } = CheckoutRequestSchema.parse(json)

    if (!isValidSolanaAddress(wallet)) {
      throw new Error('Invalid Solana wallet address')
    }

    // Connect to MongoDB
    const { client, db } = await connectToDatabase()
    const session = await client.startSession()

    try {
      // Start transaction
      const summary = await session.withTransaction(async () => {
        // Find user by wallet address
        const user = await db
          .collection('users')
          .findOne({ address: wallet }, { session })

        if (!user) {
          throw new Error('User not found for the provided wallet address')
        }

        // Process each item in the cart
        for (const item of items) {
          // Get property
          const property = await db
            .collection('properties')
            .findOne({ _id: item.propertyId } as any, { session })

          if (!property) {
            throw new Error(`Property ${item.propertyId} not found`)
          }

          if (property.funded) {
            throw new Error(
              `Property ${item.propertyTitle} is already fully funded`
            )
          }

          const remainingToFund = property.fundingGoal - property.currentFunding
          if (item.totalAmount > remainingToFund) {
            throw new Error(
              `Purchase amount exceeds remaining funding needed for ${item.propertyTitle}`
            )
          }

          // Update property funding
          const newFunding = property.currentFunding + item.totalAmount
          await db.collection('properties').updateOne(
            { _id: item.propertyId } as any,
            {
              $set: {
                currentFunding: newFunding,
                funded: newFunding >= property.fundingGoal,
                updatedAt: new Date(),
              },
            },
            { session }
          )
        }

        // Create investments
        const timestamp = new Date()
        const mockTxSignature = `${Date.now()}_${Math.random().toString(36).substring(7)}`

        const investments = items.map((item) => ({
          _id: `inv_${Date.now()}_${item.propertyId}`,
          propertyId: item.propertyId,
          userId: user._id,
          amount: item.totalAmount,
          fractionCount: item.fractionCount,
          purchaseDate: timestamp,
          status: 'active',
          transactionSignature: mockTxSignature,
          wallet,
          createdAt: timestamp,
          updatedAt: timestamp,
        }))

        // Insert all investments
        await db
          .collection('investments')
          .insertMany(investments as any, { session })

        // Return transaction summary
        return {
          transactionId: mockTxSignature,
          timestamp,
          wallet,
          totalAmount: items.reduce((sum, item) => sum + item.totalAmount, 0),
          items: items.map((item) => ({
            propertyId: item.propertyId,
            fractionCount: item.fractionCount,
            amount: item.totalAmount,
          })),
        }
      })

      return NextResponse.json({
        success: true,
        ...summary,
      })
    } finally {
      await session.endSession()
    }
  } catch (error: any) {
    console.error('Checkout error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: error.message || 'Checkout failed',
        code: error.code || 'CHECKOUT_ERROR',
      },
      { status: error.code ? 400 : 500 }
    )
  }
}
