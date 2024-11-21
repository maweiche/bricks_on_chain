import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function UnionHallLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
