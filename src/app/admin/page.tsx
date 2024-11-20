import { UserList } from '@/components/admin/UserList'

export default function AdminPage() {
  return (
    <div className="container mx-auto py-20">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <UserList />
    </div>
  )
}