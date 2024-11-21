import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { motion } from 'framer-motion'

export function ModelLoader() {
  const { progress } = useProgress()
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => setShow(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [progress])

  if (!show) return null

  return (
    <div className="h-full w-full z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-4xl font-bold">Loading Experience</div>
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </div>
        </motion.div>
      </div>
    </div>
  )
}