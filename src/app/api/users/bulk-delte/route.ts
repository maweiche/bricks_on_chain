import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

import { User } from '@/lib/store'

const DB_PATH = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DB_PATH, 'users.json')

export async function DELETE(request: Request) {
  try {
    const { userIds } = await request.json()

    const data = await fs.readFile(USERS_FILE, 'utf-8')
    const users = JSON.parse(data) as User[]

    const updatedUsers = users.filter((user) => !userIds.includes(user.id))

    await fs.writeFile(USERS_FILE, JSON.stringify(updatedUsers, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    )
  }
}
