import { Router } from 'express'
import { requireAuth, AuthRequest, requireAdmin } from '../middleware/auth'
import { Post } from '../models/Post'
import { Thread } from '../models/Thread'
import { User } from '../models/User'

const router = Router()

// Shape expected by ModerationPage's FlaggedPost
const toFlaggedDto = (post: any, thread: any, author: any) => {
  // prefer last manual flag → else AI reason → else generic
  const lastFlag = post.flags?.[post.flags.length - 1]
  const reason =
    lastFlag?.reason ||
    post.aiFlags?.reason ||
    (post.aiFlags ? 'AI flagged content' : 'Flagged')

  return {
    id: post._id.toString(),
    threadId: thread?._id?.toString(),
    threadTitle: thread?.title || 'Unknown thread',
    author: {
      id: author?._id?.toString() || '',
      username: author?.username || 'Unknown',
      avatarUrl: author?.avatarUrl || '',
    },
    body: post.content,
    reason,
    createdAt: post.createdAt.toISOString(),
  }
}

// GET /api/admin/moderation/posts
router.get(
  '/admin/moderation/posts',
  requireAuth,
  requireAdmin,
  async (_req, res) => {
    // all posts requiring review
    const posts = await Post.find({
      $or: [{ isFlagged: true }, { 'flags.0': { $exists: true } }],
      status: { $ne: 'removed' },
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    const threadIds = [...new Set(posts.map(p => String(p.threadId)))]
    const authorIds = [...new Set(posts.map(p => String(p.authorId)))]

    const [threads, authors] = await Promise.all([
      Thread.find({ _id: { $in: threadIds } })
        .select('_id title')
        .lean(),
      User.find({ _id: { $in: authorIds } })
        .select('_id username avatarUrl')
        .lean(),
    ])

    const threadMap = new Map(threads.map(t => [String(t._id), t]))
    const authorMap = new Map(authors.map(a => [String(a._id), a]))

    const items = posts.map(p =>
      toFlaggedDto(
        p,
        threadMap.get(String(p.threadId)),
        authorMap.get(String(p.authorId))
      )
    )

    res.json({ items })
  }
)

// PATCH /api/admin/moderation/posts/:postId/approve
router.patch(
  '/admin/moderation/posts/:postId/approve',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { postId } = req.params

    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found.' })

    post.isFlagged = false
    post.flags = []
    post.aiFlags = undefined
    post.status = 'active'
    await post.save()

    res.json({ ok: true })
  }
)

// PATCH /api/admin/moderation/posts/:postId/remove
router.patch(
  '/admin/moderation/posts/:postId/remove',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { postId } = req.params

    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found.' })

    post.status = 'removed'
    post.isFlagged = false
    const res2 = await post.save()
    console.log(res2)
    res.json({ ok: true })
  }
)

export default router
