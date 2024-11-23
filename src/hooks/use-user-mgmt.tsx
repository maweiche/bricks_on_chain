import { useCallback, useEffect, useState } from 'react'

import { User, UserSettings } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

interface UserWithSettings extends User {
  settings?: UserSettings
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserWithSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = useCallback(
    async (userId: string, newRole: 'user' | 'admin') => {
      try {
        const res = await fetch(`/api/users/${userId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        })

        if (!res.ok) throw new Error('Failed to update role')

        toast({
          title: 'Success',
          description: `User role updated to ${newRole}`,
        })

        fetchUsers()
      } catch (error) {
        console.error('Failed to update user role:', error)
        toast({
          title: 'Error',
          description: 'Failed to update user role',
          variant: 'destructive',
        })
      }
    },
    [fetchUsers, toast]
  )

  const handleBulkDelete = useCallback(
    async (userIds: string[]) => {
      try {
        const res = await fetch('/api/users/bulk-delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds }),
        })

        if (!res.ok) throw new Error('Failed to delete users')

        toast({
          title: 'Success',
          description: `Successfully deleted ${userIds.length} user(s)`,
        })

        setSelectedUsers([])
        fetchUsers()
      } catch (error) {
        console.error('Failed to delete users:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete users',
          variant: 'destructive',
        })
      }
    },
    [fetchUsers, toast]
  )

  return {
    users,
    loading,
    selectedUsers,
    setSelectedUsers,
    handleRoleChange,
    handleBulkDelete,
    fetchUsers,
  }
}
