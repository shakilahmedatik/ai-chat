import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Post } from '../models/Post'
import { Thread } from '../models/Thread'
import { redis } from '../lib/redis'

const router = Router({ mergeParams: true })

// List posts for a thread
router.get('/threads/:threadId/posts', async (req, res) => {
  const { threadId } = req.params
  const posts = await Post.find({ threadId })
    .sort({ createdAt: 1 })
    .populate('authorId', 'username')
  res.json({ posts })
})

// Create post / reply
router.post(
  '/threads/:threadId/posts',
  requireAuth,
  async (req: AuthRequest, res) => {
    const { threadId } = req.params
    const { content, parentId } = req.body

    const thread = await Thread.findById(threadId)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })

    if (!content) return res.status(400).json({ message: 'Content required' })

    const post = await Post.create({
      threadId,
      parentId: parentId || undefined,
      authorId: req.user!.id,
      content,
    })

    thread.lastActivityAt = new Date()
    await thread.save()

    // enqueue jobs for worker (notifications + moderation)
    await redis.lpush(
      'jobs:ai_moderation',
      JSON.stringify({
        type: 'ai_moderation',
        postId: post.id,
      })
    )

    await redis.lpush(
      'jobs:notifications',
      JSON.stringify({
        type: 'new_reply',
        threadId,
        postId: post.id,
        authorId: req.user!.id,
      })
    )

    // Socket.io broadcast will be handled in index.ts using io

    res.status(201).json({ post })
  }
)

export default router
