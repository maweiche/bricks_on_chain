'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import {usePathname} from 'next/navigation'
import {ReactNode, Suspense, useState, useEffect, useRef} from 'react'
import { Toaster } from '../ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { ProfileDialog } from '../profile/ProfileDialog'
const Navbar = dynamic(() => import("@/components/layout").then((mod) => mod.Navbar), {
  ssr: false,
});

const Footer = dynamic(() => import("@/components/layout").then((mod) => mod.Footer), {
  ssr: false,
});

export function UiLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated, isNewUser } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Show profile creation modal for new users
  useEffect(() => {
    if (isNewUser) {
      setShowProfileModal(true)
    }
  }, [isNewUser])

  return (
    <main className="h-full flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
          {showProfileModal && (
            <ProfileDialog 
              isOpen={showProfileModal}
              onClose={() => setShowProfileModal(false)}
            />
          )}
        </Suspense>
        <Toaster />
      </div>
      <Footer />
    </main>
  )
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode
  title: string
  hide: () => void
  show: boolean
  submit?: () => void
  submitDisabled?: boolean
  submitLabel?: string
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    if (!dialogRef.current) return
    if (show) {
      dialogRef.current.showModal()
    } else {
      dialogRef.current.close()
    }
  }, [show, dialogRef])

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button className="btn btn-xs lg:btn-md btn-primary" onClick={submit} disabled={submitDisabled}>
                {submitLabel || 'Save'}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode
  title: ReactNode
  subtitle: ReactNode
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === 'string' ? <h1 className="text-5xl font-bold">{title}</h1> : title}
          {typeof subtitle === 'string' ? <p className="py-6">{subtitle}</p> : subtitle}
          {children}
        </div>
      </div>
    </div>
  )
}

export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
  }
  return str
}

export function useTransactionToast() {
    const { toast } = useToast();
  return (signature: string) => {
    toast({
        title: 'Transaction sent...',
        description: `https://explorer.solana.com/account/${signature}`
    })
  }
}
