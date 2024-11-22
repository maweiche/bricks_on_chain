import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  try {
    const { ids } = await req.json()

    // Read the current proposals
    const filePath = path.join(process.cwd(), 'data', 'proposals.json')
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))

    // Filter out the proposals to be deleted
    data.proposals = data.proposals.filter(
      (proposal: any) => !ids.includes(proposal.id)
    )

    // Write back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete proposals:', error)
    return NextResponse.json(
      { error: 'Failed to delete proposals' },
      { status: 500 }
    )
  }
}
