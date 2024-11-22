import { useToast } from '@/hooks/use-toast'

interface ErrorHandlerOptions {
  title: string
  defaultMessage: string
  knownErrors?: Record<string, string>
}

interface ApiError extends Error {
  code?: string
  status?: number
  data?: any
}

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = (error: unknown, options: ErrorHandlerOptions) => {
    console.error('Error:', error)

    let errorMessage = options.defaultMessage
    let errorCode: string | undefined

    if (error instanceof Error) {
      const apiError = error as ApiError

      // Try to extract error code from various error formats
      errorCode =
        apiError.code ||
        apiError.data?.code ||
        (apiError.message.includes(':')
          ? apiError.message.split(':')[0]
          : undefined)

      // Use specific message for known error codes
      if (errorCode && options.knownErrors?.[errorCode]) {
        errorMessage = options.knownErrors[errorCode]
      } else if (
        apiError.message &&
        !apiError.message.includes('fetch failed')
      ) {
        // Use error message if it's not a generic fetch error
        errorMessage = apiError.message
      }

      // Handle specific HTTP status codes
      if (apiError.status) {
        switch (apiError.status) {
          case 401:
            errorMessage = 'Please connect your wallet to continue'
            break
          case 403:
            errorMessage = 'You do not have permission to perform this action'
            break
          case 404:
            errorMessage = 'The requested resource was not found'
            break
          case 429:
            errorMessage = 'Too many requests. Please try again later'
            break
          case 500:
            errorMessage =
              'An internal server error occurred. Please try again later'
            break
        }
      }
    }

    // Show error toast
    toast({
      title: options.title,
      description: errorMessage,
      variant: 'destructive',
      duration: 5000, // Show longer for errors
    })

    // Log detailed error information
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Details')
      console.error(
        'Error Type:',
        error instanceof Error ? error.constructor.name : typeof error
      )
      console.error('Error Code:', errorCode)
      console.error('Original Error:', error)
      if (error instanceof Error) {
        console.error('Stack Trace:', error.stack)
      }
      console.groupEnd()
    }

    // Return formatted error info for potential additional handling
    return {
      message: errorMessage,
      code: errorCode,
      originalError: error,
    }
  }

  return {
    handleError,
  }
}

// Usage example for vote-specific errors
export const voteErrorMessages: Record<string, string> = {
  ALREADY_VOTED: 'You have already voted on this proposal',
  PROPOSAL_CLOSED: 'This proposal is no longer accepting votes',
  INSUFFICIENT_POWER: 'You do not have enough voting power',
  INVALID_VOTE_TYPE: 'Invalid vote type provided',
  PROPOSAL_NOT_FOUND: 'The proposal could not be found',
  PROPOSAL_EXPIRED: 'This proposal has expired',
  VOTE_FAILED: 'Failed to submit your vote. Please try again',
  QUORUM_REACHED: 'The proposal has already reached quorum',
  USER_NOT_FOUND: 'User details could not be found',
  INVALID_VOTING_POWER: 'Invalid voting power calculation',
  NETWORK_ERROR: 'Network error occurred. Please check your connection',
}

// Helper type for known error codes
export type VoteErrorCode = keyof typeof voteErrorMessages

// Example usage:
/*
const { handleError } = useErrorHandler()

try {
  await submitVote()
} catch (error) {
  handleError(error, {
    title: "Vote Failed",
    defaultMessage: "Failed to submit vote. Please try again.",
    knownErrors: voteErrorMessages
  })
}
*/
