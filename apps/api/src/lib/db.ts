import mongoose from 'mongoose'
import { env } from '../env'
import { logger } from './logger'

let isConnected = false

export async function connectDB() {
  if (isConnected) return
  await mongoose.connect(env.MONGODB_URI, { dbName: 'aiChatForumTest' })
  isConnected = true
  logger.info('Connected to mongodb')
}
