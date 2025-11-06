import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Notification } from '../models/Notification'

const router = Router()

// GET /api/notifications
// Query:
//   - limit: number (default 20)
//   - offset: number (default 0)
//   - unread: "true" to fetch only unread
router.get('/notifications', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
  const offset = parseInt(req.query.offset as string) || 0
  const unreadOnly = req.query.unread === 'true'

  const filter: any = { userId }
  if (unreadOnly) {
    filter.isRead = false
  }

  const [items, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit),
    Notification.countDocuments(filter),
  ])

  res.json({
    total,
    limit,
    offset,
    items,
  })
})

// PATCH /api/notifications/:id/read
// Marks a single notification as read
router.patch(
  '/notifications/:id/read',
  requireAuth,
  async (req: AuthRequest, res) => {
    const userId = req.user!.id
    const { id } = req.params

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json({ notification })
  }
)

// PATCH /api/notifications/read-all
// Marks all notifications for the current user as read
router.patch(
  '/notifications/read-all',
  requireAuth,
  async (req: AuthRequest, res) => {
    const userId = req.user!.id

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    )

    res.json({ ok: true })
  }
)

export default router
