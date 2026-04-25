'use client'

import { fromNow } from '@/lib/time'
import type { WebhookDelivery } from '@/lib/types'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react'

interface WebhookDeliveryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deliveries: WebhookDelivery[]
  webhookUrl: string
}

export function WebhookDeliveryDrawer({
  open,
  onOpenChange,
  deliveries,
  webhookUrl,
}: WebhookDeliveryDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Delivery History</DrawerTitle>
          <DrawerDescription>{webhookUrl}</DrawerDescription>
        </DrawerHeader>

        <div className='space-y-2 overflow-y-auto max-h-[60vh] px-4 pb-4'>
          {deliveries.length === 0 ? (
            <p className='text-muted-foreground text-sm text-center py-8'>
              No deliveries yet
            </p>
          ) : (
            deliveries.map(delivery => (
              <div
                key={delivery.id}
                className='border rounded-lg p-3 space-y-2'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {delivery.statusCode >= 200 && delivery.statusCode < 300 ? (
                      <CheckCircle2Icon className='h-4 w-4 text-green-500' />
                    ) : (
                      <XCircleIcon className='h-4 w-4 text-red-500' />
                    )}
                    <Badge variant='outline'>{delivery.event}</Badge>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {fromNow(delivery.createdAt)}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div>
                    <p className='text-muted-foreground'>Status Code</p>
                    <p className='font-mono font-semibold'>
                      {delivery.statusCode}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Response Time</p>
                    <p className='font-mono font-semibold'>
                      {delivery.responseTime}ms
                    </p>
                  </div>
                </div>

                {delivery.error && (
                  <div className='bg-destructive/10 rounded p-2'>
                    <p className='text-xs text-destructive font-mono'>
                      {delivery.error}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
