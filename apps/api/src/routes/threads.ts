import { Router } from 'express'
import { Thread } from '../models/Thread'
import { User } from '../models/User'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Post } from '../models/Post'
import { summarizeThread } from '../services/ai/service'

const router = Router()

// List threads - with batch filtering based on user role
router.get('/threads', async (req, res) => {
  let filter: any = {}

  const authorId = (req.query.authorId as string) || ''
  const search = (req.query.search as string) || ''
  const batch = (req.query.batch as string) || ''
  const postType = (req.query.postType as string) || ''
  const userId = (req.query.userId as string) || ''
  const userBatch = (req.query.userBatch as string) || ''

  if (authorId) filter.author._id = authorId
  if (search) filter.title = { $regex: search, $options: 'i' }
  if (batch) filter.batch = batch
  if (postType) filter.postType = postType

  // If user is not admin/moderator and userBatch is provided, only show their batch
  if (userBatch && !['admin', 'moderator'].includes(req.query.userRole as string)) {
    filter.batch = userBatch
  }

  const threads = await Thread.find(filter)
    .sort({ lastActivityAt: -1 })
    .limit(50)

  res.json({ threads })
})

// List my threads
router.get('/my-threads', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id
  const userBatch = req.user!.batch

  const filter: any = { 'author._id': userId }

  const threads = await Thread.find(filter)
    .sort({ lastActivityAt: -1 })
    .limit(50)

  res.json({ threads })
})

// Create thread
router.post('/threads', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, postBody, postType, batch, imagesOrVideos, tags } = req.body
    
    if (!title || !postBody || !postType || !batch) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, postBody, postType, batch' 
      })
    }

    const validPostTypes = ['Courses Topics', 'Bugs', 'Guidelines', 'Feature Requests', 'Others']
    if (!validPostTypes.includes(postType)) {
      return res.status(400).json({ message: 'Invalid postType' })
    }

    const user = await User.findById(req.user!.id)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Only allow users to create threads in their own batch (unless admin/moderator)
    if (user.role === 'user' && user.batch !== batch) {
      return res.status(403).json({ message: 'You can only create threads in your own batch' })
    }

    const thread = await Thread.create({
      title,
      postBody,
      postType,
      batch,
      author: {
        _id: user._id,
        fullName: user.fullName || user.username,
        profileImage: user.profileImage,
        role: user.role,
      },
      imagesOrVideos: imagesOrVideos || [],
      tags: tags || [],
      status: 'Open',
      priority: 'Low',
      isCommentOff: false,
      commentedByAdmin: false,
      commentsCount: 0,
      isEdited: false,
      lastActivityAt: new Date(),
    })

    res.status(201).json(thread)
  } catch (err: any) {
    console.error('Error creating thread:', err)
    res.status(500).json({ message: 'Failed to create thread' })
  }
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
    'title postBody summary summaryGeneratedAt'
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

  const prompt = `Thread: ${thread.title}. Description: ${thread.postBody}. Summarize the following discussion of this thread focusing on key issues & solutions:\n\n${text}`

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
