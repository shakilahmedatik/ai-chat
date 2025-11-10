"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { settingsSchema, type SettingsInput } from "@/lib/schemas"
import { AlertCircle, Moon, Sun } from "lucide-react"
import { useEffect } from "react"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      inAppNotifications: true,
      language: "en",
    },
  })

  async function onSubmit(data: SettingsInput) {
    setIsLoading(true)
    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountDeletion = () => {
    toast({
      title: "Account deletion",
      description: "This feature requires additional confirmation. Contact support.",
      variant: "destructive",
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your account preferences and notification settings</p>
        </div>

        {/* Theme Settings */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex-1">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>Receive email notifications for mentions and replies</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inAppNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex-1">
                      <FormLabel className="text-base">In-App Notifications</FormLabel>
                      <FormDescription>Show notifications in your browser</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger disabled={isLoading}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bn">Bangla (বাংলা)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose your preferred language for the interface</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-6">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
                <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
              </div>
              <div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Deleting your account will permanently remove all your data and cannot be undone.
                </p>
                <Button variant="destructive" onClick={handleAccountDeletion}>
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
