'use client'

import type React from 'react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createPost } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Textarea } from './ui/textarea'
import { MentionUser } from '@/lib/mentions'

interface PostComposerProps {
  threadId: string
  parentId?: string
  users: MentionUser[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function PostComposer({
  threadId,
  parentId,
  users,
  onSuccess,
  onCancel,
}: PostComposerProps) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Get mention suggestions
  const mentionSuggestions = mentionQuery
    ? users.filter(u =>
        u.username.toLowerCase().startsWith(mentionQuery.toLowerCase())
      )
    : users.slice(0, 3)

  // Handle @mention detection and insertion
  const handleMentionSelect = (username: string) => {
    if (!textareaRef.current) return

    const text = body
    const lastAtIndex = text.lastIndexOf('@')
    if (lastAtIndex === -1) return

    const before = text.slice(0, lastAtIndex)
    console.log(before)
    const after = text.slice(text.indexOf(' ', lastAtIndex))
    console.log(after)
    const newText = `${before}@${username}`
    console.log(newText)

    setBody(newText)
    setMentionOpen(false)
    setMentionQuery('')

    // Focus back on textarea
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  // Detect @ character for mentions
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    console.log(text)
    setBody(text)

    const lastAtIndex = text.lastIndexOf('@')
    const lastSpaceIndex = text.lastIndexOf(' ')

    if (lastAtIndex > lastSpaceIndex) {
      const query = text.slice(lastAtIndex + 1)
      console.log(query)
      setMentionQuery(query)
      setMentionOpen(true)
      setMentionIndex(0)
    } else {
      setMentionOpen(false)
      setMentionQuery('')
    }
  }

  // Handle mention keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mentionOpen || mentionSuggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMentionIndex(i => (i + 1) % mentionSuggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMentionIndex(
        i => (i - 1 + mentionSuggestions.length) % mentionSuggestions.length
      )
    } else if (e.key === 'Enter' && mentionOpen) {
      e.preventDefault()
      handleMentionSelect(mentionSuggestions[mentionIndex].username)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!body.trim()) {
      toast({
        title: 'Error',
        description: 'Reply cannot be empty',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await createPost(threadId, {
        content: body.trim(),
        parentId,
      })

      setBody('')
      setMentionOpen(false)
      onSuccess?.()

      toast({
        title: 'Success',
        description: 'Reply posted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to post reply',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  console.log(users)
  return (
    <form onSubmit={handleSubmit} className='space-y-3 py-6 relative'>
      <div className='flex items-end  gap-2'>
        {/* Textarea */}
        <div className='relative w-full'>
          <p id='composer-help' className='sr-only'>
            Use @ to mention other users
          </p>

          {/* Mention Autocomplete Dropdown */}
          {mentionOpen && mentionSuggestions.length > 0 && (
            <div
              className='absolute bottom-full left-3 mb-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50'
              role='listbox'
              aria-label='User mentions'
            >
              {mentionSuggestions.map((user, idx) => (
                <button
                  key={user.id}
                  type='button'
                  onClick={() => handleMentionSelect(user.username)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-muted',
                    idx === mentionIndex && 'bg-muted'
                  )}
                  role='option'
                  aria-selected={idx === mentionIndex}
                >
                  @{user.username}
                </button>
              ))}
            </div>
          )}

          <Textarea
            name='post'
            ref={textareaRef}
            placeholder='Write your reply... (Type @ to mention someone)'
            value={body}
            onChange={handleBodyChange}
            onKeyDown={handleKeyDown}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring '
            disabled={loading}
            aria-label='Compose your reply'
            aria-describedby='composer-help'
          />
        </div>

        {/* Action Buttons */}
        <Button
          type='submit'
          className='cursor-pointer'
          disabled={loading || !body.trim()}
          aria-busy={loading}
        >
          {loading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Send className='h-4 w-4' />
          )}
        </Button>
      </div>
    </form>
  )
}
