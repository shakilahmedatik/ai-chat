'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, AtSign, Newspaper, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fromNow } from '@/lib/time'
import type { Notification } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: Notification
  onToggleRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({
  notification,
  onToggleRead,
  onDelete,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getIcon = () => {
    switch (notification.type) {
      case 'reply':
        return <MessageCircle className='h-5 w-5 text-blue-500' />
      case 'mention':
        return <AtSign className='h-5 w-5 text-orange-500' />
      case 'digest':
        return <Newspaper className='h-5 w-5 text-green-500' />
      default:
        return <MessageCircle className='h-5 w-5 text-muted-foreground' />
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-b transition-colors',
        !notification.read && 'bg-primary/5',
        isHovered && 'bg-muted/50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='shrink-0 mt-1'>{getIcon()}</div>

      <div className='flex-1 min-w-0'>
        <p
          className={cn(
            'text-sm',
            !notification.read ? 'font-semibold' : 'text-muted-foreground'
          )}
        >
          {notification.title}
        </p>
        <p className='text-sm text-muted-foreground truncate'>
          {notification.message}
        </p>
        <p className='text-xs text-muted-foreground mt-1'>
          {fromNow(notification.createdAt)}
        </p>
      </div>

      <div className='shrink-0 flex items-center gap-1'>
        {notification.link && (
          <Button
            size='sm'
            variant='outline'
            className='text-xs bg-transparent cursor-pointer'
            onClick={() => onToggleRead(notification.id)}
            asChild
          >
            <Link href={notification.link}>Open</Link>
          </Button>
        )}

        {isHovered && (
          <>
            <Button
              size='sm'
              variant='ghost'
              className='h-8 w-8 p-0 cursor-pointer'
              onClick={() => onToggleRead(notification.id)}
              title={notification.read ? 'Mark as unread' : 'Mark as read'}
            >
              <span className='sr-only'>
                {notification.read ? 'Mark as unread' : 'Mark as read'}
              </span>
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  notification.read ? 'bg-muted-foreground' : 'bg-primary'
                )}
              />
            </Button>
            <Button
              size='sm'
              variant='ghost'
              className='h-8 w-8 p-0 cursor-pointer'
              onClick={() => onDelete(notification.id)}
              title='Delete notification'
            >
              <span className='sr-only'>Delete notification</span>
              <X className='h-4 w-4' />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
