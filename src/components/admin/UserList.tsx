'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  Download,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Shield,
  Users,
  UserX,
} from 'lucide-react'
import { useUserManagement } from '@/hooks/use-user-mgmt'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Badge } from '../ui/badge'
import { Input } from '../ui/input'

type SortField = 'name' | 'joinedAt' | 'role'
type SortDirection = 'asc' | 'desc'

export function UserList() {
  const {
    users,
    selectedUsers,
    setSelectedUsers,
    handleRoleChange,
    handleBulkDelete,
    fetchUsers,
  } = useUserManagement()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('joinedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToModify, setUserToModify] = useState<string | null>(null)

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = [...users]

    // Apply search filter
    if (search) {
      filtered = filtered.filter((user) => {
        const searchLower = search.toLowerCase()
        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.address.toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1

      switch (sortField) {
        case 'name':
          return direction * (a.name || '').localeCompare(b.name || '')
        case 'joinedAt':
          return (
            direction *
            (new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
          )
        case 'role':
          return direction * a.role.localeCompare(b.role)
        default:
          return 0
      }
    })

    return filtered
  }, [users, search, roleFilter, sortField, sortDirection])

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedUsers(checked ? filteredUsers.map((user) => user.id) : [])
    },
    [filteredUsers, setSelectedUsers]
  )

  const handleSelectUser = useCallback(
    (userId: string, checked: boolean) => {
      setSelectedUsers((prev) =>
        checked ? [...prev, userId] : prev.filter((id) => id !== userId)
      )
    },
    [setSelectedUsers]
  )

  const handleExportUsers = useCallback(() => {
    const data = filteredUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      joinedAt: user.joinedAt,
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [filteredUsers])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registered Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 gap-4">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {roleFilter === 'all'
                      ? 'All Roles'
                      : roleFilter.charAt(0).toUpperCase() +
                        roleFilter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setRoleFilter('all')}>
                    All Roles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('admin')}>
                    Admins Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('user')}>
                    Users Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fetchUsers()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExportUsers}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>User Info</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) =>
                        handleSelectUser(user.id, checked as boolean)
                      }
                      aria-label={`Select ${user.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email || 'No email'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role === 'user' ? (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'admin')}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'user')}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Remove Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setUserToModify(user.id)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg border bg-background/80 p-4 shadow-lg backdrop-blur">
          <span className="text-sm font-medium">
            {selectedUsers.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToModify ? 'Delete User' : 'Delete Selected Users'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToModify
                ? 'Are you sure you want to delete this user? This action cannot be undone.'
                : `Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false)
                setUserToModify(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (userToModify) {
                  // Single user delete
                  await handleBulkDelete([userToModify])
                  setUserToModify(null)
                } else {
                  // Bulk delete
                  await handleBulkDelete(selectedUsers)
                }
                setShowDeleteDialog(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
