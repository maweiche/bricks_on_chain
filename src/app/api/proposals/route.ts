// app/api/proposals/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import { Status } from '@/lib/store/slices/proposalSlice'

// Helper to read/write to our JSON file
const getProposalsPath = () =>
  path.join(process.cwd(), 'data', 'proposals.json')

async function getProposals() {
  try {
    const filePath = getProposalsPath()
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data).proposals || []
  } catch (error) {
    // If file doesn't exist, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

async function saveProposals(proposals: any[]) {
  const filePath = getProposalsPath()
  await fs.writeFile(filePath, JSON.stringify({ proposals }, null, 2))
}

// Schema for proposal creation
const proposalSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  type: z.enum([
    'PROPERTY_IMPROVEMENT',
    'MAINTENANCE',
    'POLICY_CHANGE',
    'OTHER',
  ]),
  propertyId: z.string().optional(),
  requiredQuorum: z.number().min(0).max(100),
  endDate: z.string().datetime(),
  creator: z.object({
    id: z.string(),
    address: z.string(),
    name: z.string().optional(),
  }),
})

// GET /api/proposals
export async function GET() {
  try {
    const proposals = await getProposals()
    return NextResponse.json({ proposals })
  } catch (error) {
    console.error('Failed to fetch proposals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    )
  }
}

// POST /api/proposals
export async function POST(req: Request) {
  try {
    const json = await req.json()
    const validatedData = proposalSchema.parse(json)

    const proposals = await getProposals()

    const newProposal = {
      id: `prop_${Date.now()}`,
      ...validatedData,
      status: Status.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votingPower: {
        for: 0,
        against: 0,
        total: 100, // This should be calculated based on total available voting power
      },
      votes: {
        for: [],
        against: [],
      },
    }

    proposals.push(newProposal)
    await saveProposals(proposals)

    return NextResponse.json({ proposal: newProposal }, { status: 201 })
  } catch (error) {
    console.error('Failed to create proposal:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid proposal data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
}
