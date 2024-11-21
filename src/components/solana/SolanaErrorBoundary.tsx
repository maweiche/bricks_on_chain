'use client'

import { Component, ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class SolanaErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error) {
    console.error('Solana Error:', error)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <h2 className="mb-2 text-lg font-semibold">
            Wallet Connection Error
          </h2>
          <p className="mb-4 text-sm">{this.state.error?.message}</p>
          <Button variant="outline" onClick={this.handleRetry}>
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
