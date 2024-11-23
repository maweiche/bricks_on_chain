import React from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Investment {
  id: string
  propertyId: string
  amount: number
  fractionCount: number
  purchaseDate: string
  transactionSignature: string
}

interface Property {
  id: string
  title: string
}

interface RecentInvestmentsProps {
  investments: Investment[]
  properties: Property[]
}

const RecentInvestments: React.FC<RecentInvestmentsProps> = ({
  investments,
  properties,
}) => {
  // Sort investments by purchase date (most recent first)
  const sortedInvestments = [...investments]
    .sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    )
    .slice(0, 5) // Get only the 5 most recent investments

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Investments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedInvestments.length > 0 ? (
            sortedInvestments.map((investment) => {
              const property = properties?.find(
                (p) => p.id === investment.propertyId
              )
              return (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="bg-brand-primary h-2 w-2 rounded-full" />
                      <p className="text-sm font-medium">
                        {property?.title || 'Property Investment'}
                      </p>
                    </div>
                    <p className="ml-4 text-xs text-muted-foreground">
                      ${investment.amount.toLocaleString()} -{' '}
                      {investment.fractionCount} fraction(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(investment.purchaseDate),
                        'MMM dd, HH:mm'
                      )}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {investment.transactionSignature.slice(0, 8)}...
                    </p>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent investments
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentInvestments
