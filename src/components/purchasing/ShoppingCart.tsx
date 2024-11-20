import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useStore } from '@/lib/store';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Loader2,
  Check,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const quantityVariants = {
  updated: { scale: 1.2, transition: { duration: 0.2 } },
  normal: { scale: 1, transition: { duration: 0.2 } }
};

export function Cart() {
    const {
        items,
        isOpen,
        setIsOpen,
        removeItem,
        updateItemCount,
        clearCart,
        getTotalAmount,
        user,
    } = useStore();
  
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();

    // Reference for quantity animations
    const quantityRefs = React.useRef<{ [key: string]: number }>({});

    // Mutation for checkout
    const checkoutMutation = useMutation({
        mutationFn: async () => {
          if (!user?.address) {
            throw new Error('No wallet connected');
          }
    
          const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              items,
              wallet: user.address // Include wallet address
            }),
          });
    
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Checkout failed');
          }
    
          return response.json();
        },
        onSuccess: (data) => {
          toast({
            title: "Purchase Successful!",
            description: `Transaction ID: ${data.transactionId}`,
          });
          clearCart();
          setIsOpen(false);
        },
        onError: (error: Error) => {
          toast({
            title: "Checkout Failed",
            description: error.message,
            variant: "destructive",
          });
        },
    });

    // Animation for removing items
    const handleRemoveItem = async (propertyId: string) => {
        const element = document.getElementById(`cart-item-${propertyId}`);
        if (element) {
            await element.animate([
                { transform: 'translateX(0)', opacity: 1 },
                { transform: 'translateX(100%)', opacity: 0 }
            ], {
                duration: 300,
                easing: 'ease-out'
            }).finished;
        }
        removeItem(propertyId);
    };

  const CartContents = () => (
    <>
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
        <SheetDescription>
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </SheetDescription>
      </SheetHeader>

      {items.length > 0 ? (
        <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <motion.div
                                key={item.propertyId}
                                id={`cart-item-${item.propertyId}`}
                                layout
                                variants={itemVariants}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, x: 100 }}
                                className="mb-4"
                            >
                                <Card>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{item.propertyTitle}</h3>
                                        <p className="text-sm text-muted-foreground">
                                        ${item.pricePerFraction} per fraction
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:text-destructive"
                                        onClick={() => handleRemoveItem(item.propertyId)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center space-x-2">
                                        <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            updateItemCount(
                                            item.propertyId,
                                            Math.max(1, item.fractionCount - 1)
                                            );
                                            quantityRefs.current[item.propertyId] = (quantityRefs.current[item.propertyId] || 0) - 1;
                                        }}
                                        >
                                        <Minus className="w-4 h-4" />
                                        </Button>
                                        <motion.span
                                        className="w-8 text-center"
                                        animate={
                                            quantityRefs.current[item.propertyId] !== item.fractionCount
                                            ? "updated"
                                            : "normal"
                                        }
                                        variants={quantityVariants}
                                        >
                                        {item.fractionCount}
                                        </motion.span>
                                        <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            updateItemCount(
                                            item.propertyId,
                                            item.fractionCount + 1
                                            );
                                            quantityRefs.current[item.propertyId] = (quantityRefs.current[item.propertyId] || 0) + 1;
                                        }}
                                        >
                                        <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <motion.p
                                        className="font-medium"
                                        layout
                                    >
                                        ${item.totalAmount.toLocaleString()}
                                    </motion.p>
                                    </div>
                                </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </ScrollArea>

            <SheetFooter className="flex-col space-y-4">
                <motion.div 
                    className="flex justify-between items-center w-full text-lg font-semibold"
                    layout
                >
                    <span>Total</span>
                    <motion.span layout>
                        ${getTotalAmount().toLocaleString()}
                    </motion.span>
                </motion.div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <Button
                        variant="outline"
                        onClick={clearCart}
                    >
                        Clear Cart
                    </Button>
                    <Button
                        onClick={() => checkoutMutation.mutate()}
                        disabled={checkoutMutation.isPending || !isAuthenticated}
                    >
                        {!isAuthenticated ? (
                            "Connect Wallet"
                        ) : checkoutMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Checkout
                            </>
                        )}
                    </Button>
                </div>
            </SheetFooter>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <ShoppingCart className="w-12 h-12 mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground">
            Add property fractions to get started
          </p>
        </div>
      )}
    </>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
            className="w-full sm:max-w-lg transition-transform duration-300"
        >
            <CartContents />
        </SheetContent>
    </Sheet>
  );
}