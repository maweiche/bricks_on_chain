import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThumbsUp, ThumbsDown, Users } from 'lucide-react'
import { Proposal } from '@/lib/store'

interface VoteAnalyticsProps {
  proposal: Proposal
}

export function VoteAnalytics({ proposal }: VoteAnalyticsProps) {
  const totalVotingPower = proposal.votingPower.total
  const votedPower = proposal.votingPower.for + proposal.votingPower.against
  const participation = (votedPower / totalVotingPower) * 100

  const pieData = [
    { name: 'For', value: proposal.votingPower.for },
    { name: 'Against', value: proposal.votingPower.against },
    { name: 'Not Voted', value: totalVotingPower - votedPower },
  ]

  const COLORS = ['#22c55e', '#ef4444', '#94a3b8']

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">For Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-500">
                {proposal.votes.for.length}
              </span>
              <span className="text-sm text-muted-foreground">
                (
                {((proposal.votingPower.for / totalVotingPower) * 100).toFixed(
                  1
                )}
                %)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Against Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-500">
                {proposal.votes.against.length}
              </span>
              <span className="text-sm text-muted-foreground">
                (
                {(
                  (proposal.votingPower.against / totalVotingPower) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">
                {participation.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                of total power
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vote Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
