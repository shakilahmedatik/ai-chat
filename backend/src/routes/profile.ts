import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { User } from '../models/User'
import axios from 'axios'

const router = Router()

// GET /api/profile/me
router.get('/profile/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).select(
    'username email displayName bio avatarUrl roles createdAt'
  )
  if (!user) return res.status(404).json({ message: 'User not found' })

  res.json({
    id:
      (user as any)._id &&
      typeof (user as any)._id === 'object' &&
      typeof (user as any)._id.toString === 'function'
        ? (user as any)._id.toString()
        : String((user as any)._id),
    username: user.username,
    email: user.email,
    displayName: user.displayName || user.username,
    bio: user.bio || '',
    avatarUrl:
      user.avatarUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        user.username
      )}`,
    roles: user.roles || [],
    createdAt: user.createdAt.toISOString(),
  })
})

// PUT /api/profile/me
router.put('/profile/me', requireAuth, async (req: AuthRequest, res) => {
  const { displayName, bio } = req.body

  const user = await User.findById(req.user!.id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  if (typeof displayName === 'string') user.displayName = displayName.trim()
  if (typeof bio === 'string') user.bio = bio.trim()

  await user.save()

  res.json({
    ok: true,
    displayName: user.displayName,
    bio: user.bio,
  })
})

// POST /api/profile/avatar
// Body: { imageBase64: string } (base64 WITHOUT data: prefix)
router.post('/profile/avatar', requireAuth, async (req: AuthRequest, res) => {
  const { imageBase64 } = req.body
  console.log(imageBase64)
  if (!imageBase64) {
    return res.status(400).json({ message: 'imageBase64 is required' })
  }

  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
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
      return res
        .status(500)
        .json({ message: 'Failed to upload image to imgbb' })
    }

    const user = await User.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.avatarUrl = url
    await user.save()

    res.json({ ok: true, avatarUrl: url })
  } catch (err: any) {
    console.error('IMGBB upload error', err?.message || err)
    res.status(500).json({ message: 'Failed to upload avatar' })
  }
})

export default router
