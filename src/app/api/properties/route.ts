// app/api/properties/route.ts
import fs from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { useAuth } from '@/hooks/use-auth'

// Path to our JSON file
const DB_PATH = path.join(process.cwd(), 'data', 'properties.json')

// Schema for property validation
const PropertySchema = z.object({
  id: z.string().optional(), // Optional because we'll generate it
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  location: z.string().min(1).max(100),
  price: z.number().positive(),
  type: z.enum(['house', 'apartment', 'commercial']),
  images: z.array(z.string().url()).min(1),
  funded: z.boolean(),
  fundingGoal: z.number().positive(),
  currentFunding: z.number().min(0),
  roi: z.number().positive(),
  createdAt: z.string().datetime().optional(), // Optional because we'll generate it
  updatedAt: z.string().datetime().optional(), // Optional because we'll generate it
})

// Helper function to read the database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { properties: [] }
  }
}

// Helper function to write to the database
async function writeDB(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
}

// GET /api/properties
export async function GET() {
  try {
    const data = await readDB()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

// POST /api/properties
export async function POST(request: NextRequest) {
  try {
    const json = await request.json()

    // Validate the input
    const result = PropertySchema.safeParse(json)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid property data', details: result.error.format() },
        { status: 400 }
      )
    }

    const property = result.data

    // Generate missing fields
    const now = new Date().toISOString()
    const newProperty = {
      ...property,
      id: `prop_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }

    // Read current data and append new property
    const db = await readDB()
    db.properties.push(newProperty)

    // Write back to database
    await writeDB(db)

    return NextResponse.json(newProperty, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
