// hooks/useAuth.ts
import { useWallet } from '@solana/wallet-adapter-react'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export const useAuth = () => {
  const { connected, publicKey, disconnect: walletDisconnect } = useWallet()
  const checkAuth = useStore(state => state.checkAuth)
  const user = useStore(state => state.user)
  const createProfile = useStore(state => state.createProfile)
  const updateProfile = useStore(state => state.updateProfile)
  const { toast } = useToast()
  
  const authChecked = useRef(false)
  const welcomeToastShown = useRef(false)

  // Handle initial auth check
  useEffect(() => {
    const checkUserAuth = async () => {
      if (!publicKey || authChecked.current) return
      
      try {
        authChecked.current = true
        await checkAuth(publicKey.toString())
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }

    if (connected && publicKey) {
      checkUserAuth()
    } else {
      authChecked.current = false
      welcomeToastShown.current = false
    }
  }, [connected, publicKey, checkAuth])

  // Handle welcome notifications
  useEffect(() => {
    if (!welcomeToastShown.current && connected && authChecked.current) {
      welcomeToastShown.current = true

      if (user) {
        // Existing user welcome back
        toast({
          title: `Welcome back, {user.name || 'Anon'}! 🎉`,
          description: (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Connected with {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
            </motion.div>
          ),
        })
      } else {
        // New user welcome
        toast({
          title: ` Welcome to BricksOnChain! 🏠`,
          description: (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <p>Let's set up your profile to get started.</p>
            </motion.div>
          ),
          duration: 5000,
        })
      }
    }
  }, [connected, user, publicKey, toast, authChecked.current])

  const disconnect = useCallback(() => {
    walletDisconnect()
    useStore.getState().disconnect()
    authChecked.current = false
    welcomeToastShown.current = false
  }, [walletDisconnect])

  return {
    user,
    isAuthenticated: !!user && connected,
    disconnect,
    isNewUser: connected && authChecked.current && !user,
    createProfile,
    updateProfile,
  }
}