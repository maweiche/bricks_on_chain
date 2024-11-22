'use client'

import * as React from 'react'
import { ReactNode, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ShoppingCart } from 'lucide-react'

import { useStore } from '@/lib/store'
import { useAuth } from '@/hooks/use-auth'
import { FooterSkeleton, NavbarSkeleton } from '@/components/loading'
import { ErrorBoundary, SuspenseBoundary } from '@/components/providers'

import { usePathname, useSearchParams } from 'next/navigation'
import { ProfileDialog } from '../profile/ProfileDialog'
import { Button } from '../ui/button'
import { Toaster } from '../ui/toaster'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useWallet } from '@solana/wallet-adapter-react'

const Navbar = dynamic(
  () => import('@/components/layout').then((mod) => mod.Navbar),
  {
    loading: () => <NavbarSkeleton />,
    ssr: false,
  }
)

const Footer = dynamic(
  () => import('@/components/layout').then((mod) => mod.Footer),
  {
    loading: () => <FooterSkeleton />,
    ssr: false,
  }
)

const Cart = dynamic(
  () => import('../purchasing/ShoppingCart').then((mod) => mod.Cart),
  {
    loading: () => null,
    ssr: false,
  }
)

export function UiLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, walletConnected } = useAuth()
  const { publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const showProfileDialog = useStore((state) => state.showProfileDialog)
  const setShowProfileDialog = useStore((state) => state.setShowProfileDialog)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.configure({ showSpinner: false })
    NProgress.start()
    const timer = setTimeout(() => {
      NProgress.done()
    }, 200)

    return () => {
      clearTimeout(timer)
      NProgress.remove()
    }
  }, [pathname, searchParams])

  useEffect(() => {
    if (walletConnected && !isAuthenticated && publicKey) {
      setShowProfileDialog(true)
    }
  }, [walletConnected, isAuthenticated, publicKey, setShowProfileDialog])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ErrorBoundary
      onError={(error, info) => {
        console.error('Layout error:', error, info)
      }}
    >
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col pb-[64px]">
          <div className="flex flex-1 flex-col">
            <SuspenseBoundary
              fullScreen
              onError={(error) => {
                console.error('Suspense error:', error)
              }}
            >
              {mounted ? children : null}
            </SuspenseBoundary>

            <ErrorBoundary fallback={null}>
              {mounted && walletConnected && !isLoading && !isAuthenticated && (
                <ProfileDialog
                  isOpen={showProfileDialog}
                  onClose={() => setShowProfileDialog(false)}
                />
              )}
            </ErrorBoundary>

            <ErrorBoundary fallback={null}>
              <Toaster />
            </ErrorBoundary>

            <ErrorBoundary fallback={null}>{mounted && <Cart />}</ErrorBoundary>

            <ErrorBoundary fallback={null}>
              {mounted && <CartButton />}
            </ErrorBoundary>
          </div>
        </main>
        <div className="bg-background">
          <Footer />
        </div>
      </div>
    </ErrorBoundary>
  )
}

function CartButton() {
  const { items, setIsOpen, getTotalFractions } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 left-6 z-[100] h-12 w-12 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
      onClick={() => setIsOpen(true)}
    >
      <ShoppingCart className="h-5 w-5" />
      {items.length > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {getTotalFractions()}
        </span>
      )}
    </Button>
  )
}
