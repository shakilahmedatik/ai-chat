import { Schema, model, Document, Types } from 'mongoose'

export interface INotification extends Document {
  userId: Types.ObjectId
  type: 'reply' | 'mention' | 'system'
  payload: any
  isRead: boolean
  createdAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['reply', 'mention', 'system'],
      required: true,
    },
    payload: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const Notification = model<INotification>(
  'Notification',
  notificationSchema
)
