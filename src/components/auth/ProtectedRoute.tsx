'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { FullScreenLoader } from '@/components/loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading, walletConnected, user } =
    useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const hasAttemptedRedirect = useRef(false)

  useEffect(() => {
    if (isLoading) return

    if (!hasAttemptedRedirect.current) {
      // Allow access if user exists (test user) or wallet is connected
      if (!user && !walletConnected) {
        hasAttemptedRedirect.current = true
        toast({
          title: 'Authentication Required',
          description:
            'Please connect your wallet or login to access this page.',
        })
        router.replace('/')
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
  }, [
    isLoading,
    walletConnected,
    isAuthenticated,
    isAdmin,
    requireAdmin,
    router,
    toast,
    user,
  ])

  // Show loading state while checking auth
  if (isLoading) {
    return <FullScreenLoader />
  }

  // Show loading when authenticating
  if (walletConnected && !isAuthenticated && !user) {
    return <FullScreenLoader />
  }

  // Allow access if authenticated (either via wallet or test user)
  if (isAuthenticated && (!requireAdmin || isAdmin)) {
    return <>{children}</>
  }

  // Return null while handling redirect
  return null
}
