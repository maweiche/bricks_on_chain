'use client'

import { ReactNode, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { AnchorProvider } from '@coral-xyz/anchor'
import { WalletError } from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
// Import required wallet adapters
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { Connection, Keypair } from '@solana/web3.js'

import { useToast } from '@/hooks/use-toast'
import { SolanaErrorBoundary } from '@/components/solana'

// Required styles for the wallet modal
require('@solana/wallet-adapter-react-ui/styles.css')

// Custom error types
export enum SolanaErrorType {
  WALLET_CONNECTION = 'WALLET_CONNECTION',
  TRANSACTION = 'TRANSACTION',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

interface SolanaError extends Error {
  type: SolanaErrorType
  details?: unknown
}

// Error handler utility
export const handleSolanaError = (error: unknown) => {
  const solanaError = error as SolanaError
  const { toast } = useToast()

  switch (solanaError.type) {
    case SolanaErrorType.WALLET_CONNECTION:
      toast({
        title: 'Wallet Error',
        description: solanaError.message,
        variant: 'destructive',
      })
      break
    case SolanaErrorType.TRANSACTION:
      toast({
        title: 'Transaction Error',
        description: solanaError.message,
        variant: 'destructive',
      })
      break
    case SolanaErrorType.NETWORK:
      toast({
        title: 'Network Error',
        description: solanaError.message,
        variant: 'destructive',
      })
      break
    default:
      toast({
        title: 'Unknown Error',
        description: solanaError.message,
        variant: 'destructive',
      })
      break
  }

  console.error('Solana Error:', {
    type: solanaError.type,
    message: solanaError.message,
    details: solanaError.details,
  })
}

export const WalletButton = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

// Custom hook for transaction handling
export const useSolanaTransaction = () => {
  const { toast } = useToast()

  const handleTransaction = async (
    transaction: Promise<unknown>,
    options?: {
      onSuccess?: () => void
      onError?: (error: unknown) => void
      successMessage?: string
    }
  ) => {
    const { onSuccess, onError, successMessage } = options || {}

    try {
      toast({
        title: 'Processing Transaction',
        description: 'Please wait...',
      })

      await transaction

      if (successMessage) {
        toast({
          title: 'Transaction Complete',
          description: successMessage,
        })
      }

      onSuccess?.()
    } catch (error) {
      handleSolanaError(error)
      onError?.(error)
    }
  }

  return { handleTransaction }
}

export function SolanaProvider({ children }: { children: ReactNode }) {
  // Configure your network endpoint
  const endpoint = useMemo(() => 'https://api.devnet.solana.com', [])

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  )

  const onError = useCallback((error: WalletError) => {
    handleSolanaError({
      ...error,
      type: SolanaErrorType.WALLET_CONNECTION,
    })
  }, [])

  return (
    <SolanaErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SolanaErrorBoundary>
  )
}

export function useAnchorProvider() {
  const connection = new Connection(
    'https://api.devnet.solana.com',
    'confirmed'
  )
  const wallet = Keypair.generate()

  try {
    // @ts-expect-error - wallet is dummy variable, signing is not needed
    return new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
  } catch (error) {
    handleSolanaError({
      ...(error as Error),
      type: SolanaErrorType.WALLET_CONNECTION,
    })
    throw error
  }
}
