import { Router } from 'express'
import * as bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { User } from '../models/User'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt'
import { setSession, delSession, getSession } from '../lib/redis'
import { AuthRequest, requireAuth } from '../middleware/auth'

const router = Router()
// const ACCESS_TTL_SECONDS = 15 * 60
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60

function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
  const isLocal = process.env.NODE_ENV !== 'production'
  const common = {
    httpOnly: true,
    secure: !isLocal,
    sameSite: isLocal ? 'lax' : 'none',
    path: '/',
  }
  res.cookie('accessToken', accessToken, { ...common })
  res.cookie('refreshToken', refreshToken, { ...common })
}

router.post('/register', async (req, res) => {
  const { email, username, password, avatarUrl } = req.body
  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] })
  if (existing) {
    return res.status(409).json({ message: 'User already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    email,
    username,
    passwordHash,
    avatarUrl,
  })

  const sid = uuid()
  const accessToken = signAccessToken({ sub: user.id, sid })
  const refreshToken = signRefreshToken({ sub: user.id, sid })

  await setSession(`session:${sid}`, { userId: user.id }, REFRESH_TTL_SECONDS)

  setAuthCookies(res, accessToken, refreshToken)

  res.status(201).json({
    user: { id: user.id, email, username },
    accessToken,
  })
})

router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body

  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  })

  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

  const sid = uuid()
  const accessToken = signAccessToken({ sub: user.id, sid })
  const refreshToken = signRefreshToken({ sub: user.id, sid })

  await setSession(`session:${sid}`, { userId: user.id }, REFRESH_TTL_SECONDS)

  setAuthCookies(res, accessToken, refreshToken)
  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
  })
})

router.post('/refresh', async (req, res) => {
  const token = req.cookies['refreshToken']
  if (!token) return res.status(401).json({ message: 'No refresh token' })

  try {
    const payload = verifyRefreshToken(token)
    if (payload.type !== 'refresh') throw new Error('Invalid')

    const session = await getSession<{ userId: string }>(
      `session:${payload.sid}`
    )
    if (!session) return res.status(401).json({ message: 'Session expired' })

    const newSid = uuid()
    const accessToken = signAccessToken({ sub: session.userId, sid: newSid })
    const refreshToken = signRefreshToken({ sub: session.userId, sid: newSid })

    await setSession(
      `session:${newSid}`,
      { userId: session.userId },
      REFRESH_TTL_SECONDS
    )
    await delSession(`session:${payload.sid}`)

    setAuthCookies(res, accessToken, refreshToken)

    res.json({ ok: true })
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' })
  }
})

router.post('/logout', async (req: AuthRequest, res) => {
  const refreshToken = req.cookies['refreshToken']
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken)
      await delSession(`session:${payload.sid}`)
    } catch {
      // ignore
    }
  }
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.json({ ok: true })
})

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  // This endpoint should be behind requireAuth in index.ts router mounting
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
  const user = await User.findById(req.user.id).select(
    'id email username avatarUrl bio roles'
  )

  res.json({ user })
})

export default router
