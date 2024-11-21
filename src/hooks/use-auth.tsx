import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

import { useStore } from '@/lib/store'

export function useAuth() {
  const { connected, publicKey, disconnect: walletDisconnect } = useWallet()
  const user = useStore((state) => state.user)
  const isAdmin = useStore((state) => state.isAdmin)
  const isSimulated = useStore((state) => state.isSimulated)
  const checkAuth = useStore((state) => state.checkAuth)
  const createProfile = useStore((state) => state.createProfile)
  const updateProfile = useStore((state) => state.updateProfile)
  const [authState, setAuthState] = useState({
    isLoading: true,
    isInitialized: false,
    lastCheckedAddress: null as string | null,
  })

  useEffect(() => {
    let mounted = true

    const initializeAuthState = () => {
      if (isSimulated && user) {
        // Handle simulated auth
        setAuthState({
          isLoading: false,
          isInitialized: true,
          lastCheckedAddress: user.address,
        })
        return
      }

      if (!connected || !publicKey) {
        setAuthState({
          isLoading: false,
          isInitialized: true,
          lastCheckedAddress: null,
        })
        return
      }

      const address = publicKey.toString()
      if (authState.lastCheckedAddress !== address) {
        checkAuth(address)
      }
    }

    initializeAuthState()
    return () => {
      mounted = false
    }
  }, [connected, publicKey, user, isSimulated, checkAuth])

  const isAuthenticated = Boolean(
    (isSimulated || (connected && publicKey)) &&
    user &&
    !authState.isLoading &&
    authState.isInitialized
  )

  const isAdminUser = Boolean(isAuthenticated && isAdmin)

  return {
    user,
    isAdmin: isAdminUser,
    isAuthenticated,
    isLoading: authState.isLoading || !authState.isInitialized,
    walletConnected: isSimulated || (connected && !!publicKey),
    createProfile,
    updateProfile,
  }
}