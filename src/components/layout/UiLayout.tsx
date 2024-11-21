'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import {ReactNode, useState, useEffect} from 'react'
import { Toaster } from '../ui/toaster'
import { useAuth } from '@/hooks/use-auth'
import { ProfileDialog } from '../profile/ProfileDialog'
import { useStore } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button'
import { ErrorBoundary, SuspenseBoundary } from '@/components/providers'
import { NavbarSkeleton, FooterSkeleton } from '@/components/loading'

const Navbar = dynamic(() => import("@/components/layout").then((mod) => mod.Navbar), {
  loading: () => <NavbarSkeleton />,
  ssr: false,
});

const Footer = dynamic(() => import("@/components/layout").then((mod) => mod.Footer), {
  loading: () => <FooterSkeleton />,
  ssr: false,
});

const Cart = dynamic(() => import('../purchasing/ShoppingCart').then(mod => mod.Cart), {
  loading: () => null,
  ssr: false,
});

export function UiLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, walletConnected } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ErrorBoundary
      onError={(error, info) => {
        console.error('Layout error:', error, info)
      }}
    >
      <main className="h-full w-full flex flex-col">
        <Navbar />
        
        <div className="flex-grow">
          <SuspenseBoundary 
            fullScreen
            onError={(error) => {
              console.error('Suspense error:', error)
            }}
          >
            {mounted ? children : null}
          </SuspenseBoundary>
          
          <ErrorBoundary fallback={null}>
            {mounted && walletConnected && !isLoading && !isAuthenticated && (
              <ProfileDialog 
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
              />
            )}
          </ErrorBoundary>
          
          <ErrorBoundary fallback={null}>
            <Toaster />
          </ErrorBoundary>
          
          <ErrorBoundary fallback={null}>
            {mounted && <Cart />}
          </ErrorBoundary>
          
          <ErrorBoundary fallback={null}>
            {mounted && <CartButton />}
          </ErrorBoundary>
        </div>

        <Footer />
      </main>
    </ErrorBoundary>
  )
}

function CartButton() {
  const { items, setIsOpen, getTotalFractions } = useStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-[100]"
      onClick={() => setIsOpen(true)}
    >
      <ShoppingCart className="w-5 h-5" />
      {items.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
          {getTotalFractions()}
        </span>
      )}
    </Button>
  );
}

