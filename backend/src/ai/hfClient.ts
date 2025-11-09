import { InferenceClient } from '@huggingface/inference'
import { env } from '../env'

// The InferenceClient class automatically uses the HF_ACCESS_TOKEN
// environment variable if passed without arguments.
export const hf = new InferenceClient(env.HF_TOKEN)

if (!env.HF_TOKEN) {
  console.error('FATAL: HF_ACCESS_TOKEN is not set. Inference API will fail.')
}
