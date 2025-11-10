export type User = {
  id: string
  username: string
  avatarUrl?: string
  roles: ('user' | 'admin')[]
}

export type Thread = {
  _id: string
  title: string
  description: string
  tags: string[]
  createdBy: User
  lastActivityAt: string
  createdAt: string
  postCount: number
  summary?: string
  summaryGeneratedAt?: string
}

export type Post = {
  _id: string
  threadId: string
  authorId: User
  parentId?: string | null
  content: string
  isFlagged: boolean
  status?: 'active' | 'removed'
  aiFlags?: {
    toxic?: boolean
    insult?: boolean
    obscene?: boolean
    threat?: boolean
    identity_hate?: boolean
    reason?: string
  }
  createdAt: string
  updatedAt: string
}

export type Notification = {
  id: string
  userId: string
  type: 'reply' | 'mention' | 'flag' | 'admin' | 'digest'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export type Webhook = {
  id: string
  targetUrl: string
  events: Array<'mention' | 'reply' | 'digest'>
  secret: string
  isActive: boolean
  lastDeliveryAt?: string
  lastDeliveryStatus?: 'success' | 'failed'
  createdAt: string
}

export type WebhookDelivery = {
  id: string
  webhookId: string
  event: string
  statusCode: number
  responseTime: number
  error?: string
  createdAt: string
}

export interface FlaggedPost {
  id: string
  threadId: string
  threadTitle: string
  author: {
    id: string
    username: string
    avatarUrl?: string
  }
  body: string
  reason: string
  createdAt: string
}
