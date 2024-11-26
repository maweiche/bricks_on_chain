import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { PURCHASE_PROPERTY } from '@/lib/apollo/graphql'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface PurchaseButtonProps {
  property: {
    _id: string
    title: string
    price: number
    fundingGoal: number
    currentFunding: number
    funded: boolean
  }
}

export function PurchaseButton({ property }: PurchaseButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fractionCount, setFractionCount] = useState(1)
  const { toast } = useToast()
  const { user } = useAuth()
  const FRACTION_PRICE = 100 // Price per fraction in USD

  const [purchaseProperty, { loading }] = useMutation(PURCHASE_PROPERTY, {
    onCompleted: () => {
      toast({
        title: 'Purchase Successful!',
        description: `Successfully purchased ${fractionCount} fraction(s) of ${property.title}`,
      })
      setIsOpen(false)
    },
    onError: (error) => {
      toast({
        title: 'Purchase Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
    // Optionally update the Apollo cache
    update: (cache, { data }) => {
      cache.modify({
        id: cache.identify(property),
        fields: {
          currentFunding: () => data.purchaseProperty.currentFunding,
          funded: () => data.purchaseProperty.funded,
        },
      })
    },
  })

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your wallet to purchase',
        variant: 'destructive',
      })
      return
    }

    const totalAmount = fractionCount * FRACTION_PRICE

    await purchaseProperty({
      variables: {
        input: {
          propertyId: property._id,
          fractionCount,
          pricePerFraction: FRACTION_PRICE,
          totalAmount,
        },
      },
    })
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={property.funded}
        variant={property.funded ? 'secondary' : 'default'}
        className="w-full"
      >
        {property.funded ? 'Fully Funded' : 'Purchase Now'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Fractions</DialogTitle>
            <DialogDescription>
              Each fraction costs ${FRACTION_PRICE}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Number of Fractions</label>
              <Input
                type="number"
                min={1}
                max={Math.floor(
                  (property.fundingGoal - property.currentFunding) /
                    FRACTION_PRICE
                )}
                value={fractionCount}
                onChange={(e) => setFractionCount(Number(e.target.value))}
                className="mt-1 bg-white/40"
              />
            </div>

            <div className="flex justify-between text-sm">
              <span>Total Amount:</span>
              <span className="font-medium">
                ${(fractionCount * FRACTION_PRICE).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePurchase} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Purchase'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
