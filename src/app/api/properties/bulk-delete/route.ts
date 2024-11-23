import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

// Path to our JSON file
const DB_PATH = path.join(process.cwd(), 'data', 'properties.json')

// Helper function to read the database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to create user:', error)
    return { properties: [] }
  }
}

// Helper function to write to the database
async function writeDB(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()

    if (!Array.isArray(json.ids)) {
      return NextResponse.json(
        { error: 'Invalid input: ids must be an array' },
        { status: 400 }
      )
    }

    const db = await readDB()

    // Filter out the properties to be deleted
    db.properties = db.properties.filter((p: any) => !json.ids.includes(p.id))

    // Write back to database
    await writeDB(db)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: 'Failed to delete properties' },
      { status: 500 }
    )
  }
}
