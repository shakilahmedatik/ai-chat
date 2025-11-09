import { env } from '../env'
import { hf } from './hfClient'

export async function summarizeThread(prompt: string): Promise<string | null> {
  try {
    const result = await hf.summarization({
      model: env.HF_SUMMARIZATION_MODEL,
      inputs: prompt,
      parameters: {
        max_length: 100,
        min_length: 60,
      },
    })
    const summary = result.summary_text

    if (!summary) return null
    return summary
  } catch (error) {
    console.error('Summarization API error:', error)
    throw new Error('Failed to generate summary via API.')
  }
}

export async function moderateText(text: string): Promise<{
  allowed: boolean
  toxic?: boolean
  insult?: boolean
  obscene?: boolean
  threat?: boolean
  identity_hate?: boolean
  flaggedCategories?: {
    label: string
    score: number
  }[]
  action?: 'APPROVE' | 'REQUIRES_REVIEW' | 'APPROVE_FALLBACK'
  reason?: string
}> {
  try {
    // Use the textClassification method
    const result = await hf.textClassification({
      model: env.HF_MODERATION_MODEL,
      inputs: text,
    })

    const toxicityThreshold = 0.8

    // The result is an array of labels/scores, similar to the local pipeline
    const flaggedResults = result
      .filter(item => item.score > toxicityThreshold)
      .map(item => ({
        label: item.label,
        score: item.score,
      }))

    // ... (rest of the moderation logic remains the same) ...
    if (flaggedResults.length > 0) {
      const toxic = flaggedResults.some(flag => flag.label === 'toxic')
      const insult = flaggedResults.some(flag => flag.label === 'insult')
      const obscene = flaggedResults.some(flag => flag.label === 'obscene')
      const threat = flaggedResults.some(flag => flag.label === 'threat')
      const identity_hate = flaggedResults.some(
        flag => flag.label === 'identity_hate'
      )

      return {
        allowed: false,
        toxic,
        insult,
        obscene,
        threat,
        identity_hate,
        flaggedCategories: flaggedResults,
        action: 'REQUIRES_REVIEW',
        reason: 'Flagged by AI moderation',
      }
    } else {
      return {
        allowed: true,
        action: 'APPROVE',
      }
    }
  } catch (error) {
    console.error('AI Moderation API error:', error)
    // Important: Handle API failure gracefully, don't block user content
    return { allowed: true, action: 'APPROVE_FALLBACK' }
  }
}
