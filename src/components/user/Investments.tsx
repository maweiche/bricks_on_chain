import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { ChevronRight, ExternalLink } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

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
  location: string
  price: number
  roi: number
  currentFunding: number
  fundingGoal: number
}

interface ConsolidatedInvestmentsProps {
  investmentDetails: Investment[]
  properties: Property[]
}

const ConsolidatedInvestments: React.FC<ConsolidatedInvestmentsProps> = ({
  investmentDetails,
  properties,
}) => {
  // Group investments by property
  const consolidatedInvestments = useMemo(() => {
    const grouped = investmentDetails.reduce(
      (acc: { [key: string]: any }, investment) => {
        const propertyId = investment.propertyId
        if (!acc[propertyId]) {
          acc[propertyId] = {
            property: properties.find((p) => p.id === propertyId),
            totalAmount: 0,
            totalFractions: 0,
            transactions: [],
          }
        }

        acc[propertyId].totalAmount += investment.amount
        acc[propertyId].totalFractions += investment.fractionCount
        acc[propertyId].transactions.push({
          id: investment.id,
          amount: investment.amount,
          fractionCount: investment.fractionCount,
          purchaseDate: investment.purchaseDate,
          transactionSignature: investment.transactionSignature,
        })

        return acc
      },
      {}
    )

    return Object.values(grouped)
  }, [investmentDetails, properties])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      {consolidatedInvestments.map((investment) => (
        <Card key={investment.property.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{investment.property.title}</CardTitle>
              <CardDescription>{investment.property.location}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="icon">
              <Link href={`/properties/${investment.property.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Section */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Total Investment
                </p>
                <p className="text-lg font-semibold">
                  ${investment.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Fractions</p>
                <p className="text-lg font-semibold">
                  {investment.totalFractions}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Property Value</p>
                <p className="text-lg font-semibold">
                  ${investment.property.price.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Expected ROI</p>
                <p className="text-lg font-semibold text-green-500">
                  {investment.property.roi}%
                </p>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Funding Progress</span>
                <span>
                  ${investment.property.currentFunding.toLocaleString()} / $
                  {investment.property.fundingGoal.toLocaleString()}
                </span>
              </div>
              <Progress
                value={
                  (investment.property.currentFunding /
                    investment.property.fundingGoal) *
                  100
                }
                className="h-2"
              />
            </div>

            {/* Transaction History */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="transactions">
                <AccordionTrigger className="text-sm font-medium">
                  Transaction History ({investment.transactions.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {investment.transactions
                      .sort(
                        (
                          a: { purchaseDate: string | number | Date },
                          b: { purchaseDate: string | number | Date }
                        ) =>
                          new Date(b.purchaseDate).getTime() -
                          new Date(a.purchaseDate).getTime()
                      )
                      .map(
                        (transaction: {
                          id: React.Key | null | undefined
                          fractionCount:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | Promise<React.AwaitedReactNode>
                            | null
                            | undefined
                          amount: {
                            toLocaleString: () =>
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactElement<
                                  any,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | React.ReactPortal
                              | Promise<React.AwaitedReactNode>
                              | null
                              | undefined
                          }
                          purchaseDate: string | number | Date
                          transactionSignature: string | any[]
                        }) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between rounded-lg border p-2 text-sm"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="font-mono text-xs"
                                >
                                  {transaction.fractionCount ?? 0} fraction
                                  {Number(transaction.fractionCount ?? 0) > 1
                                    ? 's'
                                    : ''}
                                </Badge>
                                <span className="font-medium">
                                  ${transaction.amount.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(transaction.purchaseDate),
                                  'MMM dd, yyyy HH:mm'
                                )}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 space-x-2"
                              asChild
                            >
                              <a
                                href={`https://solscan.io/tx/${transaction.transactionSignature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span className="font-mono text-xs">
                                  {transaction.transactionSignature.slice(0, 8)}
                                  ...
                                </span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        )
                      )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  )
}

export default ConsolidatedInvestments
