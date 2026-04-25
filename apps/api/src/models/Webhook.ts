import { Schema, model, Document } from 'mongoose'

export type WebhookEvent = 'mention' | 'reply' | 'digest'

export interface IWebhook extends Document {
  targetUrl: string
  events: WebhookEvent[]
  secret?: string
  isActive: boolean
  lastDeliveryAt?: Date
  lastDeliveryStatus?: 'success' | 'failed'
  createdAt: Date
  updatedAt: Date
}

const webhookSchema = new Schema<IWebhook>(
  {
    targetUrl: { type: String, required: true },
    events: {
      type: [String],
      enum: ['mention', 'reply', 'digest'],
      required: true,
    },
    secret: { type: String },
    isActive: { type: Boolean, default: true },
    lastDeliveryAt: { type: Date },
    lastDeliveryStatus: {
      type: String,
      enum: ['success', 'failed'],
    },
  },
  {
    timestamps: true,
  }
)

export const Webhook = model<IWebhook>('Webhook', webhookSchema)
