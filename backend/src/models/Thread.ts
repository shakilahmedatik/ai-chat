import { Schema, model, Document, Types } from 'mongoose'

export interface IThread extends Document {
  title: string
  createdBy: Types.ObjectId
  description: string
  tags: string[]
  summary?: string
  summaryGeneratedAt?: Date
  createdAt: Date
  updatedAt: Date
  lastActivityAt: Date
}

const threadSchema = new Schema<IThread>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [String],
    summary: String,
    summaryGeneratedAt: Date,
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Thread = model<IThread>('Thread', threadSchema)
