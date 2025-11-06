import { Schema, model, Document, Types } from 'mongoose'

export interface IPost extends Document {
  threadId: Types.ObjectId
  parentId?: Types.ObjectId
  authorId: Types.ObjectId
  content: string
  isFlagged: boolean
  aiFlags?: {
    spam?: boolean
    toxicity?: boolean
    reason?: string
  }
  createdAt: Date
  updatedAt: Date
}

const postSchema = new Schema<IPost>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: 'Thread', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Post' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isFlagged: { type: Boolean, default: false },
    aiFlags: {
      spam: Boolean,
      toxicity: Boolean,
      reason: String,
    },
  },
  { timestamps: true }
)

export const Post = model<IPost>('Post', postSchema)
