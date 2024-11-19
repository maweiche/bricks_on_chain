"use client"

import dynamic from 'next/dynamic'
import { AnchorProvider } from '@coral-xyz/anchor'
import { WalletError } from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { ReactNode, useCallback, useMemo } from 'react'
import { Connection, Keypair } from '@solana/web3.js'
import { useToast } from '@/hooks/use-toast'
import { SolanaErrorBoundary } from '@/components/blockchain'

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
  const { toast } = useToast();
  switch (solanaError.type) {
    case SolanaErrorType.WALLET_CONNECTION:
        toast({
            title: "Wallet Error",
            description: solanaError.message,
        })
        break
    case SolanaErrorType.TRANSACTION:
        toast({
            title: "Transaction Error",
            description: solanaError.message,
        })
        break
    case SolanaErrorType.NETWORK:
        toast({
            title: "Network Error",
            description: solanaError.message,
        })
        break
    default:
        toast({
            title: "Unknown Error",
            description: solanaError.message,
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
            title: "Processing Transaction",
            description: "Please wait...",
        })
        await transaction
        toast({
            title: "Transaction Complete",
            description: successMessage || "Transaction completed successfully",
        })
        
        if (successMessage) {
            toast({
                title: "Transaction Complete",
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
  const endpoint = useMemo(() => 'https://api.devnet.solana.com', [])
  
  const onError = useCallback((error: WalletError) => {
    handleSolanaError({
      ...error,
      type: SolanaErrorType.WALLET_CONNECTION,
    })
  }, [])

  return (
    <SolanaErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SolanaErrorBoundary>
  )
}

export function useAnchorProvider() {
  const connection = new Connection(
    'https://api.devnet.solana.com',
    "confirmed"
  )
  const wallet = Keypair.generate()
  
  try {
    // @ts-expect-error - wallet is dummy variable, signing is not needed
    return new AnchorProvider(connection, wallet, { commitment: "confirmed" })
  } catch (error) {
    handleSolanaError({
      ...error as Error,
      type: SolanaErrorType.WALLET_CONNECTION,
    })
    throw error
  }
}