import { Schema, model, Document, Types } from 'mongoose'

export type NotificationType = 'reply' | 'mention' | 'flag' | 'admin' | 'digest'

export interface INotification extends Document {
  userId: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['reply', 'mention', 'flag', 'admin', 'digest'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export const Notification = model<INotification>(
  'Notification',
  notificationSchema
)
