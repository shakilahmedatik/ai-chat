// packages imports
import 'express-async-error'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './env'
import { requestLogger } from './middleware/request-logger'
import { errorHandler } from './middleware/error-handler'
import { logger } from './lib/logger'

// Route Imports
import postsRoutes from './routes/posts'
import notificationsRoutes from './routes/notifications'
import adminWebhookRoutes from './routes/admin.webhooks'
import moderationRoutes from './routes/moderation'
import adminDashboardRoutes from './routes/admin.dashboard'
import profileRoutes from './routes/profile'
import authRoutes from './routes/auth'
import threadRoutes from './routes/threads'

export const app = express()

// Middleware
app.use(
  cors({
    origin: [env.CLIENT_ORIGIN, 'http://localhost:3000'],
    credentials: true,
  })
)
app.use(
  express.json({
    limit: '5mb', // or '10mb' if you want to match your UI hint
  })
)
app.use(
  express.urlencoded({
    extended: true,
    limit: '5mb',
  })
)
app.use(cookieParser())
app.use(requestLogger)

// Routes
app.use('/auth', authRoutes)
app.use('/api', threadRoutes)
app.use('/api', postsRoutes)
app.use('/api', notificationsRoutes)
app.use('/api', adminWebhookRoutes)
app.use('/api', moderationRoutes)
app.use('/api', profileRoutes)
app.use('/api', adminDashboardRoutes)

app.use(errorHandler)

logger.info('Express app initialized')
