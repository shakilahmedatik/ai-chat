import { Schema, model, Document } from 'mongoose'

export interface IWebhookSubscription extends Document {
  url: string
  eventTypes: string[]
  secret: string
  createdAt: Date
}

const webhookSchema = new Schema<IWebhookSubscription>(
  {
    url: { type: String, required: true },
    eventTypes: [{ type: String, required: true }],
    secret: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const WebhookSubscription = model<IWebhookSubscription>(
  'WebhookSubscription',
  webhookSchema
)
