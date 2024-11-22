// components/proposals/proposal-history.tsx
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
} from '@/components/ui/timeline'
import { Badge } from '@/components/ui/badge'

interface ProposalHistoryProps {
  proposal: any // Replace with proper type
}

export function ProposalHistory({ proposal }: ProposalHistoryProps) {
  // Generate history events from proposal data
  const events = [
    {
      type: 'created',
      date: proposal.createdAt,
      title: 'Proposal Created',
      description: `Created by ${proposal.creator.name || proposal.creator.address.slice(0, 6)}...`,
    },
    ...proposal.votes.for.map((address: string) => ({
      type: 'vote',
      date: new Date(), // This should come from vote timestamp in real data
      title: 'Vote For',
      description: `${address.slice(0, 6)}... voted for the proposal`,
    })),
    ...proposal.votes.against.map((address: string) => ({
      type: 'vote',
      date: new Date(), // This should come from vote timestamp in real data
      title: 'Vote Against',
      description: `${address.slice(0, 6)}... voted against the proposal`,
    })),
    // Add status changes, etc.
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal History</CardTitle>
      </CardHeader>
      <CardContent>
        <Timeline>
          {events.map((event, index) => (
            <TimelineItem key={index}>
              <TimelineHeader>
                <TimelineIcon />
                <Badge variant="outline">{event.title}</Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(event.date), 'PPp')}
                </span>
              </TimelineHeader>
              <TimelineBody>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              </TimelineBody>
              {index < events.length - 1 && <TimelineConnector />}
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}
