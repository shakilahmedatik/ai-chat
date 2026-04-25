'use client'

import { useEffect, useState } from 'react'
import type { Notification } from '@/lib/types'
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  markAllNotificationRead,
} from '@/lib/api'
import { useSocket } from '@/hooks/use-socket'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { on, off, isConnected } = useSocket()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getNotifications()
        const unread = res.items.filter((n: Notification) => !n.read).length
        setCount(unread)
        setNotifications(res.items)
      } catch {
        // ignore
      }
    })()
  }, [])

  // Live updates via socket
  useEffect(() => {
    if (!isConnected) return

    const handleNotification = (notification: Notification) => {
      setCount(c => c + 1)
      setNotifications(prev => [notification, ...prev])
    }

    on('notification', handleNotification)
    return () => {
      off('notification', handleNotification)
    }
  }, [isConnected, on, off])

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId)
      setCount(c => c - 1)
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const remove = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setCount(c => c - 1)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setCount(c => 0)
    } catch (error) {
      console.error('Failed to mark all notification as read:', error)
    }
  }

  return {
    notifications,
    loading,
    error,
    markAsRead,
    handleMarkAllAsRead,
    remove,
    count,
  }
}
