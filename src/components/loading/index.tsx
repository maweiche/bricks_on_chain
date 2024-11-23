'use client'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: 'beforeChildren',
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export function NavbarSkeleton() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-14 items-center">
        <motion.div variants={itemVariants}>
          <Skeleton className="h-8 w-24" />
        </motion.div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <motion.div
            variants={containerVariants}
            className="flex items-center space-x-4"
          >
            {[1, 2, 3].map((i) => (
              <motion.div key={i} variants={itemVariants}>
                <Skeleton className="h-8 w-16" />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            variants={containerVariants}
            className="flex items-center space-x-2"
          >
            {[1, 2].map((i) => (
              <motion.div key={i} variants={itemVariants}>
                <Skeleton className="h-8 w-8 rounded-full" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export function FooterSkeleton() {
  return (
    <motion.footer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="border-t bg-background"
    >
      <div className="container flex flex-col gap-4 py-8">
        <motion.div
          variants={containerVariants}
          className="flex justify-between"
        >
          <motion.div variants={containerVariants} className="space-y-4">
            <motion.div variants={itemVariants}>
              <Skeleton className="h-8 w-32" />
            </motion.div>
            <motion.div variants={containerVariants} className="space-y-2">
              <motion.div variants={itemVariants}>
                <Skeleton className="h-4 w-48" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <Skeleton className="h-4 w-40" />
              </motion.div>
            </motion.div>
          </motion.div>
          <div className="grid grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                variants={containerVariants}
                className="space-y-3"
              >
                <motion.div variants={itemVariants}>
                  <Skeleton className="h-5 w-20" />
                </motion.div>
                {[1, 2, 3].map((j) => (
                  <motion.div key={j} variants={itemVariants}>
                    <Skeleton className="h-4 w-24" />
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div
          variants={containerVariants}
          className="flex justify-between border-t pt-4"
        >
          <motion.div variants={itemVariants}>
            <Skeleton className="h-4 w-48" />
          </motion.div>
          <motion.div variants={containerVariants} className="flex space-x-4">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} variants={itemVariants}>
                <Skeleton className="h-8 w-8 rounded-full" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  )
}

export function FullScreenLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          Loading the new home buying experience...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export function ButtonLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('flex items-center space-x-2', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-4 w-4 rounded-full border-2 border-background/20 border-t-foreground"
      />
    </motion.div>
  )
}

export function TableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full space-y-3"
    >
      {/* Header */}
      <motion.div
        variants={containerVariants}
        className="flex items-center space-x-4 py-2"
      >
        {[1, 2, 3, 4].map((i) => (
          <motion.div key={i} variants={itemVariants}>
            <Skeleton className="h-6 w-32" />
          </motion.div>
        ))}
      </motion.div>
      {/* Rows */}
      {Array.from({ length: rowCount }).map((_, i) => (
        <motion.div
          key={i}
          variants={containerVariants}
          className="flex items-center space-x-4 py-3"
        >
          {[1, 2, 3, 4].map((j) => (
            <motion.div key={j} variants={itemVariants}>
              <Skeleton className="h-5 w-32" />
            </motion.div>
          ))}
        </motion.div>
      ))}
    </motion.div>
  )
}
