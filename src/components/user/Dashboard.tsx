'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  Building,
  ChevronRight,
  DollarSign,
  RefreshCcw,
  Wallet,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FullScreenLoader } from '@/components/loading'

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()

  // Fetch user's detailed data including investments
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', user?.address],
    queryFn: async () => {
      if (!user?.address) return user // Return the existing user data if no address

      const response = await fetch(`/api/users?address=${user.address}`)
      if (!response.ok) throw new Error('Failed to fetch user data')
      const data = await response.json()
      return data.user
    },
    // Enable query if we have either a web3 wallet or a test user
    enabled: isAuthenticated,
    // Initialize with existing user data
    initialData: user,
  })

  // Fetch properties data to get property details for investments
  const { data: propertiesData, isLoading: isPropertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties')
      if (!response.ok) throw new Error('Failed to fetch properties')
      return response.json()
    },
  })

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Show loader while checking authentication or loading data
  if (!isAuthenticated || isUserLoading || isPropertiesLoading) {
    return <FullScreenLoader />
  }

  // If we have no user data at this point, show an error state
  if (!userData) {
    return (
      <div className="container mx-auto py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">No User Data Found</h2>
        <p className="mt-2 text-muted-foreground">
          There was an error loading your profile. Please try again later.
        </p>
      </div>
    )
  }

  // Calculate investment statistics
  const totalInvested =
    userData.investments?.reduce(
      (sum: any, inv: { amount: any }) => sum + inv.amount,
      0
    ) || 0

  const activeInvestments =
    userData.investments?.filter(
      (inv: { status: string }) => inv.status === 'active'
    ) || []

  const uniqueProperties = new Set(
    activeInvestments.map((inv: { propertyId: any }) => inv.propertyId)
  ).size

  // Get property details for investments
  const investmentDetails = activeInvestments.map(
    (investment: { propertyId: any }) => {
      const property = propertiesData?.properties?.find(
        (p: { id: any }) => p.id === investment.propertyId
      )
      return {
        ...investment,
        property,
      }
    }
  )

  // Generate performance data based on investment dates
  const generatePerformanceData = () => {
    const sortedInvestments = [...activeInvestments].sort(
      (a, b) =>
        new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
    )

    let runningTotal = 0
    return sortedInvestments.map((inv) => {
      runningTotal += inv.amount
      return {
        date: format(new Date(inv.purchaseDate), 'MMM dd'),
        value: runningTotal,
      }
    })
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-20 lg:px-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {userData?.name || 'Investor'}
          </h1>
          <p className="text-muted-foreground">
            Track your investments and discover new opportunities
          </p>
        </div>
        <Button>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">My Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Quick Stats */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Invested
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalInvested.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {activeInvestments.length} investments
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Properties
                  </CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueProperties}</div>
                  <p className="text-xs text-muted-foreground">
                    Properties in portfolio
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Latest Investment
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {activeInvestments[
                      activeInvestments.length - 1
                    ]?.amount.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activeInvestments[activeInvestments.length - 1]
                      ? format(
                          new Date(
                            activeInvestments[
                              activeInvestments.length - 1
                            ].purchaseDate
                          ),
                          'MMM dd, yyyy'
                        )
                      : 'No investments yet'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Fractions
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activeInvestments.reduce(
                      (sum: any, inv: { fractionCount: any }) =>
                        sum + inv.fractionCount,
                      0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Property fractions owned
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Investment Growth Chart */}
            <motion.div
              variants={itemVariants}
              className="col-span-1 md:col-span-2 lg:col-span-3"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Investment Growth</CardTitle>
                  <CardDescription>
                    Total investment value over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generatePerformanceData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2D3142"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeInvestments
                      .slice(-3)
                      .reverse()
                      .map(
                        (investment: {
                          propertyId: any
                          id: React.Key | null | undefined
                          amount: {
                            toLocaleString: () =>
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactElement<
                                  any,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | React.ReactPortal
                              | Promise<React.AwaitedReactNode>
                              | null
                              | undefined
                          }
                          fractionCount:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | Promise<React.AwaitedReactNode>
                            | null
                            | undefined
                          purchaseDate: string | number | Date
                        }) => {
                          const property = propertiesData?.properties?.find(
                            (p: { id: any }) => p.id === investment.propertyId
                          )
                          return (
                            <div
                              key={investment.id}
                              className="flex items-center"
                            >
                              <div className="bg-brand-primary mr-2 h-2 w-2 rounded-full" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {property?.title || 'Property Investment'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ${investment.amount.toLocaleString()} -{' '}
                                  {investment.fractionCount} fraction(s)
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(investment.purchaseDate),
                                  'MMM dd'
                                )}
                              </p>
                            </div>
                          )
                        }
                      )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="investments">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {investmentDetails.map(
              (investment: {
                id: React.Key | null | undefined
                property: {
                  title: any
                  location:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined
                  fundingGoal: any
                  roi:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined
                }
                amount: number
                fractionCount:
                  | string
                  | number
                  | bigint
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | Promise<React.AwaitedReactNode>
                  | null
                  | undefined
                purchaseDate: string | number | Date
              }) => (
                <motion.div key={investment.id} variants={itemVariants}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle>
                          {investment.property?.title || 'Property Investment'}
                        </CardTitle>
                        <CardDescription>
                          {investment.property?.location}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Investment Amount
                          </span>
                          <span className="font-medium">
                            ${investment.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Fractions Owned
                            </span>
                            <span>{investment.fractionCount}</span>
                          </div>
                          <Progress
                            value={
                              (investment.amount /
                                (investment.property?.fundingGoal || 1)) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Purchase Date
                          </span>
                          <span>
                            {format(
                              new Date(investment.purchaseDate),
                              'MMM dd, yyyy'
                            )}
                          </span>
                        </div>
                        {investment.property?.roi && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Expected ROI
                            </span>
                            <span className="text-green-500">
                              {investment.property.roi}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
