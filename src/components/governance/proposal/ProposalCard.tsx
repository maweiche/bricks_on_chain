import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useStore } from '@/lib/store'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Link,
  Scale,
  ThumbsDown,
  ThumbsUp,
  Users,
  XCircle,
} from 'lucide-react'
import type { Proposal } from '@/lib/store'
import { VoteConfirmationDialog } from '../vote/VoteConfirmation'
import { VoteAnimation } from '../vote/VoteAnimation'
// import { VoteHistory } from '../vote/VoteHistory'
import { useErrorHandler } from '@/hooks/use-error-handler'

interface ProposalCardProps {
  proposal: Proposal
}

async function submitVote(proposalId: string, voteData: any) {
  const response = await fetch(`/api/proposals/${proposalId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voteData }),
  })

  if (!response.ok) {
    throw new Error('Failed to submit vote')
  }

  return response.json()
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isVoting, setIsVoting] = useState(false)
  const [showVoteConfirm, setShowVoteConfirm] = useState(false)
  const [pendingVoteType, setPendingVoteType] = useState<
    'for' | 'against' | null
  >(null)
  const [showVoteAnimation, setShowVoteAnimation] = useState(false)
  const [userVotingPower, setUserVotingPower] = useState(0)
  const { handleError } = useErrorHandler()
  const queryClient = useQueryClient()
  const getUserVotingPower = useStore((state) => state.getUserVotingPower)
  const checkUserVote = useStore((state) => state.checkUserVote)

  const currentVote = user?.address
    ? checkUserVote(proposal.id, user.address)
    : null
  const totalVotes = proposal.votingPower.for + proposal.votingPower.against
  const forPercentage =
    totalVotes > 0 ? (proposal.votingPower.for / totalVotes) * 100 : 0
  const againstPercentage =
    totalVotes > 0 ? (proposal.votingPower.against / totalVotes) * 100 : 0
  const quorumPercentage = (totalVotes / proposal.votingPower.total) * 100

  const voteMutation = useMutation({
    mutationFn: ({
      proposalId,
      voteData,
    }: {
      proposalId: string
      voteData: any
    }) => submitVote(proposalId, voteData),
    onError: (error) => {
      handleError(error, {
        title: 'Vote Failed',
        defaultMessage: 'Failed to submit vote. Please try again.',
        knownErrors: {
          ALREADY_VOTED: 'You have already voted on this proposal',
          PROPOSAL_CLOSED: 'This proposal is no longer accepting votes',
          INSUFFICIENT_POWER: 'You do not have enough voting power',
          // Add more known error cases
        },
      })
    },
    onSuccess: () => {
      setShowVoteAnimation(true)
      setTimeout(() => setShowVoteAnimation(false), 2000)
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })

  const handleVoteClick = async (voteType: 'for' | 'against') => {
    if (!user?.address) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your wallet to vote',
        variant: 'destructive',
      })
      return
    }

    try {
      const power = await getUserVotingPower(user.address)
      setUserVotingPower(power)
      setPendingVoteType(voteType)
      setShowVoteConfirm(true)
    } catch (error) {
      handleError(error, {
        title: 'Error',
        defaultMessage: 'Failed to fetch voting power',
      })
    }
  }

  const handleVoteConfirm = async () => {
    if (!pendingVoteType || !user?.address) return

    setIsVoting(true)
    setShowVoteConfirm(false)

    try {
      await voteMutation.mutateAsync({
        proposalId: proposal.id,
        voteData: {
          voteType: pendingVoteType,
          userAddress: user.address,
          votingPower: userVotingPower,
        },
      })

      toast({
        title: 'Vote Submitted',
        description: 'Your vote has been recorded successfully',
      })
    } finally {
      setIsVoting(false)
      setPendingVoteType(null)
    }
  }

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500'
      case 'PASSED':
        return 'bg-blue-500/10 text-blue-500'
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500'
      case 'EXPIRED':
        return 'bg-gray-500/10 text-gray-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getTypeIcon = (type: Proposal['type']) => {
    switch (type) {
      case 'PROPERTY_IMPROVEMENT':
        return <Building2 className="h-4 w-4" />
      case 'MAINTENANCE':
        return <FileText className="h-4 w-4" />
      case 'POLICY_CHANGE':
        return <Scale className="h-4 w-4" />
      default:
        return <Link className="h-4 w-4" />
    }
  }

  return (
    <>
      <VoteAnimation
        isVisible={showVoteAnimation}
        voteType={pendingVoteType || 'for'}
      />

      <VoteConfirmationDialog
        open={showVoteConfirm}
        onOpenChange={setShowVoteConfirm}
        onConfirm={handleVoteConfirm}
        onCancel={() => {
          setShowVoteConfirm(false)
          setPendingVoteType(null)
        }}
        voteType={pendingVoteType || 'for'}
        votingPower={userVotingPower}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{proposal.title}</CardTitle>
                <CardDescription>
                  Created by{' '}
                  {proposal.creator.name ||
                    proposal.creator.address.slice(0, 6)}
                  ...
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={cn('ml-2', getStatusColor(proposal.status))}
              >
                {proposal.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {getTypeIcon(proposal.type)}
                <span>{proposal.type.replace(/_/g, ' ')}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Ends {format(new Date(proposal.endDate), 'MMM d, yyyy')}
                </span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>
                  {proposal.votes.for.length + proposal.votes.against.length}{' '}
                  Votes
                </span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{proposal.description}</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quorum Progress</span>
                  <span>{quorumPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={quorumPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      For
                    </span>
                    <span>{forPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={forPercentage} className="h-2 bg-red-200" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4" />
                      Against
                    </span>
                    <span>{againstPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={againstPercentage}
                    className="h-2 bg-green-200"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-6">
            <TooltipProvider>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentVote === 'for' ? 'default' : 'outline'}
                      size="lg"
                      className="w-28"
                      onClick={() => handleVoteClick('for')}
                      disabled={
                        isVoting ||
                        proposal.status !== 'ACTIVE' ||
                        currentVote === 'for'
                      }
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      For
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {currentVote === 'for'
                      ? 'You voted for this proposal'
                      : proposal.status !== 'ACTIVE'
                        ? 'This proposal is no longer active'
                        : 'Vote in favor of this proposal'}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        currentVote === 'against' ? 'default' : 'outline'
                      }
                      size="lg"
                      className="w-28"
                      onClick={() => handleVoteClick('against')}
                      disabled={
                        isVoting ||
                        proposal.status !== 'ACTIVE' ||
                        currentVote === 'against'
                      }
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Against
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {currentVote === 'against'
                      ? 'You voted against this proposal'
                      : proposal.status !== 'ACTIVE'
                        ? 'This proposal is no longer active'
                        : 'Vote against this proposal'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <div className="flex items-center text-sm text-muted-foreground">
              {proposal.status === 'ACTIVE' && (
                <>
                  <Clock className="mr-1 h-4 w-4 ml-2 md:ml-0" />
                  <span className="hidden md:block">
                    {format(new Date(proposal.endDate), 'dd MMM yyyy')}
                  </span>
                  <span className="block md:hidden">
                    {format(new Date(proposal.endDate), 'MMM yyyy')}
                  </span>
                </>
              )}
              {proposal.status === 'PASSED' && (
                <>
                  <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">Passed</span>
                </>
              )}
              {proposal.status === 'REJECTED' && (
                <>
                  <XCircle className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">Rejected</span>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  )
}
