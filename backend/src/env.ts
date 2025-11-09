import 'dotenv/config'
import type { SignOptions } from 'jsonwebtoken'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

type JwtExpiresIn = NonNullable<SignOptions['expiresIn']>

const JWT_EXPIRES_IN_PATTERN =
  /^-?\d+(?:\.\d+)?(?:\s?(?:years?|yrs?|yr|y|weeks?|w|days?|d|hours?|hrs?|hr|h|minutes?|mins?|min|m|seconds?|secs?|sec|s|milliseconds?|msecs?|msec|ms))?$/i

function readJwtExpiresIn(name: string, fallback: JwtExpiresIn): JwtExpiresIn {
  const raw = process.env[name]
  if (!raw) return fallback

  const normalized = raw.trim()
  if (!JWT_EXPIRES_IN_PATTERN.test(normalized)) {
    throw new Error(`Invalid JWT expires value for ${name}: ${normalized}`)
  }

  return normalized as JwtExpiresIn
}

export const env = {
  PORT: Number(process.env.PORT || 4000),
  CLIENT_ORIGIN: requireEnv('CLIENT_ORIGIN'), // your Next.js URL

  MONGODB_URI: requireEnv('MONGODB_URI'),

  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: readJwtExpiresIn('JWT_ACCESS_EXPIRES_IN', '1d'),
  JWT_REFRESH_EXPIRES_IN: readJwtExpiresIn('JWT_REFRESH_EXPIRES_IN', '7d'),

  UPSTASH_REDIS_URL: requireEnv('UPSTASH_REDIS_URL'),
  UPSTASH_REDIS_TOKEN: requireEnv('UPSTASH_REDIS_TOKEN'),

  HF_MODERATION_MODEL: process.env.HF_MODERATION_MODEL || '',
  HF_SUMMARIZATION_MODEL: process.env.HF_SUMMARIZATION_MODEL || '',
  HF_TOKEN: process.env.HF_TOKEN || '',
}
