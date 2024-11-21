'use client'

import React, { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  SlidersHorizontal,
  FileBarChart,
  History as HistoryIcon,
} from 'lucide-react'

import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Proposal, Status } from '@/lib/store/slices/proposalSlice'
import { CreateProposalForm } from '../governance/proposal/CreateProposalForm'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { ProposalsFilters } from '../governance/proposal/ProposalFilters'
import { VoteAnalytics } from '../governance/proposal/VoteAnalytics'
import { ProposalHistory } from '../governance/proposal/ProposalHistory'

export default function ProposalsAdmin() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // State
  const [selectedProposals, setSelectedProposals] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  })

  // Queries
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const res = await fetch('/api/proposals')
      return res.json()
    },
  })

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/proposals/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error('Failed to delete proposals')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      toast({
        title: 'Success',
        description: 'Proposals deleted successfully',
      })
      setSelectedProposals([])
      setShowDeleteConfirm(false)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete proposals',
        variant: 'destructive',
      })
    },
  })

  // Filter and sort proposals
  const filteredProposals = useMemo(() => {
    if (!proposals?.proposals) return []
    
    return proposals.proposals
      .filter((proposal: Proposal) => {
        const matchesSearch = proposal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          proposal.description.toLowerCase().includes(filters.search.toLowerCase())
        const matchesStatus = filters.status === 'all' || proposal.status === filters.status
        const matchesType = filters.type === 'all' || proposal.type === filters.type
        return matchesSearch && matchesStatus && matchesType
      })
      .sort((a: Proposal, b: Proposal) => {
        const order = filters.sortOrder === 'asc' ? 1 : -1
        switch (filters.sortBy) {
          case 'createdAt':
            return order * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          case 'endDate':
            return order * (new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
          case 'votingPower':
            const powerA = a.votingPower.for + a.votingPower.against
            const powerB = b.votingPower.for + b.votingPower.against
            return order * (powerB - powerA)
          case 'title':
            return order * a.title.localeCompare(b.title)
          default:
            return 0
        }
      })
  }, [proposals, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleDeleteSelected = () => {
    setShowDeleteConfirm(true)
  }

  const handleSelectProposal = (id: string) => {
    setSelectedProposals((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const getStatusBadgeColor = (status: Status) => {
    switch (status) {
      case Status.ACTIVE:
        return 'bg-green-100 text-green-800'
      case Status.PASSED:
        return 'bg-blue-100 text-blue-800'
      case Status.REJECTED:
        return 'bg-red-100 text-red-800'
      case Status.EXPIRED:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header and Actions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Proposal Management</h1>
          <div className="space-x-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Proposal
            </Button>
            
            {selectedProposals.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Selected ({selectedProposals.length})
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <ProposalsFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Proposals Table */}
      <div className="rounded-lg bg-card shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedProposals.length === filteredProposals.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProposals(filteredProposals.map((p: Proposal) => p.id))
                    } else {
                      setSelectedProposals([])
                    }
                  }}
                  className="rounded"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filteredProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <p className="text-muted-foreground">No proposals found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map((proposal: Proposal) => (
                  <motion.tr
                    key={proposal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProposals.includes(proposal.id)}
                        onChange={() => handleSelectProposal(proposal.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {proposal.title}
                    </TableCell>
                    <TableCell>{proposal.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(proposal.status)}>
                        {proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(proposal.endDate.toString()), 'PP')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">
                          For: {proposal.votes.for.length}
                        </span>
                        <span className="text-red-600">
                          Against: {proposal.votes.against.length}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProposal(proposal)
                            setIsAddDialogOpen(true)
                          }}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProposal(proposal)
                            setShowAnalytics(true)
                          }}
                          title="Analytics"
                        >
                          <FileBarChart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProposal(proposal)
                            setShowHistory(true)
                          }}
                          title="History"
                        >
                          <HistoryIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleSelectProposal(proposal.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Proposal Dialog */}
      <CreateProposalForm 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        proposal={selectedProposal}
        onClose={() => {
          setSelectedProposal(null)
          setIsAddDialogOpen(false)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Proposals"
        description={`Are you sure you want to delete ${selectedProposals.length} proposal${selectedProposals.length === 1 ? '' : 's'}? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate(selectedProposals)}
        isLoading={deleteMutation.isPending}
        confirmText="Delete"
        variant="destructive"
      />

      {/* Analytics Sheet */}
      <Sheet open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SheetContent side="right" className="w-full sm:w-[600px] z-[101]">
          <SheetHeader>
            <SheetTitle>Proposal Analytics</SheetTitle>
          </SheetHeader>
          {selectedProposal && (
            <VoteAnalytics proposal={selectedProposal} />
          )}
        </SheetContent>
      </Sheet>

      {/* History Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="right" className="w-full sm:w-[600px] z-[101]">
          <SheetHeader>
            <SheetTitle>Proposal History</SheetTitle>
          </SheetHeader>
          {selectedProposal && (
            <ProposalHistory proposal={selectedProposal} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}