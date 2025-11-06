import * as jwt from 'jsonwebtoken'
import { env } from '../env'

export interface JwtPayload {
  sub: string // userId
  sid: string // sessionId
  type: 'access' | 'refresh'
}

export function signAccessToken(payload: Omit<JwtPayload, 'type'>) {
  return jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  })
}

export function signRefreshToken(payload: Omit<JwtPayload, 'type'>) {
  return jwt.sign({ ...payload, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload
}
