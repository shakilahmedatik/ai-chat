import { connectDB } from '../lib/db'
import { redis } from '../lib/redis'
import { Post } from '../models/Post'
import { Notification } from '../models/Notification'
import { moderateText, summarizeThread } from '../ai/service'
import { WebhookSubscription } from '../models/WebhookSubscription'

async function processAiModeration(job: any) {
  const post = await Post.findById(job.postId)
  if (!post) return

  const res = await moderateText(post.content)
  if (!res.allowed) {
    post.isFlagged = true
    post.aiFlags = {
      spam: res.spam,
      toxicity: res.toxicity,
      reason: res.reason,
    }
    await post.save()
  }
}

async function processNotifications(job: any) {
  const { type, threadId, postId, authorId } = job

  if (type === 'new_reply') {
    // Basic version:
    // notify thread owner (you can extend with mentions)
    // Here you'd load thread + create notification.
    // Kept small for task.
    // Optionally trigger summarizeThread for long threads
    // e.g., every N posts.
  }
}

async function loop() {
  await connectDB()

  while (true) {
    // AI moderation
    const aiJobRaw = await redis.rpop<string>('jobs:ai_moderation')
    if (aiJobRaw) {
      try {
        await processAiModeration(JSON.parse(aiJobRaw))
      } catch (e) {
        console.error('AI job error', e)
      }
    }

    // Notifications
    const notifJobRaw = await redis.rpop<string>('jobs:notifications')
    if (notifJobRaw) {
      try {
        await processNotifications(JSON.parse(notifJobRaw))
      } catch (e) {
        console.error('Notif job error', e)
      }
    }

    // tiny delay
    await new Promise(r => setTimeout(r, 300))
  }
}

loop().catch(err => {
  console.error(err)
  process.exit(1)
})
