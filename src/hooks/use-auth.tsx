import { useWallet } from '@solana/wallet-adapter-react'
import { useStore } from '@/lib/store'
import { useEffect, useState, useCallback } from 'react'

export function useAuth() {
  const { connected, publicKey } = useWallet()
  const user = useStore((state) => state.user)
  const isAdmin = useStore((state) => state.isAdmin)
  const checkAuth = useStore((state) => state.checkAuth)
  const createProfile = useStore((state) => state.createProfile)
  const updateProfile = useStore((state) => state.updateProfile)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [authState, setAuthState] = useState({
    isLoading: true,
    isInitialized: false,
    lastCheckedAddress: null as string | null,
    checkingAuth: false,
  })

  const handleAuthCheck = useCallback(
    async (address: string) => {
      if (authState.checkingAuth) return

      try {
        setAuthState((prev) => ({ ...prev, checkingAuth: true }))
        await checkAuth(address)

        // Check if user exists in store after checkAuth
        const currentUser = useStore.getState().user

        // If no user found and dialog not showing, show it
        if (!currentUser && !showProfileDialog) {
          setShowProfileDialog(true)
        }

        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
          lastCheckedAddress: address,
          checkingAuth: false,
        }))
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
          lastCheckedAddress: null,
          checkingAuth: false,
        }))
      }
    },
    [checkAuth, authState.checkingAuth, showProfileDialog]
  )

  // Handle profile creation
  const handleCreateProfile = useCallback(
    async (data: { name: string; email: string }) => {
      if (!publicKey) return

      try {
        await createProfile({
          address: publicKey.toString(),
          ...data,
          id: `user_${Math.floor(Math.random() * 10000000000000)}`,
          joinedAt: new Date(),
          role: 'user',
        })
        setShowProfileDialog(false)
      } catch (error) {
        console.error('Profile creation failed:', error)
        throw error
      }
    },
    [publicKey, createProfile]
  )

  // Handle profile update
  const handleUpdateProfile = useCallback(
    async (data: { name: string; email: string }) => {
      if (!user) return

      try {
        await updateProfile({
          id: user.id,
          ...data,
          address: '',
          joinedAt: new Date(),
          role: 'user',
        })
      } catch (error) {
        console.error('Profile update failed:', error)
        throw error
      }
    },
    [user, updateProfile]
  )

  // Effect for web3 wallet auth
  useEffect(() => {
    if (!connected || !publicKey) {
      if (!user) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
          lastCheckedAddress: null,
          checkingAuth: false,
        }))
      }
      return
    }

    const address = publicKey.toString()

    if (address !== authState.lastCheckedAddress && !authState.checkingAuth) {
      handleAuthCheck(address)
    }
  }, [
    connected,
    publicKey,
    handleAuthCheck,
    authState.lastCheckedAddress,
    authState.checkingAuth,
    user,
  ])

  // Effect for test user auth
  useEffect(() => {
    if (user && !connected) {
      setAuthState({
        isLoading: false,
        isInitialized: true,
        lastCheckedAddress: user.address,
        checkingAuth: false,
      })
    }
  }, [user, connected])

  const isAuthenticated = Boolean(
    (connected &&
      publicKey &&
      user &&
      !authState.isLoading &&
      authState.isInitialized &&
      authState.lastCheckedAddress === publicKey.toString()) ||
      (!connected && user && !authState.isLoading && authState.isInitialized)
  )

  return {
    user,
    isAdmin,
    isAuthenticated,
    isLoading: authState.isLoading || !authState.isInitialized,
    walletConnected: connected && !!publicKey,
    showProfileDialog,
    setShowProfileDialog,
    handleCreateProfile,
    handleUpdateProfile,
  }
}
