'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme'
import UserDropdown from './UserDropdown'
import { useAuth } from '@/hooks/use-auth'
import { useWallet } from '@solana/wallet-adapter-react'
import DevAuthButton from './DevAuthButton'

const navItems = [
  { name: 'Explore Properties', path: '/properties' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const { publicKey } = useWallet()
  const toggleMenu = () => setIsOpen(!isOpen)

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
              <Image src="/logo.svg" alt="Logo" width={48} height={48} />
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
                    'text-sm font-medium transition-colors hover:font-semibold hover:text-primary hover:border-2 border-primary px-4 py-2 bg-white rounded-full ',
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
            {user  ? (
              <UserDropdown user={user} />
            ) : (
              <motion.div variants={itemVariants}>
                <DevAuthButton />
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
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
              className="border-t md:hidden"
            >
              <div className="container space-y-4 py-4">
                {navItems.map((item) => (
                  <motion.div
                    key={item.path}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Link
                      href={item.path}
                      className={cn(
                        'block py-2 text-base font-medium transition-colors hover:text-primary',
                        pathname === item.path
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="pt-4"
                >
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Connect Wallet
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </React.Suspense>
  )
}
