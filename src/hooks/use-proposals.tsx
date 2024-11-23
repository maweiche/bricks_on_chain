import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import type { Proposal } from '@/lib/store/slices/proposalSlice'

interface UseProposalsOptions {
  staleTime?: number
  cacheTime?: number
  refetchInterval?: number | false
}

export const proposalKeys = {
  all: ['proposals'] as const,
  lists: () => [...proposalKeys.all, 'list'] as const,
  list: (filters: any) => [...proposalKeys.lists(), { filters }] as const,
  details: () => [...proposalKeys.all, 'detail'] as const,
  detail: (id: string) => [...proposalKeys.details(), id] as const,
}

async function fetchProposals() {
  const response = await fetch('/api/proposals')
  if (!response.ok) throw new Error('Failed to fetch proposals')
  return response.json().then((data) => data.proposals)
}

async function fetchProposal(id: string) {
  const response = await fetch(`/api/proposals/${id}`)
  if (!response.ok) throw new Error('Failed to fetch proposal')
  return response.json().then((data) => data.proposal)
}

async function submitVote(proposalId: string, voteData: any) {
  const response = await fetch(`/api/proposals/${proposalId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(voteData),
  })
  if (!response.ok) throw new Error('Failed to submit vote')
  return response.json()
}

export function useProposals(options: UseProposalsOptions = {}) {
  const { toast } = useToast()
  const setProposals = useStore((state) => state.setProposals)
  const queryClient = useQueryClient()

  const {
    staleTime = 1000 * 60 * 5, // 5 minutes
    cacheTime = 1000 * 60 * 30, // 30 minutes
    refetchInterval = false,
  } = options

  const query = useQuery({
    queryKey: proposalKeys.lists(),
    queryFn: fetchProposals,
    staleTime,
    gcTime: cacheTime, // Changed from cacheTime to gcTime
    refetchInterval,
    select: (data) => {
      setProposals(data) // Move setProposals to select function
      return data
    },
    retry: 3,
  })

  // Mutation for voting with optimistic updates
  const voteMutation = useMutation({
    mutationFn: ({
      proposalId,
      voteData,
    }: {
      proposalId: string
      voteData: {
        voteType: 'for' | 'against'
        userAddress: string
        votingPower: number
      }
    }) => submitVote(proposalId, voteData),
    onMutate: async ({ proposalId, voteData }) => {
      await queryClient.cancelQueries({ queryKey: proposalKeys.lists() })
      const previousProposals = queryClient.getQueryData<Proposal[]>(
        proposalKeys.lists()
      )

      queryClient.setQueryData<Proposal[]>(proposalKeys.lists(), (old = []) => {
        return old.map((proposal) => {
          if (proposal.id === proposalId) {
            return {
              ...proposal,
              votes: {
                for:
                  voteData.voteType === 'for'
                    ? [...proposal.votes.for, voteData.userAddress]
                    : proposal.votes.for,
                against:
                  voteData.voteType === 'against'
                    ? [...proposal.votes.against, voteData.userAddress]
                    : proposal.votes.against,
              },
              votingPower: {
                ...proposal.votingPower,
                [voteData.voteType]:
                  proposal.votingPower[voteData.voteType as 'for' | 'against'] +
                  voteData.votingPower,
              },
            }
          }
          return proposal
        })
      })

      return { previousProposals }
    },
    onError: (context: { previousProposals?: Proposal[] }) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(
          proposalKeys.lists(),
          context.previousProposals
        )
      }
      toast({
        title: 'Error',
        description: 'Failed to submit vote. Please try again.',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() })
    },
  })

  return {
    ...query,
    voteMutation,
    error: query.error ? (query.error as Error).message : undefined,
  }
}

export function useProposal(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: proposalKeys.detail(id),
    queryFn: () => fetchProposal(id),
    staleTime: 1000 * 60 * 5,
    initialData: () => {
      const proposals = queryClient.getQueryData<Proposal[]>(
        proposalKeys.lists()
      )
      return proposals?.find((p) => p.id === id)
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(proposalKeys.lists())?.dataUpdatedAt,
    retry: 3,
  })
}
