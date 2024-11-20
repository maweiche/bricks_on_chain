import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { User } from '@/lib/store'

const DB_PATH = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DB_PATH, 'users.json')

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { role } = await request.json()
    const userId = params.userId
    
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    const users = JSON.parse(data) as User[]
    
    const userIndex = users.findIndex(user => user.id === userId)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate role
    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid role' }, 
        { status: 400 }
      )
    }
    
    users[userIndex].role = role
    
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
    
    return NextResponse.json({ user: users[userIndex] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}