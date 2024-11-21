import { UserList } from '@/components/admin/UserList'
import PropertyAdmin from '@/components/properties/PropertyAdmin'

export default function AdminPage() {
  return (
    <div className="container mx-auto py-20">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <UserList />
      <PropertyAdmin />
    </div>
  )
}
