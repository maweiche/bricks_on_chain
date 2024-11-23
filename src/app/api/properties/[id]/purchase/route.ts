import fs from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'
import { z } from 'zod'

const PurchaseSchema = z.object({
  propertyId: z.string(),
  propertyTitle: z.string(),
  fractionCount: z.number().min(1),
  pricePerFraction: z.number().min(0),
  totalAmount: z.number().min(100),
  wallet: z.string(), // Require wallet address
})

const DB_PATH = path.join(process.cwd(), 'data', 'properties.json')
const USERS_DB_PATH = path.join(process.cwd(), 'data', 'users.json')

export async function POST(
  request: NextRequest
  // { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const { propertyId, fractionCount, totalAmount, wallet } =
      PurchaseSchema.parse(json)

    // Validate Solana address
    try {
      new PublicKey(wallet)
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Read property data
    const dbData = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'))
    const propertyIndex = dbData.properties.findIndex(
      (p: any) => p.id === propertyId
    )

    if (propertyIndex === -1) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const property = dbData.properties[propertyIndex]

    // Validate funding status
    if (property.funded) {
      return NextResponse.json(
        { error: 'Property is already fully funded' },
        { status: 400 }
      )
    }

    const remainingToFund = property.fundingGoal - property.currentFunding
    if (totalAmount > remainingToFund) {
      return NextResponse.json(
        { error: 'Purchase amount exceeds remaining funding needed' },
        { status: 400 }
      )
    }

    // Update property funding
    property.currentFunding += totalAmount
    property.funded = property.currentFunding >= property.fundingGoal
    dbData.properties[propertyIndex] = property

    // Update user investments
    const usersData = JSON.parse(await fs.readFile(USERS_DB_PATH, 'utf-8'))
    const userIndex = usersData.findIndex((u: any) => u.address === wallet)

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Ensure user has investments array
    if (!usersData[userIndex].investments) {
      usersData[userIndex].investments = []
    }

    // Add new investment
    const timestamp = new Date().toISOString()
    const mockTxSignature = `${Date.now()}_${Math.random().toString(36).substring(7)}`

    usersData[userIndex].investments.push({
      id: `inv_${Date.now()}`,
      propertyId,
      amount: totalAmount,
      fractionCount,
      purchaseDate: timestamp,
      status: 'active',
      transactionSignature: mockTxSignature,
      wallet,
    })

    // Save updates
    await Promise.all([
      fs.writeFile(DB_PATH, JSON.stringify(dbData, null, 2)),
      fs.writeFile(USERS_DB_PATH, JSON.stringify(usersData, null, 2)),
    ])

    return NextResponse.json({
      success: true,
      transactionId: mockTxSignature,
      timestamp,
      property,
      fractionsPurchased: fractionCount,
      totalAmount,
    })
  } catch (error) {
    console.error('Purchase error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    )
  }
}
