// src/services/ai/service.test.ts
import { describe, it, expect } from 'vitest'
import { moderateText } from './service'

describe('moderateText', () => {
  it('allows normal content', async () => {
    const res = await moderateText('Hello, this is a friendly message.')
    expect(res.allowed).toBe(true)
  })

  it('flags toxic content', async () => {
    const res = await moderateText('You are stupid and awful')
    expect(res.allowed).toBe(false)
    // depending on your implementation:
    // expect(res.toxic).toBe(true)
  })
})
