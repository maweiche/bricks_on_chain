'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Menu,
  X,
  Home,
  Settings,
  Vote,
  LogOut,
  LockKeyhole,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WalletButton } from '@/components/providers'
import DevAuthButton from './DevAuthButton'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/lib/store'
import UserDropdown from './UserDropdown'
import { useSolanaPrice } from '@/hooks/use-solana-price'
import {
  IconBuilding,
  IconCurrencyDollar,
  IconCurrencySolana,
  IconDashboard,
} from '@tabler/icons-react'
import { USDC_MINT } from '@/components/solana'
import { rpcManager } from '@/lib/rpc/rpc-manager'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { useEffect } from 'react'

const navItems = [{ name: 'Explore Properties', path: '/properties' }]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const { solToUsd, currentPrice } = useSolanaPrice()
  const logout = useStore((state) => state.disconnect)
  const toggleMenu = () => setIsOpen(!isOpen)
  const [userBalance, setUserBalance] = React.useState({ sol: 0, usdc: 0 })

  const navVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  }

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

  return (
    <React.Suspense fallback={null}>
      <motion.nav
        className="fixed top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/horizontal-logo.svg"
                alt="Logo"
                width={48}
                height={48}
                className="h-[68px] w-auto"
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.path}
                  className={cn(
                    'rounded-full border-primary bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-2 hover:font-semibold hover:text-primary',
                    pathname === item.path
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <ThemeToggle />
            {user ? (
              <UserDropdown />
            ) : (
              <motion.div variants={itemVariants}>
                <DevAuthButton />
              </motion.div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            {user && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.pfp} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
            )}
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="fixed left-0 right-0 top-[64px] z-50 border-t bg-zinc-200/90 backdrop-blur-lg"
            >
              <div className="container py-4">
                {user && (
                  <div className="flex w-full flex-col items-center p-1">
                    <div className="mb-4 flex items-center space-x-4 p-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.pfp} alt={user.name} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.address.slice(0, 4)}...{user.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-row items-center justify-center gap-4 rounded-lg bg-accent/50">
                        <span className="text-sm text-card-foreground">
                          Buying power
                        </span>
                        <span className="text-lg font-semibold">
                          $
                          {(
                            solToUsd(userBalance.sol) + userBalance.usdc
                          ).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex w-full flex-row items-center space-x-2">
                        <div className="flex w-1/2 items-center justify-between rounded-lg bg-accent/50 p-2">
                          <div className="flex items-center">
                            <div className="rounded-full bg-background p-1">
                              <IconCurrencySolana className="h-4 w-4" />
                            </div>
                            <span className="ml-2 flex flex-row text-nowrap text-xs">
                              {' '}
                              {userBalance.sol.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex w-1/2 items-center justify-between rounded-lg bg-accent/50 p-2">
                          <div className="flex items-center space-x-2">
                            <div className="rounded-full bg-background p-1">
                              <IconCurrencyDollar className="h-4 w-4" />
                            </div>
                            <span className="flex flex-row text-nowrap text-xs">
                              {userBalance.usdc.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row items-center justify-center gap-4 rounded-lg bg-accent/50 px-2">
                        <span className="text-sm text-card-foreground">
                          Current Solana Price
                        </span>
                        <span className="text-lg font-semibold">
                          ${((currentPrice || 0) / 100000000).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="my-2" />

                {/* Navigation Links */}
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        'flex items-center space-x-2 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent',
                        pathname === item.path ? 'bg-accent' : 'text-black'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <IconBuilding className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                {user ? (
                  <>
                    <Separator className="my-2" />

                    {/* User Navigation */}
                    <div className="space-y-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        <IconDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        href="/union"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        <Vote className="h-4 w-4" />
                        <span>Governance</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-2 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent"
                        >
                          <LockKeyhole className="h-4 w-4" />
                          <span>Admin</span>
                        </Link>
                      )}
                    </div>

                    <Separator className="my-2" />

                    {/* Wallet Section */}
                    {!user && (
                      <div className="space-y-2 p-2">
                        <WalletButton className="w-full" />
                      </div>
                    )}

                    {/* Logout */}
                    <Button
                      variant="destructive"
                      className="mt-2 w-full"
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="mt-2 p-2">
                    <DevAuthButton />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </React.Suspense>
  )
}
