import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  try {
    const settings = await req.json()
    const filePath = path.join(process.cwd(), 'data', 'settings.json')

    // Save settings to file
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'settings.json')
    const data = await fs.readFile(filePath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
