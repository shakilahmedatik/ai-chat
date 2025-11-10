'use client'

import { useState } from 'react'
import { fromNow } from '@/lib/time'
import type { Webhook } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreVerticalIcon,
  CheckCircle2Icon,
  XCircleIcon,
  RotateCwIcon,
} from 'lucide-react'
import { WebhookDeliveryDrawer } from './webhook-delivery-drawer'

interface WebhooksTableProps {
  webhooks: Webhook[]
  onEdit: (webhook: Webhook) => void
  onToggle: (id: string, isActive: boolean) => Promise<void>
  onRetry: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

// Mock delivery history data
const mockDeliveries = {
  'webhook-1': [
    {
      id: '1',
      webhookId: 'webhook-1',
      event: 'mention',
      statusCode: 200,
      responseTime: 245,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      webhookId: 'webhook-1',
      event: 'reply',
      statusCode: 200,
      responseTime: 312,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
}

export function WebhooksTable({
  webhooks,
  onEdit,
  onToggle,
  onRetry,
  onDelete,
}: WebhooksTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? webhooks.map(w => w.id) : [])
  }

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds(
      checked ? [...selectedIds, id] : selectedIds.filter(sid => sid !== id)
    )
  }

  const handleViewDeliveries = (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setDeliveryOpen(true)
  }

  return (
    <>
      <div className='border rounded-lg overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={
                    webhooks.length > 0 &&
                    selectedIds.length === webhooks.length
                  }
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Target URL</TableHead>
              <TableHead>Event Types</TableHead>
              <TableHead>Secret</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Delivery</TableHead>
              <TableHead className='w-12'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8'>
                  <p className='text-muted-foreground'>
                    No webhooks configured
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              webhooks.map(webhook => (
                <TableRow key={webhook.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(webhook.id)}
                      onCheckedChange={checked =>
                        toggleRow(webhook.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className='max-w-xs truncate font-mono text-sm'>
                    {webhook.targetUrl}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {webhook.events.map(event => (
                        <Badge
                          key={event}
                          variant='secondary'
                          className='text-xs'
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className='bg-muted px-2 py-1 rounded text-xs'>
                      {webhook.secret.slice(0, 4)}...
                      {webhook.secret.slice(-4)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {webhook.lastDeliveryStatus ? (
                        webhook.lastDeliveryStatus === 'success' ? (
                          <CheckCircle2Icon className='h-4 w-4 text-green-500' />
                        ) : (
                          <XCircleIcon className='h-4 w-4 text-red-500' />
                        )
                      ) : null}
                      <span className='text-sm'>
                        {webhook.lastDeliveryAt
                          ? fromNow(webhook.lastDeliveryAt)
                          : 'Never'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                        >
                          <MoreVerticalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => onEdit(webhook)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewDeliveries(webhook)}
                        >
                          View Deliveries
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRetry(webhook.id)}>
                          <RotateCwIcon className='mr-2 h-4 w-4' />
                          Retry Last
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            onToggle(webhook.id, !webhook.isActive)
                          }
                        >
                          {webhook.isActive ? 'Disable' : 'Enable'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(webhook.id)}
                          className='text-destructive'
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The webhook will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            onClick={() => {
              if (deleteId) {
                onDelete(deleteId)
                setDeleteId(null)
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {selectedWebhook && (
        <WebhookDeliveryDrawer
          open={deliveryOpen}
          onOpenChange={setDeliveryOpen}
          deliveries={
            mockDeliveries[selectedWebhook.id as keyof typeof mockDeliveries] ||
            []
          }
          webhookUrl={selectedWebhook.targetUrl}
        />
      )}
    </>
  )
}
