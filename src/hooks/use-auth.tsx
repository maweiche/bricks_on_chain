import { useWallet } from '@solana/wallet-adapter-react'
import { useStore } from '@/lib/store'
import { useEffect, useState, useCallback } from 'react'

export function useAuth() {
  const { connected, publicKey, disconnect: walletDisconnect } = useWallet()
  const user = useStore(state => state.user)
  const isAdmin = useStore(state => state.isAdmin)
  const checkAuth = useStore(state => state.checkAuth)
  const [authState, setAuthState] = useState({
    isLoading: true,
    isInitialized: false,
    lastCheckedAddress: null as string | null,
    checkingAuth: false
  })

  const handleAuthCheck = useCallback(async (address: string) => {
    if (authState.checkingAuth) return
    
    try {
      setAuthState(prev => ({ ...prev, checkingAuth: true }))
      await checkAuth(address)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
        lastCheckedAddress: address,
        checkingAuth: false
      }))
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
        lastCheckedAddress: null,
        checkingAuth: false
      }))
    }
  }, [checkAuth])

  // Effect for web3 wallet auth
  useEffect(() => {
    if (!connected || !publicKey) {
      // Don't reset state if we have a test user
      if (!user) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
          lastCheckedAddress: null,
          checkingAuth: false
        }))
      }
      return
    }

    const address = publicKey.toString()
    
    if (address !== authState.lastCheckedAddress && !authState.checkingAuth) {
      handleAuthCheck(address)
    }
  }, [connected, publicKey, handleAuthCheck, authState.lastCheckedAddress, authState.checkingAuth, user])

  // Effect for test user auth
  useEffect(() => {
    if (user && !connected) {
      setAuthState({
        isLoading: false,
        isInitialized: true,
        lastCheckedAddress: user.address,
        checkingAuth: false
      })
    }
  }, [user, connected])

  const isAuthenticated = Boolean(
    (connected && publicKey && user && !authState.isLoading && 
     authState.isInitialized && authState.lastCheckedAddress === publicKey.toString()) ||
    // Allow test users to be authenticated without a wallet
    (!connected && user && !authState.isLoading && authState.isInitialized)
  )

  return {
    user,
    isAdmin,
    isAuthenticated,
    isLoading: authState.isLoading || !authState.isInitialized,
    walletConnected: connected && !!publicKey
  }
}