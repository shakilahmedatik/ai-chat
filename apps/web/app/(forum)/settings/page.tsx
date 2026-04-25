'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from 'next-themes'
import { AlertCircle, Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAccountDeletion = () => {
    toast({
      title: 'Account deletion',
      description:
        'This feature requires additional confirmation. Contact support.',
      variant: 'destructive',
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>
            Settings
          </h1>
          <p className='mt-2 text-muted-foreground'>
            Manage your account preferences and notification settings
          </p>
        </div>

        {/* Theme Settings */}
        <div className='rounded-lg border border-border bg-card p-6'>
          <h2 className='mb-4 text-lg font-semibold'>Appearance</h2>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-foreground'>Theme</p>
                <p className='text-sm text-muted-foreground'>
                  Choose your preferred color scheme
                </p>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTheme('light')}
                  className='gap-2'
                >
                  <Sun className='h-4 w-4' />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTheme('dark')}
                  className='gap-2'
                >
                  <Moon className='h-4 w-4' />
                  Dark
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className='rounded-lg border-2 border-destructive bg-destructive/5 p-6'>
          <div className='flex gap-4'>
            <AlertCircle className='h-5 w-5 shrink-0 text-destructive' />
            <div className='flex-1 space-y-4'>
              <div>
                <h2 className='text-lg font-semibold text-foreground'>
                  Danger Zone
                </h2>
                <p className='text-sm text-muted-foreground'>
                  Irreversible and destructive actions
                </p>
              </div>
              <div>
                <p className='mb-3 text-sm text-muted-foreground'>
                  Deleting your account will permanently remove all your data
                  and cannot be undone.
                </p>
                <Button variant='destructive' onClick={handleAccountDeletion}>
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
