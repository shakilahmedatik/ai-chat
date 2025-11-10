'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { webhookSchema, type WebhookInput } from '@/lib/schemas'
import type { Webhook } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2Icon } from 'lucide-react'

interface WebhookModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook?: Webhook | null
  onSubmit: (data: WebhookInput, webhookId?: string) => Promise<void>
}

export function WebhookModal({
  open,
  onOpenChange,
  webhook,
  onSubmit,
}: WebhookModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(webhookSchema),
    defaultValues: webhook
      ? {
          targetUrl: webhook.targetUrl,
          events: webhook.events,
          secret: webhook.secret,
        }
      : {
          targetUrl: '',
          events: [],
          secret: '',
        },
  })

  const handleSubmit = async (data: WebhookInput) => {
    try {
      setIsLoading(true)
      await onSubmit(data, webhook?.id)
      toast({
        title: 'Success',
        description: webhook
          ? 'Webhook updated successfully'
          : 'Webhook created successfully',
      })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save webhook',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {webhook ? 'Edit Webhook' : 'Create Webhook'}
          </DialogTitle>
          <DialogDescription>
            {webhook
              ? 'Update webhook configuration'
              : 'Add a new outbound webhook endpoint'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='targetUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://example.com/webhooks'
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    HTTPS endpoint where events will be sent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='events'
              render={() => (
                <FormItem>
                  <FormLabel>Event Types</FormLabel>
                  <div className='space-y-2'>
                    {(['mention', 'reply', 'digest'] as const).map(event => (
                      <FormField
                        key={event}
                        control={form.control}
                        name='events'
                        render={({ field }) => (
                          <FormItem className='flex items-center gap-2 space-y-0'>
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(event)}
                                onCheckedChange={checked => {
                                  const updated = field.value || []
                                  if (checked) {
                                    field.onChange([...updated, event])
                                  } else {
                                    field.onChange(
                                      updated.filter(v => v !== event)
                                    )
                                  }
                                }}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormLabel className='font-normal capitalize cursor-pointer'>
                              {event}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='secret'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret (Auto-generated)</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Auto-generated secret for HMAC signing'
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Used to sign webhook payloads for verification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading && (
                  <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
                )}
                {webhook ? 'Update' : 'Create'} Webhook
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
