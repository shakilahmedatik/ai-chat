import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  passwordHash: string
  displayName?: string
  fullName?: string
  bio?: string
  avatarUrl?: string
  profileImage?: string
  batch: string
  role: 'user' | 'moderator' | 'admin'
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String },
    fullName: { type: String },
    bio: { type: String },
    avatarUrl: { type: String },
    profileImage: { type: String },
    batch: { type: String, required: true },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  },
  { timestamps: true }
)

export const User = model<IUser>('User', userSchema)
