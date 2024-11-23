import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface VoteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  voteType: 'for' | 'against'
  votingPower: number
}

export function VoteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  voteType,
  votingPower,
}: VoteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Vote</DialogTitle>
          <DialogDescription>
            You are about to cast your vote with {votingPower} voting power
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-full p-6 ${
              voteType === 'for'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            }`}
          >
            {voteType === 'for' ? (
              <ThumbsUp className="h-12 w-12" />
            ) : (
              <ThumbsDown className="h-12 w-12" />
            )}
          </motion.div>
        </div>

        <DialogFooter className="flex w-full flex-row justify-center gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant={voteType === 'for' ? 'default' : 'destructive'}
            className="gap-2"
          >
            {voteType === 'for' ? (
              <ThumbsUp className="h-4 w-4" />
            ) : (
              <ThumbsDown className="h-4 w-4" />
            )}
            Confirm Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
