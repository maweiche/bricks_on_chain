'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Settings, Shield, DollarSign, BarChart, Bell } from 'lucide-react'

const platformSettingsSchema = z.object({
  // General Settings
  platformName: z.string().min(2).max(50),
  supportEmail: z.string().email(),
  maintenanceMode: z.boolean(),

  // Investment Settings
  minimumInvestment: z.number().min(0),
  maximumInvestment: z.number().min(0),
  platformFee: z.number().min(0).max(100),

  // Governance Settings
  proposalDuration: z.number().min(1).max(30),
  minimumQuorum: z.number().min(1).max(100),
  votingDelay: z.number().min(0),

  // Security Settings
  twoFactorRequired: z.boolean(),
  passwordExpiration: z.number().min(0),
  sessionTimeout: z.number().min(5).max(1440),

  // Notification Settings
  emailNotifications: z.boolean(),
  investmentAlerts: z.boolean(),
  proposalAlerts: z.boolean(),
  maintenanceAlerts: z.boolean(),
})

type PlatformSettings = z.infer<typeof platformSettingsSchema>

interface SettingsSectionProps {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
}

function SettingsSection({
  title,
  description,
  icon,
  children,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default function AdminSettings() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PlatformSettings>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      platformName: 'RWA Platform',
      supportEmail: 'support@example.com',
      maintenanceMode: false,
      minimumInvestment: 100,
      maximumInvestment: 10000,
      platformFee: 2.5,
      proposalDuration: 7,
      minimumQuorum: 51,
      votingDelay: 24,
      twoFactorRequired: true,
      passwordExpiration: 90,
      sessionTimeout: 60,
      emailNotifications: true,
      investmentAlerts: true,
      proposalAlerts: true,
      maintenanceAlerts: true,
    },
  })

  async function onSubmit(data: PlatformSettings) {
    setIsSubmitting(true)
    try {
      // API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call
      toast({
        title: 'Settings Updated',
        description: 'Platform settings have been saved successfully.',
      })
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      form.reset(data)
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure platform-wide settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <SettingsSection
                title="General Settings"
                description="Basic platform configuration"
                icon={<Settings className="h-5 w-5" />}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="platformName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="maintenanceMode"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Maintenance Mode
                        </FormLabel>
                        <FormDescription>
                          Temporarily disable the platform for maintenance
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingsSection>

              <SettingsSection
                title="Investment Settings"
                description="Configure investment limits and fees"
                icon={<DollarSign className="h-5 w-5" />}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="minimumInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Investment ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maximumInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Investment ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="platformFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Fee (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SettingsSection>

              <SettingsSection
                title="Governance Settings"
                description="Configure proposal and voting parameters"
                icon={<BarChart className="h-5 w-5" />}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="proposalDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposal Duration (days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minimumQuorum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Quorum (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="votingDelay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voting Delay (hours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SettingsSection>

              <SettingsSection
                title="Security Settings"
                description="Configure platform security options"
                icon={<Shield className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="twoFactorRequired"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Require Two-Factor Authentication
                          </FormLabel>
                          <FormDescription>
                            Enforce 2FA for all users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="passwordExpiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Expiration (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(+e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(+e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection
                title="Notification Settings"
                description="Configure platform notifications"
                icon={<Bell className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Email Notifications
                          </FormLabel>
                          <FormDescription>
                            Enable platform-wide email notifications
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="investmentAlerts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Investment Alerts
                          </FormLabel>
                          <FormDescription>
                            Notify users about investment updates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="proposalAlerts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Proposal Alerts
                          </FormLabel>
                          <FormDescription>
                            Notify users about new proposals and voting
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maintenanceAlerts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Maintenance Alerts
                          </FormLabel>
                          <FormDescription>
                            Notify users about platform maintenance
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SettingsSection>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isDirty}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </motion.div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Settings Changed Alert */}
      <AnimatePresence>
        {form.formState.isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="text-sm">You have unsaved changes</div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    form.handleSubmit(onSubmit)()
                  }}
                  disabled={isSubmitting}
                >
                  Save Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Form>
  )
}
