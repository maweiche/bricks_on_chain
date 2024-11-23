import React, { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { Users, Wallet, Vote, Settings, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

interface User {
  name: string
  address: string
  investments?: {
    id: string
    propertyId: string
    amount: number
    fractionCount: number
    purchaseDate: string
    transactionSignature?: string
  }[]
}

interface Property {
  id: string
  title: string
}

interface Proposal {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  type: string
  status: string
  votingPower: {
    for: number
    against: number
  }
  creator: {
    name: string
    address: string
  }
  votes: {
    for: string[]
    against: string[]
  }
}

interface AdminActivityFeedProps {
  users: User[]
  properties: { properties: Property[] }
  proposals: { proposals: Proposal[] }
}

const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({
  users,
  properties,
  proposals,
}) => {
  // Combine and format all activities
  const activities = useMemo(() => {
    const allActivities: {
      id: string
      type: string
      timestamp: string
      user:
        | { name: string; address: string }
        | { name: string; address: string }
        | { name: string; address: string }
      details:
        | {
            amount: number
            fractionCount: number
            propertyTitle: string
            transactionSignature: string | undefined
          }
        | {
            title: string
            type: string
            status: string
            votingPower: { for: number; against: number }
          }
        | { proposalTitle: string; vote: string }
    }[] = []

    // Process investments
    users.forEach((user) => {
      user.investments?.forEach((investment) => {
        const property = properties.properties.find(
          (p) => p.id === investment.propertyId
        )
        allActivities.push({
          id: investment.id,
          type: 'INVESTMENT',
          timestamp: investment.purchaseDate,
          user: {
            name: user.name,
            address: user.address,
          },
          details: {
            amount: investment.amount,
            fractionCount: investment.fractionCount,
            propertyTitle: property?.title || 'Unknown Property',
            transactionSignature: investment.transactionSignature,
          },
        })
      })
    })

    // Process proposal activities
    proposals.proposals.forEach((proposal) => {
      // Add proposal creation
      allActivities.push({
        id: `${proposal.id}_creation`,
        type: 'PROPOSAL',
        timestamp: proposal.createdAt,
        user: proposal.creator,
        details: {
          title: proposal.title,
          type: proposal.type,
          status: proposal.status,
          votingPower: proposal.votingPower,
        },
      })

      // Add significant voting activities
      if (proposal.votes.for.length > 0 || proposal.votes.against.length > 0) {
        proposal.votes.for
          .concat(proposal.votes.against)
          .forEach((voterAddress) => {
            const voter = users.find((u) => u.address === voterAddress)
            if (voter) {
              allActivities.push({
                id: `${proposal.id}_vote_${voterAddress}`,
                type: 'VOTE',
                timestamp: proposal.updatedAt,
                user: {
                  name: voter.name,
                  address: voter.address,
                },
                details: {
                  proposalTitle: proposal.title,
                  vote: proposal.votes.for.includes(voterAddress)
                    ? 'for'
                    : 'against',
                },
              })
            }
          })
      }
    })

    // Sort all activities by timestamp, most recent first
    return allActivities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [users, properties, proposals])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'INVESTMENT':
        return <Wallet className="h-4 w-4" />
      case 'PROPOSAL':
        return <Vote className="h-4 w-4" />
      case 'VOTE':
        return <Users className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getActivityBadge = (type: string, details?: any) => {
    switch (type) {
      case 'INVESTMENT':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
          >
            Investment
          </Badge>
        )
      case 'PROPOSAL':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
          >
            {details?.type?.replace(/_/g, ' ')}
          </Badge>
        )
      case 'VOTE':
        return (
          <Badge
            variant="outline"
            className={
              details?.vote === 'for'
                ? 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'
            }
          >
            Vote {details?.vote}
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-4 rounded-lg border p-2 md:p-4 w-full"
          >
            <div className="rounded-full bg-muted p-2">
              {getActivityIcon(activity.type)}
            </div>

            <div className="w-full space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  {activity.user?.name || 'Anonymous'}
                </p>
                {getActivityBadge(activity.type, activity.details)}
              </div>

              {activity.type === 'INVESTMENT' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {'amount' in activity.details && (
                      <>
                        Invested {formatCurrency(activity.details.amount)} (
                        {activity.details.fractionCount} fractions) in{' '}
                        {activity.details.propertyTitle}
                      </>
                    )}
                    <br />
                    <time className="md:hidden text-right text-xs text-muted-foreground">
                      <span className="font-bold">Date:</span> {format(parseISO(activity.timestamp), 'MMM dd, HH:mm')}
                    </time>
                  </p>
                  {'transactionSignature' in activity.details &&
                    activity.details.transactionSignature && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between md:justify-start h-8 gap-2 p-0 text-xs text-muted-foreground hover:text-primary"
                        asChild
                      >
                        <a
                          href={`https://solscan.io/tx/${activity.details.transactionSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="font-mono">
                            {activity.details.transactionSignature.slice(0, 8)}
                            ...
                          </span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                </>
              )}

              {activity.type === 'PROPOSAL' && 'title' in activity.details && (
                <p className="text-sm text-muted-foreground">
                  Created proposal: {activity.details.title}
                  <span className="ml-2 text-xs">
                    ({activity.details.votingPower.for}% for /{' '}
                    {activity.details.votingPower.against}% against)
                  </span>
                </p>
              )}

              {activity.type === 'VOTE' && 'vote' in activity.details && (
                <p className="text-sm text-muted-foreground">
                  Voted {activity.details.vote} {activity.details.proposalTitle}
                </p>
              )}
            </div>

            <time className="hidden md:block text-right text-xs text-muted-foreground">
              {format(parseISO(activity.timestamp), 'MMM dd, HH:mm')}
            </time>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  )
}

export default AdminActivityFeed
