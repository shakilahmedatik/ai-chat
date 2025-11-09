import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  passwordHash: string
  avatarUrl?: string
  bio?: string
  roles: 'user' | 'admin' | 'moderator'
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatarUrl: String,
    bio: String,
    roles: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
)

export const User = model<IUser>('User', userSchema)
