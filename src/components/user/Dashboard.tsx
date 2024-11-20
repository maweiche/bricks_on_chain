"use client"

import { useAuth } from '@/hooks/use-auth'
import { FullScreenLoader } from '@/components/loading'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Settings } from 'lucide-react'

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const settings = useStore(state => state.settings)

  if (!isAuthenticated) {
    return <FullScreenLoader text="Please connect your wallet..." />
  }

  return (
    <div className="container mx-auto py-20 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$0.00</p>
            <p className="text-sm text-muted-foreground">Total Investment Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
