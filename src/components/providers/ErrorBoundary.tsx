// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FullScreenLoader, ButtonLoader } from '../loading'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

export function SuspenseBoundary({ 
  children,
  fullScreen = false,
  onError 
}: {
  children: ReactNode;
  fullScreen?: boolean;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}) {
  return (
    <ErrorBoundary
      onError={onError}
      fallback={fullScreen ? <FullScreenLoader /> : <ButtonLoader />}
    >
      {children}
    </ErrorBoundary>
  )
}