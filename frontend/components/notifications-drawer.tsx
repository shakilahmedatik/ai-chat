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
// import type { Notification } from '@/lib/types'
// import { getNotifications } from '@/lib/api' // your existing REST helper
// import { useSocket } from '@/hooks/use-socket'
// Mock notifications for demo
// const MOCK_NOTIFICATIONS: Notification[] = [
//   {
//     id: '1',
//     userId: 'user-1',
//     type: 'mention',
//     title: 'You were mentioned by Sarah',
//     message: 'in "Best practices for Next.js"',
//     link: '/thread/thread-1',
//     read: false,
//     createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
//   },
//   {
//     id: '2',
//     userId: 'user-1',
//     type: 'reply',
//     title: 'New reply from John',
//     message: 'replied to your post in "React Performance"',
//     link: '/thread/thread-2',
//     read: false,
//     createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
//   },
//   {
//     id: '3',
//     userId: 'user-1',
//     type: 'digest',
//     title: 'Weekly digest',
//     message: 'You have 12 new posts from your favorite tags',
//     link: '/tags',
//     read: true,
//     createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
//   },
//   {
//     id: '4',
//     userId: 'user-1',
//     type: 'reply',
//     title: 'New reply from Emma',
//     message: 'replied to your post in "TypeScript Tips"',
//     link: '/thread/thread-3',
//     read: true,
//     createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
//   },
// ]

export function NotificationsDrawer() {
  // const { isConnected, on, off } = useSocket()
  // const [count, setCount] = useState(0)
  // const [notifications, setNotifications] = useState<Notification[]>([])
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

  // Optionally preload unread count from API on mount
  // useEffect(() => {
  //   ;(async () => {
  //     try {
  //       const res = await getNotifications()
  //       const unread = res.items.filter((n: any) => !n.isRead).length
  //       setCount(unread)
  //       setNotifications(res.items)
  //     } catch {
  //       // ignore
  //     }
  //   })()
  // }, [])

  // Live updates via socket
  // useEffect(() => {
  //   if (!isConnected) return

  //   const handleNotification = (notification: Notification) => {
  //     setCount(c => c + 1)
  //     setNotifications(prev => [notification, ...prev])
  //   }

  //   on('notification', handleNotification)
  //   return () => {
  //     off('notification', handleNotification)
  //   }
  // }, [isConnected, on, off])

  // const unreadCount = notifications.filter(n => !n.read).length

  // const handleToggleRead = useCallback((id: string) => {
  //   setNotifications(prev =>
  //     prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
  //   )
  // }, [])

  // const handleDelete = useCallback((id: string) => {
  //   setNotifications(prev => prev.filter(n => n.id !== id))
  // }, [])

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
