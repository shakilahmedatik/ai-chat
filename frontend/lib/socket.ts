'use client'

import { io, Socket } from 'socket.io-client'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

let socket: Socket | null = null

export function initSocket(accessToken: string) {
  if (!socket) {
    socket = io(API_BASE, {
      withCredentials: true,
      auth: { accessToken },
    })
  }
  return socket
}

export function getSocket() {
  if (!socket) {
    throw new Error(
      'Socket not initialized. Call initSocket(accessToken) after login.'
    )
  }
  return socket
}
