import 'express-async-error'
import express from 'express'
import * as http from 'http'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { Server } from 'socket.io'
import { env } from './env'
import { connectDB } from './lib/db'
import authRoutes from './routes/auth'
import threadRoutes from './routes/threads'
import postsRoutes from './routes/posts'
import notificationsRoutes from './routes/notifications'
import { verifyAccessToken } from './lib/jwt'
import { checkRedisConnection, getSession } from './lib/redis'
import adminWebhookRoutes from './routes/admin.webhooks'
import moderationRoutes from './routes/moderation'
import adminDashboardRoutes from './routes/admin.dashboard'

async function bootstrap() {
  await connectDB()
  const redisOk = await checkRedisConnection()
  if (!redisOk) {
    // you can either:
    // - throw to fail fast
    // - or just log a warning and continue
    console.error('Redis is not reachable. Check Upstash URL/TOKEN.')
  }

  const app = express()
  const server = http.createServer(app)

  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  })

  // Middleware
  app.use(
    cors({
      origin: [env.CLIENT_ORIGIN, 'http://localhost:3000'],
      credentials: true,
    })
  )
  app.use(express.json())
  app.use(cookieParser())

  // Routes
  app.use('/auth', authRoutes)
  app.use('/api', threadRoutes)
  app.use('/api', postsRoutes)
  app.use('/api', notificationsRoutes)
  app.use('/api', adminWebhookRoutes)
  app.use('/api', moderationRoutes)

  app.use('/api', adminDashboardRoutes)

  // Basic error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
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

    socket.on('disconnect', () => {
      // nothing needed
    })
  })

  // Expose io globally for route files if you want:
  ;(global as any).io = io

  server.listen(env.PORT, () => {
    console.log(`Server running on :${env.PORT}`)
  })
}

bootstrap()
