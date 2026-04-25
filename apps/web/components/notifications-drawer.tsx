'use client'

import { useState, useCallback, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { NotificationItem } from '@/components/notification-item'
import { useNotifications } from '@/hooks/use-notifications'

export function NotificationsDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    notifications,
    loading,
    error,
    markAsRead,
    handleMarkAllAsRead,
    remove,
    count,
  } = useNotifications()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative cursor-pointer'
          title='Notifications'
        >
          <Bell className='h-5 w-5' />
          {count > 0 && (
            <Badge className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs'>
              {count > 9 ? '9+' : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-96 p-0' align='end'>
        <div className='flex flex-col max-h-96'>
          {/* Header */}
          <div className='flex items-center justify-between px-4 py-3 border-b'>
            <h2 className='font-semibold'>Notifications</h2>
            {count > 0 && (
              <Button
                size='sm'
                variant='ghost'
                className='text-xs'
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className='flex-1 overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 px-4 text-center'>
                <Bell className='h-8 w-8 text-muted-foreground mb-2' />
                <p className='text-sm text-muted-foreground'>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onToggleRead={markAsRead}
                  onDelete={remove}
                />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
