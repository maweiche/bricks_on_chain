// app/api/users/[userId]/settings/route.ts
import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

import { User, UserSettings } from '@/lib/store'

const DB_PATH = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DB_PATH, 'users.json')

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { settings } = await request.json()
    const userId = params.userId

    const data = await fs.readFile(USERS_FILE, 'utf-8')
    const users = JSON.parse(data) as (User & { settings?: UserSettings })[]

    const userIndex = users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    users[userIndex].settings = {
      ...users[userIndex].settings,
      ...settings,
    }

    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))

    return NextResponse.json({ settings: users[userIndex].settings })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
