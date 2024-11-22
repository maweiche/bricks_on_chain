import { NextResponse } from 'next/server'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import { Status } from '@/lib/store/slices/proposalSlice'

// Update the vote schema to match what we're sending from the frontend
const voteSchema = z.object({
  voteData: z.object({
    voteType: z.enum(['for', 'against']),
    userAddress: z.string(),
    votingPower: z.number().min(0),
  }),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { voteData } = voteSchema.parse(body)

    // Read the proposals file
    const filePath = path.join(process.cwd(), 'data', 'proposals.json')
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
    const proposals = data.proposals

    const proposalIndex = proposals.findIndex((p: any) => p.id === params.id)
    if (proposalIndex === -1) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const proposal = proposals[proposalIndex]
    if (proposal.status !== Status.ACTIVE) {
      return NextResponse.json(
        { error: 'Proposal is not active' },
        { status: 400 }
      )
    }

    // Remove any existing votes by this user
    proposal.votes.for = proposal.votes.for.filter(
      (v: string) => v !== voteData.userAddress
    )
    proposal.votes.against = proposal.votes.against.filter(
      (v: string) => v !== voteData.userAddress
    )

    // Add new vote
    proposal.votes[voteData.voteType].push(voteData.userAddress)

    // Update voting power
    proposal.votingPower[voteData.voteType] += voteData.votingPower

    // Check if proposal should be closed based on quorum
    const totalVotes = proposal.votingPower.for + proposal.votingPower.against
    if (totalVotes >= proposal.votingPower.total) {
      proposal.status =
        proposal.votingPower.for > proposal.votingPower.against
          ? Status.PASSED
          : Status.REJECTED
    }

    proposal.updatedAt = new Date().toISOString()

    // Save updated proposals
    await fs.writeFile(filePath, JSON.stringify({ proposals }, null, 2))

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error('Failed to process vote:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid vote data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await req.json()
    const { userAddress } = z.object({ userAddress: z.string() }).parse(json)

    const filePath = path.join(process.cwd(), 'src', 'data', 'proposals.json')
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
    const proposals = data.proposals

    const proposalIndex = proposals.findIndex((p: any) => p.id === params.id)
    if (proposalIndex === -1) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const proposal = proposals[proposalIndex]

    // Remove votes
    proposal.votes.for = proposal.votes.for.filter(
      (v: string) => v !== userAddress
    )
    proposal.votes.against = proposal.votes.against.filter(
      (v: string) => v !== userAddress
    )

    // Update voting power
    proposal.votingPower = {
      for: proposal.votes.for.length,
      against: proposal.votes.against.length,
      total: proposal.votingPower.total,
    }

    proposal.updatedAt = new Date().toISOString()
    await fs.writeFile(filePath, JSON.stringify({ proposals }, null, 2))

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error('Failed to remove vote:', error)
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    )
  }
}
