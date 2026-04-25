import { connectDB } from '../lib/db'
import { logger } from '../lib/logger'
import { popJob } from '../lib/redis'
import { Post } from '../models/Post'
import { moderateText } from '../services/ai/service'

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
  logger.info('Worker running....')
  let delay = 500
  const maxDelay = 10000

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const job = await popJob('jobs:ai_moderation')

      if (job) {
        delay = 500
        try {
          await processAiModeration(job)
        } catch (err) {
          logger.error(err, 'AI moderation job error:')
        }
      } else {
        await new Promise(r => setTimeout(r, delay))
        if (delay < maxDelay) delay *= 2
      }
    } catch (err) {
      logger.error(err, 'Worker loop error:')
      await new Promise(r => setTimeout(r, 5000))
    }
  }
}

loop().catch(err => {
  logger.error(err, 'Worker failed to start')

  process.exit(1)
})
