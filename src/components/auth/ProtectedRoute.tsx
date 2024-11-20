"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { FullScreenLoader } from '@/components/loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading, walletConnected } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const hasAttemptedRedirect = useRef(false)

  useEffect(() => {
    if (isLoading) return

    if (!hasAttemptedRedirect.current) {
      if (!walletConnected) {
        hasAttemptedRedirect.current = true
        toast({
          title: 'Please Connect',
          description: 'Please connect your wallet to access this page.',
        })
        router.replace('/')
        return
      }

      if (!isAuthenticated) {
        // Wait for authentication to complete
        return
      }

      if (requireAdmin && !isAdmin) {
        hasAttemptedRedirect.current = true
        toast({
          title: 'Admin Access Required',
          description: 'You need admin permissions to access this page.',
        })
        router.replace('/dashboard')
        return
      }
    }
  }, [isLoading, walletConnected, isAuthenticated, isAdmin, requireAdmin, router, toast])

  // Always show loading when authenticating
  if (isLoading) {
    return <FullScreenLoader text="Verifying access..." />
  }

  // Show loading when wallet is connected but auth isn't complete
  if (walletConnected && !isAuthenticated) {
    return <FullScreenLoader text="Checking permissions..." />
  }

  // Only render children when fully authenticated and authorized
  if (isAuthenticated && (!requireAdmin || isAdmin)) {
    return <>{children}</>
  }

  // Return null while handling redirect
  return null
}