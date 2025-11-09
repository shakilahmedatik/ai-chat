import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'
import { getSession } from '../lib/redis'

export interface AuthRequest extends Request {
  user?: { id: string; sessionId: string }
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies['accessToken']
    if (!token) return res.status(401).json({ message: 'Unauthorized' })

    const payload = verifyAccessToken(token)
    if (payload.type !== 'access') throw new Error('Invalid token type')

    const session = await getSession(`session:${payload.sid}`)
    if (!session) return res.status(401).json({ message: 'Session expired' })

    req.user = { id: payload.sub, sessionId: payload.sid }
    next()
  } catch (err) {
    console.log(err)
    return res.status(401).json({ message: 'Unauthorized!!' })
  }
}
