"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useStore } from '@/lib/store'
import { FullScreenLoader, ButtonLoader } from '@/components/loading'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  // Use separate selectors to prevent unnecessary re-renders
  const settings = useStore(state => state.settings)
  const updateSettings = useStore(state => state.updateSettings)
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
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
        }),
      })

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Memoize update handlers to prevent recreation on every render
  const handleUpdateNotifications = useCallback(async (key: keyof typeof settings.notifications, value: boolean) => {
    try {
      await updateSettings({
        notifications: {
          ...settings.notifications,
          [key]: value
        }
      })

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences.",
        variant: "destructive"
      })
    }
  }, [settings.notifications, updateSettings, toast])

  const handleUpdateDisplay = useCallback(async (key: keyof typeof settings.display, value: boolean) => {
    try {
      await updateSettings({
        display: {
          ...settings.display,
          [key]: value
        }
      })

      toast({
        title: "Display Settings Updated",
        description: "Your display preferences have been saved."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display settings.",
        variant: "destructive"
      })
    }
  }, [settings.display, updateSettings, toast])

  if (!isAuthenticated) {
    return <FullScreenLoader text="Please connect your wallet..." />
  }

  return (
    <div className="container mx-auto py-20 space-y-6">
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
            <CardContent className="space-y-4">
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
                    handleUpdateNotifications(key as keyof typeof settings.notifications, checked)
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
              .filter(([key]) => typeof settings.display[key as keyof typeof settings.display] === 'boolean')
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {getDisplayDescription(key)}
                    </p>
                  </div>
                  <Switch
                    checked={value as boolean}
                    onCheckedChange={(checked) => 
                      handleUpdateDisplay(key as keyof typeof settings.display, checked)
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
    marketingUpdates: 'Receive news about new properties and features'
  }
  return descriptions[key] || ''
}

function getDisplayDescription(key: string): string {
  const descriptions: Record<string, string> = {
    compactView: 'Show more information in less space',
    showProfitLoss: 'Display investment performance metrics'
  }
  return descriptions[key] || ''
}