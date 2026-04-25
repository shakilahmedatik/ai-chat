import bcrypt from 'bcryptjs'
import axios from 'axios'
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { User } from '../models/User'
import { setSession, delSession, getSession } from '../lib/redis'
import { AuthRequest, requireAuth } from '../middleware/auth'
import { logger } from '../lib/logger'
import { env } from '../env'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt'

const router = Router()
// const ACCESS_TTL_SECONDS = 15 * 60
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60

function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
  const common = {
    httpOnly: true,
    secure: true, // Railway is HTTPS, so this is correct
    sameSite: 'none' as const, // allow cross-site cookies
    path: '/',
  }
  // If later you use a custom domain for both API + web, you can optionally add:
  // domain: '.your-domain.com'

  res.cookie('accessToken', accessToken, common)
  res.cookie('refreshToken', refreshToken, common)
}

router.post('/avatar', async (req, res, next) => {
  const { imageBase64 } = req.body

  if (!imageBase64) {
    logger.error({ message: 'imageBase64 is required' })
    return res.status(400).json({ message: 'imageBase64 is required' })
  }

  const apiKey = env.IMGBB_API_KEY
  if (!apiKey) {
    logger.error({ message: 'IMGBB_API_KEY not configured' })
    return res.status(500).json({ message: 'IMGBB_API_KEY not configured' })
  }

  try {
    const form = new URLSearchParams()
    form.append('image', imageBase64)

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      form.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    )

    const url = response.data?.data?.url
    if (!url) {
      logger.error({ message: 'Failed to upload image to imgbb' })
      return res
        .status(500)
        .json({ message: 'Failed to upload image to imgbb' })
    }
    logger.info({ avatarUrl: url }, 'Avatar uploaded')
    return res.json({ avatarUrl: url })
  } catch (err: any) {
    next(err)
    return res.status(500).json({ message: 'Failed to upload avatar' })
  }
})

router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password, avatarUrl, batch, fullName } = req.body
    if (!email || !username || !password || !batch) {
      logger.error({ message: 'Missing fields' })
      return res.status(400).json({ message: 'Missing required fields: email, username, password, batch' })
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) {
      logger.error({ message: 'User already exists' })
      return res.status(409).json({ message: 'User already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      email,
      username,
      passwordHash,
      avatarUrl,
      batch,
      fullName: fullName || username,
      role: 'user',
    })

    const sid = uuid()
    const accessToken = signAccessToken({ sub: user.id, sid })
    const refreshToken = signRefreshToken({ sub: user.id, sid })

    await setSession(`session:${sid}`, { userId: user.id }, REFRESH_TTL_SECONDS)

    setAuthCookies(res, accessToken, refreshToken)

    logger.info({ userId: user?.id, email, batch }, 'User created')
    res.status(201).json({
      user: { id: user.id, email, username, batch, fullName: user.fullName, role: user.role },
      accessToken,
    })
  } catch (err) {
    next(err)
    return res.status(500).json({ message: 'Failed to create user' })
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    })

    if (!user) {
      logger.error({ message: 'Invalid credentials' })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      logger.error({ message: 'Invalid credentials' })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const sid = uuid()
    const accessToken = signAccessToken({ sub: user.id, sid })
    const refreshToken = signRefreshToken({ sub: user.id, sid })

    await setSession(`session:${sid}`, { userId: user.id }, REFRESH_TTL_SECONDS)

     setAuthCookies(res, accessToken, refreshToken)
     logger.info({ userId: user.id, emailOrUsername }, 'Login Successful')
     res.json({
       user: {
         id: user.id,
         email: user.email,
         username: user.username,
         role: user.role,
         batch: user.batch,
         fullName: user.fullName,
         avatarUrl: user.avatarUrl,
         profileImage: user.profileImage,
       },
       accessToken,
     })
  } catch (err) {
    next()
    return res.status(500).json({ message: 'Login failed' })
  }
})

router.post('/refresh', async (req, res, next) => {
  const token = req.cookies['refreshToken']
  if (!token) {
    logger.error({ message: 'No refresh token' })
    return res.status(404).json({ message: 'No refresh token' })
  }

  try {
    const payload = verifyRefreshToken(token)
    if (payload.type !== 'refresh') throw new Error('Invalid')

    const session = await getSession<{ userId: string }>(
      `session:${payload.sid}`
    )
    if (!session) {
      logger.error({ message: 'Session expired' })
      return res.status(401).json({ message: 'Session expired' })
    }

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
    logger.info({ ok: true }, 'Token refreshed')
    res.json({ ok: true })
  } catch (err) {
    next(err)
    return res.status(401).json({ message: 'Invalid refresh token' })
  }
})

router.post('/logout', async (req: AuthRequest, res, next) => {
  try {
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
    logger.info({ ok: true }, 'Logout successful')
    res.json({ ok: true })
  } catch (err) {
    next(err)
    return res.status(500).json({ message: 'Logout failed' })
  }
})

router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    // This endpoint should be behind requireAuth in index.ts router mounting
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const user = await User.findById(req.user.id).select(
      'id email username avatarUrl bio role batch fullName profileImage'
    )
    res.json({ user })
  } catch (err) {
    next(err)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

// Get available batches
router.get('/batches', async (req, res) => {
  try {
    const PREDEFINED_BATCHES = [
      'Batch 1',
      'Batch 2',
      'Batch 3',
      'Batch 4',
      'Batch 5',
      'Batch 6',
      'Batch 7',
      'Batch 8',
      'Batch 9',
      'Batch 10',
    ]
    res.json({ batches: PREDEFINED_BATCHES })
  } catch (err) {
    logger.error({ err }, 'Error fetching batches')
    return res.status(500).json({ message: 'Failed to fetch batches' })
  }
})

export default router
