'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useStore } from '@/lib/store'
import { useProposals } from '@/hooks/use-proposals'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProposalCard } from './proposal/ProposalCard'
import { ProposalCardSkeleton } from './proposal/ProposalCardSkeleton'
import { Users, Vote, TrendingUp, Clock } from 'lucide-react'
import { Status, Proposal } from '@/lib/store/slices/proposalSlice'
import { CreateProposalForm } from './proposal/CreateProposalForm'

export default function UnionHall() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [votingPower, setVotingPower] = useState<number>(0)
  const getUserVotingPower = useStore((state) => state.getUserVotingPower)
  const [showCreateProposal, setShowCreateProposal] = useState(false)

  // Use our cached proposals hook
  const {
    data: proposals = [],
    isLoading,
    error,
  } = useProposals({
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  })

  // Filter proposals by status
  const activeProposals = proposals.filter(
    (p: { status: Status }) => p.status === Status.ACTIVE
  )
  const pendingProposals = proposals.filter(
    (p: { status: Status }) =>
      p.status !== Status.ACTIVE &&
      p.status !== Status.PASSED &&
      p.status !== Status.REJECTED
  )
  const closedProposals = proposals.filter(
    (p: { status: Status }) =>
      p.status === Status.PASSED || p.status === Status.REJECTED
  )

  // Calculate governance stats
  const governanceStats = {
    totalProposals: proposals.length,
    activeProposals: activeProposals.length,
    totalVoters: proposals.reduce(
      (acc: number, p: { votes: { for: any; against: any } }) =>
        acc + new Set([...p.votes.for, ...p.votes.against]).size,
      0
    ),
    participationRate: proposals.length
      ? (
          (proposals.reduce(
            (acc: number, p: { votes: { for: any; against: any } }) =>
              acc + new Set([...p.votes.for, ...p.votes.against]).size,
            0
          ) /
            proposals.length) *
          100
        ).toFixed(1)
      : 0,
  }

  const handleCreateProposal = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your wallet to create a proposal',
        variant: 'destructive',
      })
      return
    }
    setShowCreateProposal(true)
  }

  // Fetch user's voting power
  useEffect(() => {
    const fetchVotingPower = async () => {
      if (user?.address) {
        try {
          const power = await getUserVotingPower(user.address)
          setVotingPower(power)
        } catch (err) {
          console.error('Error fetching voting power:', err)
        }
      }
    }
    fetchVotingPower()
  }, [user?.address, getUserVotingPower])

  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    }
  }, [error, toast])

  // Render skeletons for loading state
  const renderSkeletons = (count: number) => (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProposalCardSkeleton key={i} />
      ))}
    </div>
  )

  // Render content for a tab
  const renderProposals = (proposalList: Proposal[], emptyMessage: string) => {
    if (isLoading) {
      return renderSkeletons(2)
    }

    if (proposalList.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          <Vote className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>{emptyMessage}</p>
          {proposalList === activeProposals && (
            <p className="text-sm">Create a proposal to get started!</p>
          )}
        </div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-4"
      >
        {proposalList.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </motion.div>
    )
  }

  return (
    <>
      <CreateProposalForm
        open={showCreateProposal}
        onOpenChange={setShowCreateProposal}
      />

      <div className="min-h-screen bg-background py-12">
        {/* Hero Section */}
        <div className="bg-brand-secondary/5 relative overflow-hidden border-b">
          <div className="container relative z-10 mx-auto py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <h1 className="mb-4 text-4xl font-bold">Union Hall</h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Where property owners come together to make decisions and shape
                the future of our community.
              </p>
            </motion.div>

            {/* Governance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-primary/10 text-brand-primary rounded-full p-3">
                      <Vote className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">
                        {governanceStats.totalProposals}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Proposals
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-accent/10 text-brand-accent rounded-full p-3">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">
                        {governanceStats.activeProposals}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Active Proposals
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-success/10 text-brand-success rounded-full p-3">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">
                        {governanceStats.totalVoters}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Voters
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-secondary/10 text-brand-secondary rounded-full p-3">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">
                        {governanceStats.participationRate}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Participation Rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Decorative Background */}
          <div className="absolute inset-0 z-0 opacity-30">
            <div className="from-brand-primary/10 to-brand-accent/10 absolute inset-0 bg-gradient-to-br" />
            <svg
              className="absolute right-0 top-0 h-full w-1/2"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 L100,0 L100,100 L0,100 Z"
                fill="url(#union-pattern)"
                fillOpacity="0.1"
              />
              <defs>
                <pattern
                  id="union-pattern"
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                >
                  <path
                    d="M0,0 L10,10 M10,0 L0,10"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Sidebar - User's Union Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Your Union Card</CardTitle>
                    <CardDescription>
                      Your voice in the community
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-brand-secondary/5 space-y-2 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Voting Power
                        </span>
                        <span className="text-2xl font-bold">
                          {votingPower}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Based on your total property fractions owned
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Properties Owned
                        </span>
                        <span>{user?.investments?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Proposals Voted
                        </span>
                        <span>
                          {proposals.reduce(
                            (
                              acc: number,
                              p: {
                                votes: {
                                  for: string | string[]
                                  against: string | string[]
                                }
                              }
                            ) =>
                              acc +
                              (user?.address &&
                              (p.votes.for.includes(user.address) ||
                                p.votes.against.includes(user.address))
                                ? 1
                                : 0),
                            0
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Proposals Created
                        </span>
                        <span>
                          {
                            proposals.filter(
                              (p: {
                                creator: { address: string | undefined }
                              }) => p.creator.address === user?.address
                            ).length
                          }
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleCreateProposal}
                      disabled={!isAuthenticated}
                    >
                      Create Proposal
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Content - Proposals */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Tabs defaultValue="active" className="space-y-6">
                  <TabsList className="grid w-[400px] grid-cols-3">
                    <TabsTrigger value="active">
                      Active ({activeProposals.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      Pending ({pendingProposals.length})
                    </TabsTrigger>
                    <TabsTrigger value="closed">
                      Closed ({closedProposals.length})
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <TabsContent
                      value="active"
                      className="min-h-[300px] space-y-4"
                    >
                      {renderProposals(
                        activeProposals,
                        'No active proposals at the moment.'
                      )}
                    </TabsContent>

                    <TabsContent
                      value="pending"
                      className="min-h-[300px] space-y-4"
                    >
                      {renderProposals(
                        pendingProposals,
                        'No pending proposals.'
                      )}
                    </TabsContent>

                    <TabsContent
                      value="closed"
                      className="min-h-[300px] space-y-4"
                    >
                      {renderProposals(closedProposals, 'No closed proposals.')}
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
