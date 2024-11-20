import { useWallet } from '@solana/wallet-adapter-react'
import { useStore } from '@/lib/store'
import { useEffect, useState } from 'react'

export function useAuth() {
  const { connected, publicKey, disconnect: walletDisconnect } = useWallet()
  const user = useStore(state => state.user)
  const isAdmin = useStore(state => state.isAdmin)
  const checkAuth = useStore(state => state.checkAuth)
  const createProfile = useStore(state => state.createProfile)
  const updateProfile = useStore(state => state.updateProfile)
  const [authState, setAuthState] = useState({
    isLoading: true,
    isInitialized: false,
    lastCheckedAddress: null as string | null
  })

  // Debug logging
  useEffect(() => {
    console.log('Current State:', {
      connected,
      publicKey: publicKey?.toString(),
      user,
      isAdmin,
      authState
    })
  }, [connected, publicKey, user, isAdmin, authState])

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const checkUserAuth = async () => {
      if (!connected || !publicKey) {
        if (mounted) {
          setAuthState(prev => ({
            isLoading: false,
            isInitialized: true,
            lastCheckedAddress: null
          }))
        }
        return
      }

      const address = publicKey.toString()

      // Don't recheck the same address
      if (authState.lastCheckedAddress === address) {
        return
      }

      try {
        await checkAuth(address)
        if (mounted) {
          setAuthState({
            isLoading: false,
            isInitialized: true,
            lastCheckedAddress: address
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (mounted) {
          setAuthState({
            isLoading: false,
            isInitialized: true,
            lastCheckedAddress: null
          })
        }
      }
    }

    // Add a small delay to ensure wallet state is stable
    timeoutId = setTimeout(() => {
      checkUserAuth()
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [connected, publicKey, checkAuth, authState.lastCheckedAddress])

  const isAuthenticated = Boolean(
    connected && 
    publicKey &&
    user && 
    !authState.isLoading && 
    authState.isInitialized &&
    authState.lastCheckedAddress === publicKey.toString()
  )

  const isAdminUser = Boolean(isAuthenticated && isAdmin)

  return {
    user,
    isAdmin: isAdminUser,
    isAuthenticated,
    isLoading: authState.isLoading || !authState.isInitialized,
    walletConnected: connected && !!publicKey,
    createProfile,
    updateProfile
  }
}