'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function NavbarSkeleton() {
  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Skeleton className="h-8 w-24" /> {/* Logo area */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-4">
            {/* Nav items skeletons */}
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {/* Action buttons skeletons */}
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function FooterSkeleton() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col gap-4 py-8">
        <div className="flex justify-between">
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" /> {/* Logo */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" /> {/* Description */}
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-20" /> {/* Section title */}
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-4 w-24" /> /* Links */
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between pt-4 border-t">
          <Skeleton className="h-4 w-48" /> {/* Copyright */}
          <div className="flex space-x-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" /> /* Social icons */
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm">
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin">
            <div className="h-full w-full rounded-full border-4 border-primary/10 border-t-primary" />
          </div>
          <div className="absolute inset-3 animate-pulse">
            <div className="h-full w-full rounded-full bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ButtonLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/20 border-t-foreground" />
    </div>
  )
}

export function TableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center space-x-4 py-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-32" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rowCount }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-3">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="h-5 w-32" />
          ))}
        </div>
      ))}
    </div>
  )
}