// components/proposals/vote-history.tsx
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, History } from 'lucide-react'

interface VoteHistoryEntry {
  proposalId: string
  proposalTitle: string
  voteType: 'for' | 'against'
  votingPower: number
  timestamp: string
}

interface VoteHistoryProps {
  history: VoteHistoryEntry[]
}

export function VoteHistory({ history }: VoteHistoryProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="w-4 h-4" />
          Vote History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Your Voting History</SheetTitle>
          <SheetDescription>
            A record of all your votes across proposals
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
          <div className="space-y-4">
            {history.map((entry, index) => (
              <motion.div
                key={`${entry.proposalId}-${entry.timestamp}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{entry.proposalTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.timestamp), 'PPp')}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    entry.voteType === 'for'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {entry.voteType === 'for' ? (
                      <ThumbsUp className="w-4 h-4" />
                    ) : (
                      <ThumbsDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Voting Power: {entry.votingPower}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}