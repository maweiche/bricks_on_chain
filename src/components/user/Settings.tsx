'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'

import { useStore } from '@/lib/store'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ButtonLoader, FullScreenLoader } from '@/components/loading'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const settings = useStore((state) => state.settings)
  const updateSettings = useStore((state) => state.updateSettings)
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [pfpPreview, setPfpPreview] = useState(user?.pfp || '')

  const handleUpdateProfile = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData(event.currentTarget)
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          name: formData.get('name'),
          email: formData.get('email'),
          pfp: formData.get('pfp'),
        }),
      })

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePfpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPfpPreview(event.target.value)
  }

  // Memoize update handlers to prevent recreation on every render
  const handleUpdateNotifications = useCallback(
    async (key: keyof typeof settings.notifications, value: boolean) => {
      try {
        await updateSettings({
          notifications: {
            ...settings.notifications,
            [key]: value,
          },
        })

        toast({
          title: 'Preferences Updated',
          description: 'Your notification preferences have been saved.',
        })
      } catch (error) {
        console.error('Failed to update notifications:', error)
        toast({
          title: 'Error',
          description: 'Failed to update preferences.',
          variant: 'destructive',
        })
      }
    },
    [settings, updateSettings, toast]
  )

  const handleUpdateDisplay = useCallback(
    async (key: keyof typeof settings.display, value: boolean) => {
      try {
        await updateSettings({
          display: {
            ...settings.display,
            [key]: value,
          },
        })

        toast({
          title: 'Display Settings Updated',
          description: 'Your display preferences have been saved.',
        })
      } catch (error) {
        console.error('Failed to update display settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to update display settings.',
          variant: 'destructive',
        })
      }
    },
    [settings, updateSettings, toast]
  )

  if (!isAuthenticated) {
    return <FullScreenLoader />
  }

  return (
    <div className="container mx-auto space-y-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6"
      >
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-6">
              {/* Profile Picture Preview */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={pfpPreview} alt={user?.name || 'Profile'} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full space-y-2">
                  <Label htmlFor="pfp">Profile Picture URL</Label>
                  <Input
                    id="pfp"
                    name="pfp"
                    defaultValue={user?.pfp}
                    placeholder="https://example.com/your-image.jpg"
                    onChange={handlePfpChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user?.name}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email}
                  placeholder="your@email.com"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <ButtonLoader className="mr-2" /> : null}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you receive updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <p className="text-sm text-muted-foreground">
                    {getNotificationDescription(key)}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) =>
                    handleUpdateNotifications(
                      key as keyof typeof settings.notifications,
                      checked
                    )
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Customize how information is displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.display)
              .filter(
                ([key]) =>
                  typeof settings.display[
                    key as keyof typeof settings.display
                  ] === 'boolean'
              )
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      {key.charAt(0).toUpperCase() +
                        key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getDisplayDescription(key)}
                    </p>
                  </div>
                  <Switch
                    checked={value as boolean}
                    onCheckedChange={(checked) =>
                      handleUpdateDisplay(
                        key as keyof typeof settings.display,
                        checked
                      )
                    }
                  />
                </div>
              ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Helper functions for descriptions
function getNotificationDescription(key: string): string {
  const descriptions: Record<string, string> = {
    email: 'Receive updates via email',
    push: 'Get browser notifications',
    investmentUpdates: 'Get notified about your investment performance',
    marketingUpdates: 'Receive news about new properties and features',
  }
  return descriptions[key] || ''
}

function getDisplayDescription(key: string): string {
  const descriptions: Record<string, string> = {
    compactView: 'Show more information in less space',
    showProfitLoss: 'Display investment performance metrics',
  }
  return descriptions[key] || ''
}
