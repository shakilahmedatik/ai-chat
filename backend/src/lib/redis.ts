import { Redis } from '@upstash/redis'
import { env } from '../env'

export const redis = new Redis({
  url: env.UPSTASH_REDIS_URL,
  token: env.UPSTASH_REDIS_TOKEN,
})

// Simple helpers
export async function setSession(
  key: string,
  value: unknown,
  ttlSeconds: number
) {
  await redis.set(key, JSON.stringify(value), { ex: ttlSeconds })
}

export async function getSession<T = any>(key: string): Promise<T | null> {
  const v = await redis.get<string>(key)
  return v ? (JSON.parse(v) as T) : null
}

export async function delSession(key: string) {
  await redis.del(key)
}
