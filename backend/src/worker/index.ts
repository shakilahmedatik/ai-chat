import { connectDB } from '../lib/db'
import { redis } from '../lib/redis'
import { Post } from '../models/Post'
import { moderateText } from '../ai/service'

// Process a single AI moderation job pulled from Redis
async function processAiModeration(job: any) {
  const post = await Post.findById(job.postId)
  if (!post) return

  const res = await moderateText(post.content)
  if (!res.allowed) {
    post.isFlagged = true
    post.aiFlags = {
      toxic: res.toxic,
      insult: res.insult,
      obscene: res.obscene,
      threat: res.threat,
      identity_hate: res.identity_hate,
      reason: res.reason,
    }

    await post.save()
  }
}

async function loop() {
  await connectDB()

  while (true) {
    // Background AI moderation for new posts
    const aiJobRaw = await redis.rpop<string>('jobs:ai_moderation')

    if (aiJobRaw) {
      try {
        await processAiModeration(aiJobRaw)
      } catch (e) {
        console.error('AI job error', e)
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
