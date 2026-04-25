import { Schema, model, Document, Types } from 'mongoose'

interface IFlag {
  userId: Types.ObjectId
  reason: string
  createdAt: Date
}

export interface IPost extends Document {
  threadId: Types.ObjectId
  parentId?: Types.ObjectId
  authorId: Types.ObjectId
  content: string
  isFlagged: boolean
  flags: IFlag[]
  aiFlags?: {
    toxic?: boolean
    insult?: boolean
    obscene?: boolean
    threat?: boolean
    identity_hate?: boolean
    reason?: string
  }
  status: 'active' | 'removed'
  createdAt: Date
  updatedAt: Date
}

const flagSchema = new Schema<IFlag>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const postSchema = new Schema<IPost>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: 'Thread', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Post' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isFlagged: { type: Boolean, default: false },
    flags: { type: [flagSchema], default: [] },
    aiFlags: {
      toxic: { type: String },
      insult: { type: String },
      obscene: { type: String },
      threat: { type: String },
      identity_hate: { type: String },
      reason: String,
    },
    status: {
      type: String,
      enum: ['active', 'removed'],
      default: 'active',
    },
  },
  { timestamps: true }
)

export const Post = model<IPost>('Post', postSchema)
