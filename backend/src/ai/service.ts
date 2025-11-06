import { env } from '../env'
import { Post } from '../models/Post'
import { Thread } from '../models/Thread'
import fetch from 'node-fetch' // if not in deps, add it

export async function moderateText(content: string): Promise<{
  allowed: boolean
  spam?: boolean
  toxicity?: boolean
  reason?: string
}> {
  if (!env.HF_MODERATION_URL || !env.HF_TOKEN) {
    // fallback: allow all in dev/demo
    return { allowed: true }
  }

  try {
    const response = await fetch(env.HF_MODERATION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: content }),
    })

    const result: any = await response.json()

    // This mapping depends on chosen model.
    // Keep it simple: if model predicts high "toxic" or "spam", block.
    const output = Array.isArray(result) ? result[0] : result
    const toxic = output?.labels?.includes('toxic')
    const spam = output?.labels?.includes('spam')

    if (toxic || spam) {
      return {
        allowed: false,
        toxicity: !!toxic,
        spam: !!spam,
        reason: 'Flagged by AI moderation',
      }
    }

    return { allowed: true }
  } catch (e) {
    console.error('moderateText error', e)
    // fail-open for assignment simplicity
    return { allowed: true }
  }
}

export async function summarizeThread(
  threadId: string
): Promise<string | null> {
  if (!env.HF_SUMMARIZE_URL || !env.HF_TOKEN) return null

  const posts = await Post.find({ threadId }).sort({ createdAt: 1 }).limit(50)

  if (!posts.length) return null

  const text = posts.map(p => p.content).join('\n\n')

  const prompt = `Summarize the following discussion in 3-5 concise sentences, focusing on key issues & solutions:\n\n${text}`

  try {
    const response = await fetch(env.HF_SUMMARIZE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    })

    const result: any = await response.json()
    const summary =
      Array.isArray(result) && result[0]?.summary_text
        ? result[0].summary_text
        : result?.generated_text || null

    if (!summary) return null

    await Thread.findByIdAndUpdate(threadId, { summary })
    return summary
  } catch (e) {
    console.error('summarizeThread error', e)
    return null
  }
}
