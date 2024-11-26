import { ErrorBoundary, SuspenseBoundary } from './ErrorBoundary'
import {
  handleSolanaError,
  SolanaErrorType,
  SolanaProvider,
  useAnchorProvider,
  WalletButton,
} from './SolanaProvider'

import ApolloWrapper, { client } from './ApolloProvider'

export {
  WalletButton,
  useAnchorProvider,
  handleSolanaError,
  SolanaErrorType,
  SolanaProvider,
  ErrorBoundary,
  SuspenseBoundary,
  ApolloWrapper,
  client,
}
