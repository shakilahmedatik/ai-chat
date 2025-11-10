import { Router } from 'express'
import { requireAuth, AuthRequest, requireAdmin } from '../middleware/auth'
import { Webhook } from '../models/Webhook'
import { WebhookDelivery } from '../models/WebhookDelivery'

const router = Router()

// GET /api/admin/webhooks
router.get('/admin/webhooks', requireAuth, requireAdmin, async (_req, res) => {
  const hooks = await Webhook.find().sort({ createdAt: -1 })

  const items = hooks.map(h => ({
    id:
      (h as any)._id &&
      typeof (h as any)._id === 'object' &&
      typeof (h as any)._id.toString === 'function'
        ? (h as any)._id.toString()
        : String((h as any)._id),
    targetUrl: h.targetUrl,
    events: h.events,
    secret: h.secret || '',
    isActive: h.isActive,
    lastDeliveryAt: h.lastDeliveryAt?.toISOString(),
    lastDeliveryStatus: h.lastDeliveryStatus,
    createdAt: h.createdAt.toISOString(),
  }))

  res.json({ items })
})

// POST /api/admin/webhooks
router.post('/admin/webhooks', requireAuth, requireAdmin, async (req, res) => {
  const { targetUrl, events, secret } = req.body

  if (!targetUrl || !Array.isArray(events) || events.length === 0) {
    return res
      .status(400)
      .json({ message: 'targetUrl and at least one event are required' })
  }

  const hook = await Webhook.create({
    targetUrl,
    events,
    secret,
    isActive: true,
  })

  res.status(201).json({
    id:
      (hook as any)._id &&
      typeof (hook as any)._id === 'object' &&
      typeof (hook as any)._id.toString === 'function'
        ? (hook as any)._id.toString()
        : String((hook as any)._id),
    targetUrl: hook.targetUrl,
    events: hook.events,
    secret: hook.secret || '',
    isActive: hook.isActive,
    createdAt: hook.createdAt.toISOString(),
  })
})

// PUT /api/admin/webhooks/:id
router.put(
  '/admin/webhooks/:id',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params
    const { targetUrl, events, secret, isActive } = req.body

    const hook = await Webhook.findByIdAndUpdate(
      id,
      { targetUrl, events, secret, isActive },
      { new: true }
    )

    if (!hook) return res.status(404).json({ message: 'Not found' })

    res.json({
      id:
        (hook as any)._id &&
        typeof (hook as any)._id === 'object' &&
        typeof (hook as any)._id.toString === 'function'
          ? (hook as any)._id.toString()
          : String((hook as any)._id),
      targetUrl: hook.targetUrl,
      events: hook.events,
      secret: hook.secret || '',
      isActive: hook.isActive,
      lastDeliveryAt: hook.lastDeliveryAt?.toISOString(),
      lastDeliveryStatus: hook.lastDeliveryStatus,
      createdAt: hook.createdAt.toISOString(),
    })
  }
)

// PATCH /api/admin/webhooks/:id/toggle
router.patch(
  '/admin/webhooks/:id/toggle',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params
    const { isActive } = req.body

    const hook = await Webhook.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    )
    if (!hook) return res.status(404).json({ message: 'Not found' })

    res.json({
      id:
        (hook as any)._id &&
        typeof (hook as any)._id === 'object' &&
        typeof (hook as any)._id.toString === 'function'
          ? (hook as any)._id.toString()
          : String((hook as any)._id),
      isActive: hook.isActive,
    })
  }
)

// DELETE /api/admin/webhooks/:id
router.delete(
  '/admin/webhooks/:id',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params
    await Webhook.findByIdAndDelete(id)
    res.json({ ok: true })
  }
)

// GET /api/admin/webhooks/:id/deliveries
router.get(
  '/admin/webhooks/:id/deliveries',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params

    const deliveries = await WebhookDelivery.find({ webhookId: id })
      .sort({ createdAt: -1 })
      .limit(50)

    const items = deliveries.map(d => ({
      id:
        (d as any)._id &&
        typeof (d as any)._id === 'object' &&
        typeof (d as any)._id.toString === 'function'
          ? (d as any)._id.toString()
          : String((d as any)._id),
      webhookId: d.webhookId.toString(),
      event: d.event,
      statusCode: d.statusCode,
      responseTime: d.responseTime,
      error: d.error,
      createdAt: d.createdAt.toISOString(),
    }))

    res.json({ items })
  }
)

export default router
