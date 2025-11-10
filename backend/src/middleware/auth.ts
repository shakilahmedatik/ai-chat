import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'
import { getSession } from '../lib/redis'
import { User } from '../models/User'

export interface AuthRequest extends Request {
  user?: { id: string; sessionId: string; roles?: string }
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

// TODO: replace with real admin check when you have roles
export async function requireAdmin(req: AuthRequest, res: any, next: any) {
  const user = await User.findOne({ _id: req?.user?.id })
  if (!user) return res.status(401).json({ message: 'Unauthorized Access' })
  if (user?.roles === 'admin') return next()
  return res.status(403).json({ message: 'Forbidden' })
}
