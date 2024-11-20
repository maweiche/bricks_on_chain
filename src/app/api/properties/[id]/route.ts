import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'

// Path to our JSON file
const DB_PATH = path.join(process.cwd(), 'data', 'properties.json')

// Schema for property validation
const PropertyResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  price: z.number(),
  type: z.enum(['house', 'apartment', 'commercial']),
  images: z.array(z.string().url()),
  funded: z.boolean(),
  fundingGoal: z.number(),
  currentFunding: z.number(),
  roi: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Additional details for single property view
  amenities: z.array(z.string()).optional(),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    url: z.string(),
  })).optional(),
  investments: z.array(z.object({
    date: z.string(),
    amount: z.number(),
  })).optional(),
  analytics: z.object({
    totalInvestors: z.number(),
    averageInvestment: z.number(),
    daysRemaining: z.number(),
  }).optional(),
})

type PropertyResponse = z.infer<typeof PropertyResponseSchema>

// Helper function to read the database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    throw new Error('Failed to read database')
  }
}

// Helper to enrich property data with additional details
function enrichPropertyData(property: PropertyResponse): PropertyResponse {
  // Add mock data for the detailed view
  return {
    ...property,
    amenities: [
      'Parking',
      'Security System',
      'High-Speed Internet',
      'HVAC',
      'Modern Appliances',
    ],
    documents: [
      {
        id: 'doc_1',
        name: 'Property Appraisal Report',
        type: 'PDF',
        url: '/documents/appraisal.pdf',
      },
      {
        id: 'doc_2',
        name: 'Financial Projections',
        type: 'PDF',
        url: '/documents/projections.pdf',
      },
      {
        id: 'doc_3',
        name: 'Legal Documentation',
        type: 'PDF',
        url: '/documents/legal.pdf',
      },
    ],
    investments: Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString(),
      amount: Math.floor(Math.random() * 50000) + 10000,
    })),
    analytics: {
      totalInvestors: Math.floor(Math.random() * 50) + 20,
      averageInvestment: Math.floor(Math.random() * 30000) + 20000,
      daysRemaining: Math.floor(Math.random() * 20) + 5,
    },
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `property-${params.id}-${clientIp}`
    
    // You would implement proper rate limiting here
    // For now, we'll just continue with the request
    
    // Read database
    const db = await readDB()
    
    // Find the property
    const property = db.properties.find((p: any) => p.id === params.id)
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Validate the base property data
    const validationResult = PropertyResponseSchema.safeParse(property)
    
    if (!validationResult.success) {
      console.error('Property validation failed:', validationResult.error)
      return NextResponse.json(
        { error: 'Invalid property data' },
        { status: 500 }
      )
    }

    // Enrich the property data with additional details
    const enrichedProperty = enrichPropertyData(validationResult.data)

    // Cache headers
    const headers = new Headers()
    headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=30')

    return NextResponse.json(
      { property: enrichedProperty },
      { 
        headers,
        status: 200 
      }
    )
  } catch (error) {
    console.error('Property fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property details' },
      { status: 500 }
    )
  }
}

// PATCH endpoint to update property
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const db = await readDB()
    
    // Find the property
    const propertyIndex = db.properties.findIndex((p: any) => p.id === params.id)
    
    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Validate the update data
    const validationResult = PropertyResponseSchema.partial().safeParse(json)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    // Update the property
    db.properties[propertyIndex] = {
      ...db.properties[propertyIndex],
      ...validationResult.data,
      updatedAt: new Date().toISOString(),
    }
    
    // Write back to database
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))

    return NextResponse.json(
      { property: db.properties[propertyIndex] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Property update error:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await readDB()
    
    // Find the property
    const propertyIndex = db.properties.findIndex((p: any) => p.id === params.id)
    
    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Remove the property
    db.properties.splice(propertyIndex, 1)
    
    // Write back to database
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Property deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}