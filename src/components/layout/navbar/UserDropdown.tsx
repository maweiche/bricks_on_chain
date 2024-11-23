'use client'

import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDown,
  Copy,
  LogOut,
  Settings,
  Vote,
  LockKeyhole,
} from 'lucide-react'
import {
  IconCurrencyDollar,
  IconCurrencySolana,
  IconDashboard,
} from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { useSolanaPrice } from '@/hooks/use-solana-price'
import { useWallet } from '@solana/wallet-adapter-react'
import { useStore } from '@/lib/store'
import { USDC_MINT } from '@/components/solana'
import { rpcManager } from '@/lib/rpc/rpc-manager'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

const UserDropdown = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const { disconnect } = useWallet()
  const logout = useStore((state) => state.disconnect)
  const { solToUsd, currentPrice } = useSolanaPrice()
  const [userBalance, setUserBalance] = useState({ sol: 0, usdc: 0 })

  useEffect(() => {
    const getBalances = async (pubKey: PublicKey) => {
      try {
        const connection = rpcManager.getConnection()
        const balance = await connection.getBalance(pubKey)
        const usdcAta = await getAssociatedTokenAddress(
          new PublicKey(USDC_MINT),
          pubKey
        )
        const usdcBalance = await connection.getBalance(usdcAta)

        setUserBalance({
          sol: balance / LAMPORTS_PER_SOL,
          usdc: usdcBalance,
        })
      } catch (error) {
        console.error('Failed to fetch balances:', error)
      }
    }

    if (user) {
      getBalances(new PublicKey(user.address))
    }
  }, [user])

  if (!user) return null

  const handleLogout = async () => {
    await disconnect(), logout(), router.push('/')
    toast({
      title: 'Logged out',
      description: 'Successfully logged out',
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied to clipboard',
      description: text,
    })
  }

  return (
    <div className="hidden md:block">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger>
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={user.pfp} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="mt-2 w-[300px] rounded-lg border border-border bg-card/60 px-4 py-3 backdrop-blur-lg dark:bg-secondary/60"
        >
          {/* User Info */}
          <div className="flex items-center space-x-3 pb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.pfp} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.name}</p>
              <div className="flex items-center text-sm text-card-foreground">
                <span className="truncate">
                  {user.address.slice(0, 4)}...{user.address.slice(-4)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => copyToClipboard(user.address)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="space-y-3 py-3">
            <div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
              <span className="text-sm text-card-foreground">
                Current Solana Price
              </span>
              <span className="text-lg font-semibold">
                ${((currentPrice || 0) / 100000000).toFixed(2)}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Buying Power Section */}
          <div className="space-y-3 py-3">
            <div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
              <span className="text-sm text-card-foreground">
                Total Buying Power
              </span>
              <span className="text-lg font-semibold">
                ${(solToUsd(userBalance.sol) + userBalance.usdc).toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-background p-1">
                    <IconCurrencySolana className="h-4 w-4" />
                  </div>
                  <span className="text-sm">
                    {userBalance.sol.toFixed(4)} SOL
                  </span>
                </div>
                <span className="text-sm text-card-foreground">
                  ≈ ${solToUsd(userBalance.sol).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-background p-1">
                    <IconCurrencyDollar className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{userBalance.usdc} USDC</span>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Navigation Links */}
          <div className="py-2">
            <DropdownMenuItem
              className="flex items-center space-x-2 rounded-lg px-2 py-2"
              onSelect={() => router.push('/dashboard')}
            >
              <IconDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center space-x-2 rounded-lg px-2 py-2"
              onSelect={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center space-x-2 rounded-lg px-2 py-2"
              onSelect={() => router.push('/union')}
            >
              <Vote className="h-4 w-4" />
              <span>Governance</span>
            </DropdownMenuItem>

            {user.role === 'admin' && (
              <DropdownMenuItem
                className="flex items-center space-x-2 rounded-lg px-2 py-2"
                onSelect={() => router.push('/admin')}
              >
                <LockKeyhole className="h-4 w-4" />
                <span>Admin</span>
              </DropdownMenuItem>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Logout */}
          <div className="pt-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                handleLogout()
                setIsOpen(false)
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserDropdown
