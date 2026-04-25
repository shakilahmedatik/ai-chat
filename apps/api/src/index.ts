// packages imports
import 'express-async-error'
import http from 'http'
import { Server } from 'socket.io'
import { app } from './app'
// Helper Functions
import { verifyAccessToken } from './lib/jwt'
import { getSession } from './lib/redis'
import { connectDB } from './lib/db'
import { env } from './env'
import { logger } from './lib/logger'
const port = env.PORT

// Entry Point
async function start() {
  await connectDB()

  const server = http.createServer(app)

  // Socket Server
  const io = new Server(server, {
    cors: {
      origin: [env.CLIENT_ORIGIN, 'http://localhost:3000'],
      credentials: true,
    },
  })

  // Socket.io auth
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.accessToken
      if (!token) return next(new Error('No token'))

      const payload = verifyAccessToken(token)
      if (payload.type !== 'access') return next(new Error('Invalid token'))

      const session = await getSession(`session:${payload.sid}`)

      if (!session) return next(new Error('Session expired'))
      ;(socket as any).user = { id: payload.sub }
      next()
    } catch (e) {
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', socket => {
    logger.info({ id: socket.id }, 'Socket connected')
    const user = (socket as any).user

    if (user?.id) {
      socket.join(`user:${user.id}`)
    }

    socket.on('join_thread', (threadId: string) => {
      socket.join(`thread:${threadId}`)
    })

    socket.on('leave_thread', (threadId: string) => {
      socket.leave(`thread:${threadId}`)
    })

    socket.on('disconnect', reason => {
      logger.info({ id: socket.id, reason }, 'Socket disconnected')
    })
  })

  // Expose io globally for route files if you want:
  ;(global as any).io = io

  server.listen(port, () => {
    logger.info({ port }, `API server listening on port ${port}`)
  })
}

start().catch(err => {
  logger.error({ err }, 'Failed to start server')
  process.exit(1)
})
