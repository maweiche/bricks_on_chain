import React, { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, DollarSign, Loader2 } from 'lucide-react'

import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface PurchaseDialogProps {
  isOpen: boolean
  onClose: () => void
  property: {
    id: string
    title: string
    price: number
    fundingGoal: number
    currentFunding: number
    funded: boolean
  }
}

const FRACTION_PRICE = 100 // Price per fraction in USD

export function PurchaseDialog({
  isOpen,
  onClose,
  property,
}: PurchaseDialogProps) {
  const [fractionCount, setFractionCount] = useState(1)
  const [purchaseStep, setPurchaseStep] = useState<
    'input' | 'confirm' | 'processing'
  >('input')
  const addToCart = useStore((state) => state.addItem)
  const setCartOpen = useStore((state) => state.setIsOpen)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Calculate available fractions
  const remainingToFund = property.fundingGoal - property.currentFunding
  const maxFractions = Math.floor(remainingToFund / FRACTION_PRICE)

  // Calculate total investment amount
  const totalAmount = fractionCount * FRACTION_PRICE

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFractionCount(1)
      setPurchaseStep('input')
    }
  }, [isOpen])

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const response = await fetch(`/api/properties/${property.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fractionCount,
          totalAmount,
        }),
      })

      if (!response.ok) {
        throw new Error('Purchase failed')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ['property', property.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['user-investments'],
      })

      // Show success message
      toast({
        title: 'Purchase Successful!',
        description: `You have successfully purchased ${fractionCount} fractions of ${property.title}`,
      })

      // Close dialog
      onClose()
    },
    onError: () => {
      toast({
        title: 'Purchase Failed',
        description:
          'There was an error processing your purchase. Please try again.',
        variant: 'destructive',
      })
      setPurchaseStep('input')
    },
  })

  const handlePurchase = () => {
    if (purchaseStep === 'input') {
      setPurchaseStep('confirm')
    } else if (purchaseStep === 'confirm') {
      setPurchaseStep('processing')
      purchaseMutation.mutate()
    }
  }

  const handleAddToCart = () => {
    addToCart({
      propertyId: property.id,
      propertyTitle: property.title,
      fractionCount,
      pricePerFraction: FRACTION_PRICE,
    })
    setCartOpen(true)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {purchaseStep === 'processing'
              ? 'Processing Purchase'
              : 'Purchase Fractions'}
          </DialogTitle>
          <DialogDescription>
            Each fraction costs ${FRACTION_PRICE}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {purchaseStep === 'input' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Number of Fractions
                </label>
                <Input
                  type="number"
                  min={1}
                  max={maxFractions}
                  value={fractionCount}
                  onChange={(e) =>
                    setFractionCount(
                      Math.min(
                        Math.max(1, parseInt(e.target.value) || 1),
                        maxFractions
                      )
                    )
                  }
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum available: {maxFractions} fractions
                </p>
              </div>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span>Price per fraction</span>
                    <span>${FRACTION_PRICE}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>${totalAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {purchaseStep === 'confirm' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card className="border-2 border-primary">
                <CardContent className="space-y-4 pt-4">
                  <h3 className="font-semibold">Confirm Your Purchase</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Property</span>
                      <span>{property.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fractions</span>
                      <span>{fractionCount}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total Amount</span>
                      <span>${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {purchaseStep === 'processing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-4 py-8"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-sm text-muted-foreground">
                Processing your purchase...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {purchaseStep !== 'processing' && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  if (purchaseStep === 'confirm') {
                    setPurchaseStep('input')
                  } else {
                    onClose()
                  }
                }}
              >
                {purchaseStep === 'confirm' ? 'Back' : 'Cancel'}
              </Button>
              <Button onClick={handlePurchase}>
                {purchaseStep === 'confirm' ? 'Confirm Purchase' : 'Continue'}
              </Button>
            </>
          )}

          {purchaseStep === 'input' && (
            <Button variant="outline" onClick={handleAddToCart}>
              <DollarSign className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
