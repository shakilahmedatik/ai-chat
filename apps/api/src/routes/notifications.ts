import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Notification } from '../models/Notification'
import { toNotificationDto } from '../services/notifications'

const router = Router()

// GET /api/notifications
router.get('/notifications', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id
  console.log(userId)
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
  const offset = parseInt(req.query.offset as string) || 0
  const unreadOnly = req.query.unread === 'true'

  const filter: any = { userId }
  if (unreadOnly) filter.read = false

  const [docs, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit),
    Notification.countDocuments(filter),
  ])

  const items = docs.map(toNotificationDto)

  res.json({
    total,
    limit,
    offset,
    items,
  })
})

// PATCH /api/notifications/:id/read
router.patch(
  '/notifications/:id/read',
  requireAuth,
  async (req: AuthRequest, res) => {
    const userId = req.user!.id
    const { id } = req.params

    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    )

    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json({ notification: toNotificationDto(notif) })
  }
)

// PATCH /api/notifications/read-all
router.patch(
  '/notifications/read-all',
  requireAuth,
  async (req: AuthRequest, res) => {
    const userId = req.user!.id

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    )

    res.json({ ok: true })
  }
)

// delete /api/notifications/:id
router.delete(
  '/notifications/:id',
  requireAuth,
  async (req: AuthRequest, res) => {
    const { id } = req.params

    await Notification.findByIdAndDelete({ _id: id })

    res.json({ ok: true })
  }
)

export default router
