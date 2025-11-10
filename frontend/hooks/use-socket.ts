'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/hooks/use-auth'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

let globalSocket: Socket | null = null

function ensureSocket(accessToken: string): Socket {
  if (typeof window === 'undefined') {
    throw new Error('useSocket must be used in a client component')
  }

  if (!globalSocket) {
    globalSocket = io(API_BASE, {
      withCredentials: true,
      auth: { accessToken },
      autoConnect: true,
    })
  } else {
    globalSocket.auth = { accessToken }
    if (!globalSocket.connected) {
      globalSocket.connect()
    }
  }

  return globalSocket
}

function teardownSocket() {
  if (globalSocket) {
    globalSocket.removeAllListeners()
    globalSocket.disconnect()
    globalSocket = null
  }
}

export function useSocket() {
  const { accessToken } = useAuth()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!accessToken) {
      setIsConnected(false)
      teardownSocket()
      return
    }

    const socket = ensureSocket(accessToken)

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    if (socket.connected) {
      setIsConnected(true)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [accessToken])

  const getSocket = useCallback(() => globalSocket, [])

  const on = useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      const socket = getSocket()
      socket?.on(event, handler)
    },
    [getSocket]
  )

  const off = useCallback(
    (event: string, handler?: (...args: any[]) => void) => {
      const socket = getSocket()
      if (!socket) return
      if (handler) socket.off(event, handler)
      else socket.off(event)
    },
    [getSocket]
  )

  const emit = useCallback(
    (event: string, ...args: any[]) => {
      const socket = getSocket()
      socket?.emit(event, ...args)
    },
    [getSocket]
  )

  const joinThread = useCallback(
    (threadId: string) => {
      const socket = getSocket()
      socket?.emit('join_thread', threadId)
    },
    [getSocket]
  )

  const leaveThread = useCallback(
    (threadId: string) => {
      const socket = getSocket()
      socket?.emit('leave_thread', threadId)
    },
    [getSocket]
  )
  console.log(isConnected)
  return {
    isConnected,
    on,
    off,
    emit,
    joinThread,
    leaveThread,
  }
}
