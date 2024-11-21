import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute
      requireAdmin // 👈 Uncomment to turn-on add requireAdmin prop
    >
      {children}
    </ProtectedRoute>
  )
}
