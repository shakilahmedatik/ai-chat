import { Schema, model, Document, Types } from 'mongoose'

interface IMediaFile {
  src: string
  type: 'image' | 'video'
  _id?: Types.ObjectId
}

export interface IThread extends Document {
  title: string
  postBody: string
  postType: 'Courses Topics' | 'Bugs' | 'Guidelines' | 'Feature Requests' | 'Others'
  batch: string
  author: {
    _id: Types.ObjectId
    fullName: string
    profileImage?: string
    role: string
  }
  imagesOrVideos: IMediaFile[]
  status: 'Acknowledged' | 'In Progress' | 'Resolved' | 'Open'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  isCommentOff: boolean
  commentedByAdmin: boolean
  commentsCount: number
  isEdited: boolean
  tags?: string[]
  summary?: string
  summaryGeneratedAt?: Date
  lastActivityAt: Date
  createdAt: Date
  updatedAt: Date
}

const mediaFileSchema = new Schema<IMediaFile>(
  {
    src: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
  },
  { _id: true }
)

const threadSchema = new Schema<IThread>(
  {
    title: { type: String, required: true },
    postBody: { type: String, required: true },
    postType: {
      type: String,
      enum: ['Courses Topics', 'Bugs', 'Guidelines', 'Feature Requests', 'Others'],
      required: true,
    },
    batch: { type: String, required: true },
    author: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      fullName: { type: String, required: true },
      profileImage: { type: String },
      role: { type: String, required: true },
    },
    imagesOrVideos: { type: [mediaFileSchema], default: [] },
    status: {
      type: String,
      enum: ['Acknowledged', 'In Progress', 'Resolved', 'Open'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    isCommentOff: { type: Boolean, default: false },
    commentedByAdmin: { type: Boolean, default: false },
    commentsCount: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    tags: [String],
    summary: String,
    summaryGeneratedAt: Date,
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Thread = model<IThread>('Thread', threadSchema)
