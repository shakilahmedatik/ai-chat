import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Post } from '../models/Post'
import { Thread } from '../models/Thread'
import { redis } from '../lib/redis'
import { createAndEmitNotification } from '../services/notifications'
import { User } from '../models/User'

const router = Router({ mergeParams: true })

// Helper to extract @mentions
function extractMentions(content: string): string[] {
  const regex = /@([a-zA-Z0-9_]+)/g
  const names = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    names.add(match[1])
  }
  return Array.from(names)
}

// List posts for a thread
router.get('/threads/:threadId/posts', async (req, res) => {
  const { threadId } = req.params
  const posts = await Post.find({ threadId })
    .sort({ createdAt: 1 })
    .populate('authorId', 'username roles avatarUrl')
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

    // populate author data on the post
    const populatedPost = await post.populate({
      path: 'authorId',
      select: 'username avatarUrl roles', // or 'roles' if your schema uses that
    })

    // Get current user once (for nicer titles/messages)
    const author = await User.findById(req.user!.id).select('username')

    // 🔹 Track users we've notified for this post event
    const notifiedUserIds = new Set<string>()

    // 1) Reply notification (notify parent post author)
    if (parentId) {
      const parentPost = await Post.findById(parentId).select('authorId')
      if (
        parentPost &&
        parentPost.authorId.toString() !== req.user!.id.toString()
      ) {
        const targetId = parentPost.authorId.toString()
        await createAndEmitNotification({
          userId: parentPost.authorId.toString(),
          type: 'reply',
          title: `New reply from ${author?.username || 'Someone'}`,
          message: `replied to your post in "${thread.title}"`,
          link: `/${threadId}#post-${post._id}`,
        })
        notifiedUserIds.add(targetId)
      }
    }

    // 2) Mention notifications: @username
    const mentioned = extractMentions(content)
    if (mentioned.length) {
      const users = await User.find({
        username: { $in: mentioned },
      }).select('_id username')
      type U = { _id: string; username: string }
      for (const u of users as U[]) {
        const targetId = u._id.toString()

        // skip self
        if (targetId === req.user!.id.toString()) continue
        // ❗ already got a reply notification? don't send a duplicate mention
        if (notifiedUserIds.has(targetId)) continue

        await createAndEmitNotification({
          userId: u._id.toString(),
          type: 'mention',
          title: `You were mentioned by ${author?.username || 'someone'}`,
          message: `mentioned you in "${thread.title}"`,
          link: `/thread/${threadId}#post-${post._id}`,
        })

        notifiedUserIds.add(targetId)
      }
    }

    if ((global as any).io) {
      ;(global as any).io.to(`thread:${threadId}`).emit('new_post', {
        _id: post._id,
        threadId,
        content: post.content,
        authorId: populatedPost.authorId,
        parentId: post.parentId,
        createdAt: post.createdAt,
        isFlagged: populatedPost.isFlagged,
      })
    }

    // enqueue jobs for worker (notifications + moderation)
    await redis.lpush(
      'jobs:ai_moderation',
      JSON.stringify({
        type: 'ai_moderation',
        postId: post._id,
      })
    )

    // await redis.lpush(
    //   'jobs:notifications',
    //   JSON.stringify({
    //     type: 'new_reply',
    //     threadId,
    //     postId: post.id,
    //     authorId: req.user!.id,
    //   })
    // )

    // Socket.io broadcast will be handled in index.ts using io

    res.status(201).json({ post })
  }
)

// POST /api/posts/:postId/flag
router.post(
  '/posts/:postId/flag',
  requireAuth,
  async (req: AuthRequest, res) => {
    const { postId } = req.params
    const { reason } = req.body

    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ message: 'Reason is required for flagging.' })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' })
    }

    // prevent duplicate spam from same user (optional but smart)
    const alreadyFlagged = post.flags.some(
      f => f.userId.toString() === req.user!.id
    )
    if (!alreadyFlagged) {
      post.flags.push({
        userId: req.user!.id as any,
        reason: reason.trim(),
        createdAt: new Date(),
      } as any)
    }

    post.isFlagged = true
    await post.save()

    return res.json({ ok: true })
  }
)

export default router
