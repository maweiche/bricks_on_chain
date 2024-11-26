import { NextRequest, NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongodb'

const PurchaseSchema = z.object({
  fractionCount: z.number().min(1),
  pricePerFraction: z.number().min(0),
  totalAmount: z.number().min(100),
  wallet: z.string(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const { fractionCount, totalAmount, wallet } = PurchaseSchema.parse(json)
    const propertyId = params.id

    // Validate Solana address
    try {
      new PublicKey(wallet)
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    const { client, db } = await connectToDatabase()
    const session = await client.startSession()

    try {
      await session.withTransaction(async () => {
        // Get property using string ID
        const property = await db
          .collection('properties')
          .findOne({ _id: propertyId } as any, { session })

        if (!property) {
          throw new Error('Property not found')
        }

        if (property.funded) {
          throw new Error('Property is already fully funded')
        }

        const remainingToFund = property.fundingGoal - property.currentFunding
        if (totalAmount > remainingToFund) {
          throw new Error('Purchase amount exceeds remaining funding needed')
        }

        // Get user
        const user = await db
          .collection('users')
          .findOne({ address: wallet }, { session })

        if (!user) {
          throw new Error('User not found')
        }

        // Create investment with string IDs
        const investment = {
          userId: user._id,
          propertyId,
          amount: totalAmount,
          fractionCount,
          status: 'active',
          purchaseDate: new Date(),
          transactionSignature: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = await db
          .collection('investments')
          .insertOne(investment, { session })

        // Update property funding
        const newFunding = property.currentFunding + totalAmount
        await db.collection('properties').updateOne(
          { _id: propertyId } as any,
          {
            $set: {
              currentFunding: newFunding,
              funded: newFunding >= property.fundingGoal,
              updatedAt: new Date(),
            },
          },
          { session }
        )

        return {
          success: true,
          transactionId: investment.transactionSignature,
          timestamp: investment.purchaseDate,
          property,
          fractionsPurchased: fractionCount,
          totalAmount,
          investmentId: result.insertedId,
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Purchase completed successfully',
      })
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error('Purchase error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process purchase',
      },
      { status: 500 }
    )
  }
}
