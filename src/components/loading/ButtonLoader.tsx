
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonLoaderProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  white?: boolean
}

export function ButtonLoader({ className, size = 'md', white = false }: ButtonLoaderProps) {
  const sizeClasses = {
    sm: 'w-3 h-3 border-2',
    md: 'w-4 h-4 border-2',
    lg: 'w-5 h-5 border-[3px]'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-block rounded-full',
        'border-t-transparent',
        white ? 'border-white' : 'border-primary',
        sizeClasses[size],
        'animate-spin',
        className
      )}
    />
  )
}
