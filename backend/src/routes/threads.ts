import { Router } from 'express'
import { Thread } from '../models/Thread'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Post } from '../models/Post'
import { summarizeThread } from '../ai/service'

const router = Router()

// List threads with optional search
router.get('/threads', async (req, res) => {
  let filter: any = {}

  const authorId = (req.query.authorId as string) || ''
  const search = (req.query.search as string) || ''

  const tag = (req.query.tag as string) || ''
  if (authorId) filter.createdBy = authorId
  if (search) filter.title = { $regex: search, $options: 'i' }
  if (tag) filter.tags = { $in: [tag] }

  const threads = await Thread.find(filter)
    .sort({ lastActivityAt: -1 })
    .limit(50)
    .populate('createdBy', 'username avatarUrl roles')

  res.json({ threads })
})

// Create thread
router.post('/threads', requireAuth, async (req: AuthRequest, res) => {
  const { title, tags, description } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })

  const thread = await Thread.create({
    title,
    tags: tags || [],
    createdBy: req.user!.id,
    description,
    lastActivityAt: new Date(),
  })

  res.status(201).json(thread)
})

// Get thread + first posts
router.get('/threads/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params
    const thread = await Thread.findById(threadId).populate(
      'createdBy',
      'username avatarUrl'
    )

    if (!thread) return res.status(404).json({ message: 'Not found' })

    const posts = await Post.find({ threadId })
      .sort({ createdAt: 1 })
      .limit(100)
      .populate('authorId', 'username avatarUrl roles')

    res.json({ thread, posts })
  } catch (err) {
    console.log('error from thread id route-->', err)
  }
})
// Generate Summary
router.get('/threads/:threadId/summary', async (req, res) => {
  const { threadId } = req.params
  const thread = await Thread.findById(threadId).select(
    'title description summary summaryGeneratedAt'
  )
  if (!thread) return res.status(404).json({ message: 'Not found' })
  const THIRTY_MINUTES = 30 * 60 * 1000
  const now = Date.now()

  // If we have a recent summary, reuse it
  if (
    thread.summary &&
    thread.summaryGeneratedAt &&
    now - thread.summaryGeneratedAt.getTime() < THIRTY_MINUTES
  ) {
    const waitingTime =
      THIRTY_MINUTES - (now - thread.summaryGeneratedAt.getTime())

    return res.json({
      summary: thread.summary,
      cached: true,
      summaryGeneratedAt: thread.summaryGeneratedAt,
      waitingTime: new Date(waitingTime).getMinutes(),
    })
  }
  const posts = await Post.find({ threadId })
    .sort({ createdAt: 1 })
    .limit(50)
    .select('content') // Add this line

  if (!posts.length)
    return res.json({
      summary: 'Not enough content to generate the summary for this thread.',
    })

  const text = posts.map(p => p.content).join('\n\n')

  const prompt = `Thread: ${thread.title}. Description: ${thread.description}. Summarize the following discussion of this thread focusing on key issues & solutions:\n\n${text}`

  const summary = await summarizeThread(prompt)

  await Thread.findByIdAndUpdate(threadId, {
    summary,
    summaryGeneratedAt: new Date(),
    lastActivityAt: new Date(),
  })

  res.json({
    summary,
    cached: false,
    summaryGeneratedAt: new Date().toISOString(),
  })
})

export default router
