'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { Webhook } from '@/lib/types'
import type { WebhookInput } from '@/lib/schemas'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PlusIcon, FilterXIcon } from 'lucide-react'
import { WebhookModal } from '@/components/webhook-modal'
import { WebhooksTable } from '@/components/webhooks-table'
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  toggleWebhook,
  deleteWebhook as apiDeleteWebhook,
} from '@/lib/api'
import { Protected } from '@/components/protected'

type EventFilter = 'all' | 'mention' | 'reply' | 'digest'

export default function WebhooksPage() {
  const { toast } = useToast()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventFilter, setEventFilter] = useState<EventFilter>('all')

  // Load from API
  useEffect(() => {
    ;(async () => {
      try {
        const res = await getWebhooks()
        setWebhooks(res.items)
      } catch (err: any) {
        toast({
          title: 'Error loading webhooks',
          description: err?.message || 'Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [toast])

  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesSearch = webhook.targetUrl
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesEvent =
      eventFilter === 'all' || webhook.events.includes(eventFilter as any)
    return matchesSearch && matchesEvent
  })

  const handleCreate = () => {
    setEditingWebhook(null)
    setModalOpen(true)
  }

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook)

    setModalOpen(true)
  }

  const handleSubmit = async (data: WebhookInput, webhookId?: string) => {
    try {
      if (webhookId) {
        const updated = await updateWebhook(webhookId, data as any)
        setWebhooks(prev => prev.map(w => (w.id === webhookId ? updated : w)))
        toast({ title: 'Webhook updated' })
      } else {
        const created = await createWebhook(data as any)
        setWebhooks(prev => [created, ...prev])
        toast({ title: 'Webhook created' })
      }
      setModalOpen(false)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to save webhook',
        variant: 'destructive',
      })
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await toggleWebhook(id, isActive)
      setWebhooks(prev => prev.map(w => (w.id === id ? { ...w, isActive } : w)))
      toast({
        title: 'Success',
        description: `Webhook ${isActive ? 'enabled' : 'disabled'}`,
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update webhook status',
        variant: 'destructive',
      })
    }
  }

  const handleRetry = async (_id: string) => {
    // Optional: implement a retry endpoint if desired
    toast({
      title: 'Not implemented',
      description: 'Retry logic can be added via a dedicated endpoint.',
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteWebhook(id)
      setWebhooks(prev => prev.filter(w => w.id !== id))
      toast({
        title: 'Success',
        description: 'Webhook deleted',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete webhook',
        variant: 'destructive',
      })
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setEventFilter('all')
  }

  return (
    <Protected isAdmin>
      <div className='space-y-6 py-6 px-4'>
        <div>
          <h1 className='text-3xl font-bold'>Webhooks</h1>
          <p className='text-muted-foreground mt-2'>
            Manage outbound webhooks for forum events
          </p>
        </div>

        <div className='flex gap-2 flex-col sm:flex-row sm:items-end'>
          <div className='flex-1'>
            <label className='text-sm font-medium block mb-1'>Search URL</label>
            <Input
              placeholder='Filter by target URL...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='flex-1'>
            <label className='text-sm font-medium block mb-1'>Event Type</label>
            <Select
              value={eventFilter}
              onValueChange={v => setEventFilter(v as EventFilter)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Events</SelectItem>
                <SelectItem value='mention'>Mention</SelectItem>
                <SelectItem value='reply'>Reply</SelectItem>
                <SelectItem value='digest'>Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || eventFilter !== 'all') && (
            <Button
              variant='outline'
              size='icon'
              onClick={resetFilters}
              title='Reset filters'
            >
              <FilterXIcon className='h-4 w-4' />
            </Button>
          )}

          <Button onClick={handleCreate}>
            <PlusIcon className='mr-2 h-4 w-4' />
            Add Webhook
          </Button>
        </div>

        <WebhooksTable
          webhooks={filteredWebhooks}
          onEdit={handleEdit}
          onToggle={handleToggle}
          onRetry={handleRetry}
          onDelete={handleDelete}
        />

        <WebhookModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          webhook={editingWebhook}
          onSubmit={handleSubmit}
        />
      </div>
    </Protected>
  )
}
