// components/proposals/vote-animation.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { FileCheck } from 'lucide-react'

interface VoteAnimationProps {
  isVisible: boolean
  voteType: 'for' | 'against'
}

export function VoteAnimation({ isVisible, voteType }: VoteAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, x: '-50%' }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [-20, -40, -60, -80],
            x: ['-50%', '-45%', '-55%', '-50%'],
          }}
          transition={{
            duration: 2,
            times: [0, 0.2, 0.8, 1],
            ease: 'easeOut',
          }}
          className="pointer-events-none fixed left-1/2 top-1/2 z-50"
        >
          <motion.div
            animate={{
              rotate: [-5, 5, -5, 5, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.25, 0.5, 0.75, 1],
              ease: 'easeInOut',
            }}
            className={`rounded-lg p-6 shadow-lg backdrop-blur-sm ${
              voteType === 'for'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            <FileCheck className="h-8 w-8" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
