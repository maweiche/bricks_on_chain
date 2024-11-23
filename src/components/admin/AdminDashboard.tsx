'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Building, Vote, LayoutDashboard, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserList } from '@/components/admin/UserList'
import PropertyAdmin from '@/components/admin/PropertyAdmin'
import ProposalsAdmin from '@/components/admin/ProposalAdmin'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import AdminSettings from '@/components/admin/AdminSettings'
import AdminActivityFeed from './AdminActivityFeed'

const users = require('../../../data/users.json')
const properties = require('../../../data/properties.json')
const proposals = require('../../../data/proposals.json')

type Tab = {
  id: string
  label: string
  icon: React.ReactNode
  count?: number
  description: string
  component: React.ReactNode
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <LayoutDashboard className="h-5 w-5" />,
    description: 'Platform statistics and overview',
    component: <AdminOverview />, // We'll create this component
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="h-5 w-5" />,
    description: 'Manage platform users',
    component: <UserList />,
  },
  {
    id: 'properties',
    label: 'Properties',
    icon: <Building className="h-5 w-5" />,
    description: 'Manage property listings',
    component: <PropertyAdmin />,
  },
  {
    id: 'proposals',
    label: 'Proposals',
    icon: <Vote className="h-5 w-5" />,
    description: 'Manage governance proposals',
    component: <ProposalsAdmin />,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    description: 'Platform configuration',
    component: <AdminSettings />, // We'll create this component
  },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(tabs[0].id)

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b"
      >
        <div className="container py-6">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your platform settings and content
          </p>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="container py-6">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted hover:bg-muted/80'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
                {tab.count && (
                  <span className="ml-2 rounded-full bg-primary-foreground/10 px-2 py-0.5 text-xs">
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Active Tab Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center text-sm text-muted-foreground"
        >
          {tabs.find((tab) => tab.id === activeTab)?.description}
        </motion.div>
      </div>

      {/* Content */}
      <div className="container py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {tabs.find((tab) => tab.id === activeTab)?.component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// New Overview component
function AdminOverview() {
  const stats = [
    {
      label: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Properties',
      value: '156',
      change: '+3%',
      icon: <Building className="h-4 w-4" />,
    },
    {
      label: 'Active Proposals',
      value: '24',
      change: '+8%',
      icon: <Vote className="h-4 w-4" />,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={cn(
                      'rounded-full p-2',
                      'bg-primary/10 text-primary'
                    )}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600">{stat.change}</span>
                  <span className="ml-2 text-muted-foreground">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminActivityFeed
            users={users}
            properties={properties}
            proposals={proposals}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
