import { Schema, model, Document, Types } from 'mongoose'
import { WebhookEvent } from './Webhook'

export interface IWebhookDelivery extends Document {
  webhookId: Types.ObjectId
  event: WebhookEvent
  statusCode: number
  responseTime: number
  error?: string
  createdAt: Date
}

const webhookDeliverySchema = new Schema<IWebhookDelivery>(
  {
    webhookId: {
      type: Schema.Types.ObjectId,
      ref: 'Webhook',
      required: true,
    },
    event: {
      type: String,
      enum: ['mention', 'reply', 'digest'],
      required: true,
    },
    statusCode: { type: Number, required: true },
    responseTime: { type: Number, required: true },
    error: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export const WebhookDelivery = model<IWebhookDelivery>(
  'WebhookDelivery',
  webhookDeliverySchema
)
