'use client'

import type { Post } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Flag, Reply, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { PostReplyForm } from '@/components/post-reply-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { flagPost } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { PostNode } from '@/lib/post-tree'
import { PostComposer } from './post-composer'
import { MentionUser } from '@/lib/mentions'

interface PostItemProps {
  post: PostNode
  threadId: string
  users: MentionUser[]
  depth: number
  onReplyFocus?: () => void
}

export function PostItem({
  post,
  threadId,
  users,
  depth,
  onReplyFocus,
}: PostItemProps) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [showReplies, setShowReplies] = useState(depth === 0)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const { toast } = useToast()
  const replyButtonRef = useRef<HTMLButtonElement>(null)

  const isRemoved = post.status === 'removed'
  console.log(post)
  const isFlagged = post.isFlagged
  const maxNesting = depth >= 3

  const handleReplyClick = () => {
    setReplyOpen(!replyOpen)
    onReplyFocus?.()
  }

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for reporting',
        variant: 'destructive',
      })
      return
    }

    setReportLoading(true)
    try {
      await flagPost(post._id, reportReason)
      toast({
        title: 'Success',
        description: 'Post reported successfully. Our team will review it.',
      })
      setReportOpen(false)
      setReportReason('')
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to report post',
        variant: 'destructive',
      })
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <article
      id={`post-${post._id}`}
      className={cn(
        'space-y-3',
        depth > 0 && 'ml-4 pl-4 border-l-2 border-border'
      )}
      role='article'
      aria-label={`Post by ${post.authorId.username}`}
    >
      <Card
        className={cn(
          'py-2  gap-2',
          isRemoved && 'opacity-70 bg-accent',
          isFlagged &&
            'border-destructive/50 bg-destructive/5 dark:bg-destructive/10'
        )}
      >
        <CardHeader className='  gap-0'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex  items-start gap-3 flex-1'>
              <Avatar className='h-8 w-8'>
                <AvatarImage
                  src={post.authorId.avatarUrl || '/placeholder.svg'}
                  alt={post.authorId.username}
                />
                <AvatarFallback>
                  {post.authorId.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className='font-semibold text-sm'>
                    {post.authorId.username}
                  </span>
                  {post.authorId.roles.includes('admin') && (
                    <Badge variant='destructive' className='text-xs'>
                      Admin
                    </Badge>
                  )}
                  {isFlagged && (
                    <Badge variant='destructive' className='text-xs gap-1'>
                      <Flag className='h-3 w-3' />
                      Flagged
                    </Badge>
                  )}
                  {isRemoved && (
                    <Badge variant='secondary' className='text-xs'>
                      Removed
                    </Badge>
                  )}
                </div>
                <time
                  className='text-xs text-muted-foreground'
                  dateTime={post.createdAt}
                >
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </time>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-2 '>
          {isRemoved ? (
            <p className='text-sm text-accent-foreground italic'>
              This post has been removed by a moderator.
            </p>
          ) : (
            <>
              <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                {post.content}
              </p>
            </>
          )}

          <div className='flex gap-2  flex-wrap'>
            <Button
              ref={replyButtonRef}
              variant='ghost'
              size='sm'
              className='gap-2'
              onClick={handleReplyClick}
              disabled={maxNesting}
              aria-label={
                maxNesting
                  ? 'Maximum nesting level reached'
                  : replyOpen
                  ? 'Close reply'
                  : 'Reply to this post'
              }
            >
              <Reply className='h-4 w-4' />
              Reply
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='gap-2 cursor-pointer'
              onClick={() => setReportOpen(true)}
              aria-label='Report this post'
            >
              <Flag className='h-4 w-4' />
              Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {replyOpen && !maxNesting && (
        <div className='ml-4 pl-4  bg-muted/30 rounded-lg'>
          <PostComposer
            users={users}
            threadId={threadId}
            parentId={post._id}
            onSuccess={() => setReplyOpen(false)}
          />
        </div>
      )}

      {/* Replies */}
      {!post?.replies ||
        (post?.replies?.length > 0 && (
          <div className='space-y-3'>
            {depth === 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className='text-sm text-primary hover:underline font-medium px-1'
                aria-expanded={showReplies}
                aria-label={`${showReplies ? 'Hide' : 'Show'} ${
                  post.replies.length
                } ${post.replies.length === 1 ? 'reply' : 'replies'}`}
              >
                {showReplies ? '−' : '+'} {post.replies.length}{' '}
                {post.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}

            {(showReplies || depth > 0) &&
              post.replies.map(reply => (
                <PostItem
                  users={users}
                  key={reply._id}
                  post={reply}
                  threadId={threadId}
                  depth={depth + 1}
                  onReplyFocus={onReplyFocus}
                />
              ))}
          </div>
        ))}

      {/* Report Dialog */}
      <AlertDialog open={reportOpen} onOpenChange={setReportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Post</AlertDialogTitle>
            <AlertDialogDescription>
              Help us keep the community safe by reporting inappropriate
              content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-3'>
            <textarea
              placeholder='Why are you reporting this post?'
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className='w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none'
              aria-label='Report reason'
            />
            <div className='text-xs text-muted-foreground'>
              Our moderation team will review your report and take appropriate
              action.
            </div>
          </div>
          <div className='flex gap-2 justify-end'>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReport}
              disabled={reportLoading || !reportReason.trim()}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {reportLoading ? 'Reporting...' : 'Report'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}
