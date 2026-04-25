import axios from 'axios'
import crypto from 'crypto'
import { Webhook, IWebhook, WebhookEvent } from '../models/Webhook'
import { WebhookDelivery } from '../models/WebhookDelivery'
import type { NotificationDto } from './notifications'

export async function triggerWebhooksForNotification(
  notification: NotificationDto
) {
  const event = notification.type as WebhookEvent
  if (!['mention', 'reply', 'digest'].includes(event)) return

  const webhooks = await Webhook.find({
    isActive: true,
    events: event,
  })

  if (!webhooks.length) return

  const payload = {
    event,
    notification,
  }

  const body = JSON.stringify(payload)

  await Promise.all(
    webhooks.map(async (hook: IWebhook) => {
      const started = Date.now()
      let statusCode = 0
      let error: string | undefined
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        if (hook.secret) {
          const sig = crypto
            .createHmac('sha256', hook.secret)
            .update(body)
            .digest('hex')
          headers['x-webhook-signature'] = sig
        }

        const res = await axios.post(hook.targetUrl, body, {
          headers,
          timeout: 5000,
          validateStatus: () => true,
        })

        statusCode = res.status
        if (res.status >= 400) {
          error = `Non-2xx response`
        }
      } catch (e: any) {
        statusCode = e?.response?.status || 0
        error = e?.message || 'Request failed'
      }

      const responseTime = Date.now() - started

      await WebhookDelivery.create({
        webhookId: hook._id,
        event,
        statusCode,
        responseTime,
        error,
      })

      hook.lastDeliveryAt = new Date()
      hook.lastDeliveryStatus =
        statusCode >= 200 && statusCode < 300 && !error ? 'success' : 'failed'
      await hook.save()
    })
  )
}
