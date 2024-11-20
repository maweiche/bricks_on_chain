import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { User } from '@/lib/store/types'

const DB_PATH = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DB_PATH, 'users.json')

// Initialize database
async function initDB() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true })
    try {
      await fs.access(USERS_FILE)
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([]))
    }
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

// Initialize DB on server start
initDB()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    const users = JSON.parse(data) as User[]
    const user = users.find(u => u.address.toLowerCase() === address.toLowerCase())
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json()
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    const users = JSON.parse(data) as User[]
    
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      joinedAt: new Date(),
    }
    
    users.push(newUser)
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
    
    return NextResponse.json({ user: newUser })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...userData } = await request.json()
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    const users = JSON.parse(data) as User[]
    
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...userData,
    }
    
    users[userIndex] = updatedUser
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
    
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}