import { Router } from 'express'
import { Thread } from '../models/Thread'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Post } from '../models/Post'

const router = Router()

// List threads with optional search
router.get('/', async (req, res) => {
  const q = (req.query.q as string) || ''
  const filter = q ? { title: { $regex: q, $options: 'i' } } : {}

  const threads = await Thread.find(filter)
    .sort({ lastActivityAt: -1 })
    .limit(50)
    .populate('createdBy', 'username')

  res.json({ threads })
})

// Create thread
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { title, tags } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })

  const thread = await Thread.create({
    title,
    tags: tags || [],
    createdBy: req.user!.id,
    lastActivityAt: new Date(),
  })

  res.status(201).json({ thread })
})

// Get thread + first posts
router.get('/:threadId', async (req, res) => {
  const { threadId } = req.params

  const thread = await Thread.findById(threadId).populate(
    'createdBy',
    'username'
  )
  if (!thread) return res.status(404).json({ message: 'Not found' })

  const posts = await Post.find({ threadId })
    .sort({ createdAt: 1 })
    .limit(100)
    .populate('authorId', 'username')

  res.json({ thread, posts })
})

export default router
