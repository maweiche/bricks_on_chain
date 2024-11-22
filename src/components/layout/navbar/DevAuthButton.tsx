import React from 'react'
import { Users } from 'lucide-react'
import { useStore } from '@/lib/store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { WalletButton } from '@/components/providers'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

const DevAuthButton = () => {
  const simulateAuth = useStore((state) => state.simulateAuth)
  const { toast } = useToast()

  const simulateUser = async () => {
    try {
      // Fetch first user from the database
      const response = await fetch('/api/users?limit=1')
      const data = await response.json()

      if (!data.user) {
        throw new Error('No test user found')
      }

      // Simulate auth with the fetched user
      simulateAuth(data.user)

      toast({
        title: 'Authenticated as Test User',
        description: `Logged in as ${data.user.name}`,
      })
    } catch (error) {
      console.error('Failed to simulate auth:', error)
      toast({
        title: 'Authentication Failed',
        description: 'Could not connect as test user',
        variant: 'destructive',
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>Connect</span>
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex h-fit w-48 flex-col items-center justify-center gap-2 py-6"
      >
        <DropdownMenuItem
          className="cursor-pointer text-sm"
          onClick={simulateUser}
        >
          <Users className="mr-2 h-4 w-4" />
          Connect as Test User
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-24 cursor-pointer overflow-hidden"
          asChild
        >
          <WalletButton className="w-full justify-start" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DevAuthButton
