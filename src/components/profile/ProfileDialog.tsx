import { useWallet } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormData {
  name: string
  email: string
}

export function ProfileDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { publicKey } = useWallet()
  const { handleCreateProfile } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>()

  const onSubmit = async (data: ProfileFormData) => {
    if (!publicKey) return

    try {
      await handleCreateProfile({ ...data })
      onClose()
    } catch (error) {
      console.error('Failed to create profile:', error)
      // You might want to show an error toast here
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Your Profile</DialogTitle>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500"
              >
                {errors.name.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500"
              >
                {errors.email.message}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end space-x-4"
          >
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="relative">
              <motion.div
                initial={false}
                animate={isSubmitting ? { opacity: 1 } : { opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </motion.div>
              <span className={isSubmitting ? 'opacity-0' : ''}>
                Create Profile
              </span>
            </Button>
          </motion.div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
