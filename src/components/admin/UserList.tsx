"use client"

import { useEffect, useState } from 'react'
import { User, UserSettings } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TableSkeleton } from '@/components/loading'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface UserWithSettings extends User {
  settings?: UserSettings
}

export function UserList() {
  const [users, setUsers] = useState<UserWithSettings[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users')
        const data = await res.json()
        if (data.users) {
          setUsers(data.users)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Users...</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} columns={6} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Info</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead>Notifications</TableHead>
              <TableHead>Display Settings</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(user.settings?.theme || 'system')}>
                    {user.settings?.theme || 'system'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="notifications">
                      <AccordionTrigger className="text-sm">
                        View Notifications
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {user.settings?.notifications ? (
                            Object.entries(user.settings.notifications).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-sm capitalize">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </span>
                                <Switch
                                  checked={value}
                                  disabled
                                  className="pointer-events-none"
                                />
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No notification settings</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TableCell>
                <TableCell>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="display">
                      <AccordionTrigger className="text-sm">
                        View Display Settings
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {user.settings?.display ? (
                            Object.entries(user.settings.display).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-sm capitalize">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </span>
                                {typeof value === 'boolean' ? (
                                  <Switch
                                    checked={value}
                                    disabled
                                    className="pointer-events-none"
                                  />
                                ) : (
                                  <Badge variant="secondary">{value}</Badge>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No display settings</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(user.joinedAt).toLocaleDateString()}
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.joinedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function getBadgeVariant(theme: 'light' | 'dark' | 'system'): "default" | "secondary" | "outline" {
  switch (theme) {
    case 'light':
      return 'default'
    case 'dark':
      return 'secondary'
    default:
      return 'outline'
  }
}