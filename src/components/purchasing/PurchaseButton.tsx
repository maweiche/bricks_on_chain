import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

interface PurchaseButtonProps {
  property: {
    id: any;
    title: string;
    price: number;
    fundingGoal: number;
    currentFunding: number;
    funded: boolean;
  };
}

export function PurchaseButton({ property }: PurchaseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fractionCount, setFractionCount] = useState(1);
  const { toast } = useToast();
  const user = useStore(state => state.user);
  const FRACTION_PRICE = 100; // Price per fraction in USD

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!user?.address) {
        throw new Error('No wallet connected');
      }

      const response = await fetch(`/api/properties/${property.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          fractionCount,
          pricePerFraction: FRACTION_PRICE,
          totalAmount: fractionCount * FRACTION_PRICE,
          wallet: user.address
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Purchase failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful!",
        description: `Transaction ID: ${data.transactionId}`,
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={property.funded}
        variant={property.funded ? "secondary" : "default"}
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
                max={Math.floor((property.fundingGoal - property.currentFunding) / FRACTION_PRICE)}
                value={fractionCount}
                onChange={(e) => setFractionCount(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div className="flex justify-between text-sm">
              <span>Total Amount:</span>
              <span className="font-medium">
                ${(fractionCount * FRACTION_PRICE).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => purchaseMutation.mutate()}
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
  );
}