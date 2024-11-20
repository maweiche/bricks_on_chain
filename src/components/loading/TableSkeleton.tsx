
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <motion.div
            key={`header-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-8 bg-muted rounded flex-1"
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={`row-${rowIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: rowIndex * 0.1 }
          }}
          className="flex gap-4"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <motion.div
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn(
                "h-12 bg-muted/50 rounded flex-1",
                "animate-pulse"
              )}
            />
          ))}
        </motion.div>
      ))}
    </div>
  )
}