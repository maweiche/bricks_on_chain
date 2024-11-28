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
import { VersionedTransaction } from "@solana/web3.js";
import { useWallet } from '@solana/wallet-adapter-react'
import { rpcManager } from '@/lib/rpc/rpc-manager'

interface ProgramPurchaseButtonProps {
  property: {
    account: any,
    details: any,
  }
}

export function ProgramPurchaseButton({ property }: ProgramPurchaseButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fractionCount, setFractionCount] = useState(1)
  const [amount, setAmount] = useState(1); // Initial amount set to 5
  const [isBuying, setIsBuying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast()
  const { user } = useAuth()
  const { sendTransaction, publicKey } = useWallet();
  const FRACTION_PRICE = 100 // Price per fraction in USD

  const [purchaseProperty, { loading }] = useMutation(PURCHASE_PROPERTY, {
    onCompleted: () => {
      toast({
        title: 'Purchase Successful!',
        description: `Successfully purchased ${fractionCount} fraction(s) of ${property.details.name}`,
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
    console.log('handlePurchase -> property', property)
    if (!user && !publicKey) {
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
          propertyId: property.account.id,
          fractionCount,
          pricePerFraction: FRACTION_PRICE,
          totalAmount,
        },
      },
    })
  }

  const buyTx = async(id: number, reference: string, key: string, amount: number, uri: string) => {
    try{
      toast({
        title: 'Preparing transaction...',
      })
      const response = await fetch('/api/protocol/buy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            reference: reference,
            publicKey: key,
            amount: amount,
            uri: uri,
        })
      })
      const { transaction } = await response.json(); //VersionedTransaction
      const tx = VersionedTransaction.deserialize(Buffer.from(transaction, "base64"));
      if(!tx){
        console.log('no transaction');
        return;
      }
      return tx;
    } catch (error) {
      console.error('Error sending transaction', error);
    }
  }

  const handleBuy = async() => {
    setIsBuying(true);
    if (!publicKey) return;
    try {
        const tx = await buyTx(
            Number(property.account.id), 
            "25.766,-80.132", // GPS Coordinates of Property 
            publicKey.toBase58(), 
            amount, 
            property.details.uri
        );
        console.log('tx ->', tx); // VersionedTransaction
        if (!tx) return;
        setIsProcessing(true);
        const RPC = rpcManager.getConnection();
        const signature = await sendTransaction(
            tx,
            RPC,
            { skipPreflight: true }
        );
        console.log('signature ->', signature);
        toast({
            title: 'Transaction sent',
            description: 'Transaction has been sent to the blockchain',
        })
        setIsBuying(false);
        setIsProcessing(false);
        setIsComplete(true);
    } catch (error) {
        console.error('Error sending transaction', error);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        // disabled={property.funded}
        // variant={property.funded ? 'secondary' : 'default'}
        className="w-full"
      >
        {'Purchase Now'}
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
                max={1}
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
              <Button onClick={handleBuy} disabled={loading}>
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
