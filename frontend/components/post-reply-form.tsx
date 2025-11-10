'use client'

import type React from 'react'

import { useState } from 'react'
import { createPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ReplyIcon } from 'lucide-react'

interface PostReplyFormProps {
  threadId: string
  parentId?: string
  onSuccess?: () => void
}

export function PostReplyForm({
  threadId,
  parentId,
  onSuccess,
}: PostReplyFormProps) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

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

  return (
    <form onSubmit={handleSubmit} className='space-x-3 flex items-end'>
      <Textarea
        placeholder='Write your reply...'
        value={body}
        onChange={e => setBody(e.target.value)}
        className=''
        disabled={loading}
      />
      <div className='flex gap-2 justify-end'>
        <Button
          type='submit'
          className='cursor-pointer hover:bg-accent'
          disabled={loading || !body.trim()}
        >
          {loading ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
            </>
          ) : (
            <ReplyIcon />
          )}
        </Button>
      </div>
    </form>
  )
}
