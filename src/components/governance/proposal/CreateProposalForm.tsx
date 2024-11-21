import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Proposal, useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays } from 'date-fns'
import { Calendar as CalendarIcon, Edit, Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const proposalFormSchema = z.object({
    title: z.string()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must not exceed 100 characters"),
    description: z.string()
      .min(20, "Description must be at least 20 characters")
      .max(1000, "Description must not exceed 1000 characters"),
    type: z.enum(['PROPERTY_IMPROVEMENT', 'MAINTENANCE', 'POLICY_CHANGE', 'OTHER']),
    endDate: z.date()
      .min(new Date(), "End date must be in the future")
      .max(addDays(new Date(), 30), "End date cannot be more than 30 days in the future"),
    requiredQuorum: z.coerce.number() // Added coerce for number conversion
      .min(1, "Quorum must be at least 1%")
      .max(100, "Quorum cannot exceed 100%"),
  })
  
type ProposalFormValues = z.infer<typeof proposalFormSchema> & {
  votes?: {
    for: any[];
    against: any[];
  };
  votingPower?: {
    for: number;
    against: number;
    total: number;
  };
  status?: string;
}

interface CreateProposalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposal?: Proposal | null 
  onClose?: () => void 
}

async function createOrUpdateProposal(data: ProposalFormValues & { id?: string, creator: any }) {
  const isEdit = !!data.id
  const response = await fetch(`/api/proposals${isEdit ? `/${data.id}` : ''}`, {
    method: isEdit ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `Failed to ${isEdit ? 'update' : 'create'} proposal`)
  }
  
  return response.json()
}

export function CreateProposalForm({ 
  open, 
  onOpenChange, 
  proposal = null,
  onClose 
}: CreateProposalFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { handleError } = useErrorHandler()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      title: proposal?.title || '',
      description: proposal?.description || '',
      type: proposal?.type || 'POLICY_CHANGE',
      endDate: proposal ? new Date(proposal.endDate) : addDays(new Date(), 7),
      requiredQuorum: proposal?.requiredQuorum || 51,
    },
  })

  // Reset form when proposal changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: proposal?.title || '',
        description: proposal?.description || '',
        type: proposal?.type || 'POLICY_CHANGE',
        endDate: proposal ? new Date(proposal.endDate) : addDays(new Date(), 7),
        requiredQuorum: proposal?.requiredQuorum || 51,
      })
    }
  }, [form, proposal, open])

  const mutation = useMutation({
    mutationFn: createOrUpdateProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      toast({
        title: "Success",
        description: `Proposal ${proposal ? 'updated' : 'created'} successfully`,
      })
      form.reset()
      onOpenChange(false)
      onClose?.()
    },
    onError: (error) => {
      handleError(error, {
        title: `Failed to ${proposal ? 'Update' : 'Create'} Proposal`,
        defaultMessage: `Could not ${proposal ? 'update' : 'create'} proposal. Please try again.`,
      })
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  async function onSubmit(values: ProposalFormValues) {
    if (!user?.address) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to continue",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await mutation.mutateAsync({
        ...values,
        id: proposal?.id, // Include id if editing
        creator: proposal?.creator || {
          id: user.id,
          address: user.address,
          name: user.name,
        },
        // Preserve existing vote data if editing
        votes: proposal?.votes || { for: [], against: [] },
        votingPower: proposal?.votingPower || { for: 0, against: 0, total: 100 },
        status: proposal?.status || 'ACTIVE',
      })
    } catch (error) {
      console.error('Submission error:', error)
      handleError(error, {
        title: `Failed to ${proposal ? 'Update' : 'Create'} Proposal`,
        defaultMessage: `Could not ${proposal ? 'update' : 'create'} proposal. Please try again.`,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>
            {proposal ? 'Edit Proposal' : 'Create New Proposal'}
          </DialogTitle>
          <DialogDescription>
            {proposal 
              ? 'Edit the existing proposal details.'
              : 'Create a new proposal for the community to vote on.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter proposal title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, concise title for your proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your proposal in detail" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about your proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proposal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROPERTY_IMPROVEMENT">
                          Property Improvement
                        </SelectItem>
                        <SelectItem value="MAINTENANCE">
                          Maintenance
                        </SelectItem>
                        <SelectItem value="POLICY_CHANGE">
                          Policy Change
                        </SelectItem>
                        <SelectItem value="OTHER">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The category of your proposal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) =>
                            date.getTime() < new Date().getTime() || date.getTime() > addDays(new Date(), 30).getTime()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When voting will end (max 30 days)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requiredQuorum"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Required Quorum (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={100}
                      {...field}
                      onChange={event => field.onChange(+event.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Percentage of total voting power needed for the proposal to pass
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                  onClose?.()
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {proposal ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {proposal ? (
                      <>
                        <Edit className="h-4 w-4" />
                        Update Proposal
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Proposal
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}