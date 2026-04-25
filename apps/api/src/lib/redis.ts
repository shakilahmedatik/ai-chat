// backend/src/lib/redis.ts
import { createClient } from 'redis'
import { env } from '../env'
import { logger } from './logger'

const url = env.REDIS_URL || 'redis://localhost:6379'

const redis = createClient({ url })

redis.on('error', err => {
  logger.error(err, 'Redis client error')
})

let isConnecting = false

async function ensureConnected() {
  if (redis.isOpen || isConnecting) return
  isConnecting = true
  try {
    await redis.connect()
    logger.info('Connected to redis')
  } catch (err) {
    logger.error(err, 'Redis Connection error')
    throw err
  } finally {
    isConnecting = false
  }
}

// ---- Session helpers ----

export async function setSession(
  key: string,
  value: unknown,
  ttlSeconds: number
) {
  await ensureConnected()
  await redis.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  })
}

export async function getSession<T = any>(key: string): Promise<T | null> {
  await ensureConnected()
  const v = await redis.get(key)
  return v ? (JSON.parse(v) as T) : null
}

export async function delSession(key: string) {
  await ensureConnected()
  await redis.del(key)
}

// ---- Job queue helpers ----

export async function pushJob(queue: string, payload: any) {
  await ensureConnected()
  await redis.lPush(queue, JSON.stringify(payload))
}

export async function popJob(queue: string): Promise<any | null> {
  await ensureConnected()
  const raw = await redis.rPop(queue)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (err) {
    logger.error(err)
    return null
  }
}

// export raw client if you need low-level access
export { redis }
