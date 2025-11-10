'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Post } from '@/lib/types'
import { PostItem } from '@/components/post-item'
import { PostReplyForm } from '@/components/post-reply-form'
import { useSocket } from '@/hooks/use-socket'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { EmptyPosts } from '@/components/empty-state'
import { buildPostTree, PostNode } from '@/lib/post-tree'
import { PostComposer } from './post-composer'
import { buildMentionUsersFromPosts } from '@/lib/mentions'

interface PostListProps {
  threadId: string
  flatPosts: Post[]
}

export function PostList({ threadId, flatPosts }: PostListProps) {
  const [flatPostsCopy, setFlatPostsCopy] = useState<Post[]>(flatPosts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { on, off, joinThread, leaveThread } = useSocket()
  const tree = useMemo(() => buildPostTree(flatPostsCopy), [flatPostsCopy])
  const users = useMemo(
    () => buildMentionUsersFromPosts(flatPostsCopy),
    [flatPostsCopy]
  )

  useEffect(() => {
    joinThread(threadId)
    const handleNewPost = (data: unknown) => {
      const post = data as PostNode
      setFlatPostsCopy(prev => {
        // Avoid duplicates
        if (prev.some(p => p._id === post._id)) {
          return prev
        }
        return [...prev, post]
      })
    }
    on('new_post', handleNewPost)
    return () => {
      off('new_post', handleNewPost)
      leaveThread(threadId)
    }
  }, [joinThread, leaveThread, on, off, threadId])

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-6'>
      {!loading && tree.length === 0 ? (
        <EmptyPosts />
      ) : (
        tree.map(post => (
          <PostItem
            users={users}
            key={post._id}
            post={post}
            threadId={threadId}
            depth={0}
          />
        ))
      )}

      <div className='pt-4 border-t'>
        {/* <PostReplyForm threadId={threadId} /> */}
        <PostComposer users={users} threadId={threadId} />
      </div>
    </div>
  )
}
