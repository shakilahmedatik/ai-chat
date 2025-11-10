'use client'

import type { Post, Thread } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Share2, Flag, Sparkles, Wifi, WifiOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { useSocket } from '@/hooks/use-socket'
import { fromNow } from '@/lib/time'
import { generateSummary } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface ThreadDetailProps {
  thread: Thread
  posts: Post[]
}

type SummaryDetails = {
  summary?: string
  summaryGeneratedAt?: string
  cached?: boolean
  waitingTime?: string
}

export function ThreadDetail({ thread, posts }: ThreadDetailProps) {
  const [summarizing, setSummarizing] = useState(false)
  const [summaryDetails, setSummaryDetails] = useState<SummaryDetails>({
    summary: thread.summary,
    summaryGeneratedAt: thread.summaryGeneratedAt,
    cached: false,
  })
  const { toast } = useToast()
  const summaryGenerateHandler = async () => {
    try {
      setSummarizing(true)
      const res: SummaryDetails = await generateSummary(thread._id)
      setSummaryDetails(res)
      if (res.cached)
        return toast({
          title: 'Cached Summary Served',
          description: `Wait for: ${res.waitingTime} minutes.`,
        })
    } catch (err) {
      console.log(err)
    } finally {
      setSummarizing(false)
    }
  }
  const { isConnected } = useSocket()
  console.log(thread)
  return (
    <article className='space-y-6'>
      <Card className='border-2'>
        <CardHeader>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between items-center'>
                <h1 className='text-3xl font-bold mb-3'>{thread.title}</h1>
                <div
                  className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                    isConnected
                      ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Wifi className='h-3 w-3' />
                      <span>Live updates active</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className='h-3 w-3' />
                      <span>Reconnecting...</span>
                    </>
                  )}
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {thread.tags.map(tag => (
                  <Badge key={tag} variant='outline' className='text-xs'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className='flex flex-col sm:flex-row items-start sm:justify-between  gap-3 sm:gap-6 pt-4 border-t'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage
                    src={thread.createdBy.avatarUrl || '/placeholder.svg'}
                    alt={thread.createdBy.username}
                  />
                  <AvatarFallback>
                    {thread.createdBy.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 text-sm'>
                  <p className='font-semibold'>{thread.createdBy.username}</p>
                  <p className='text-muted-foreground'>
                    Started{' '}
                    {formatDistanceToNow(new Date(thread.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-6 text-sm'>
                <div className='text-xs text-muted-foreground'>
                  Last activity{' '}
                  {formatDistanceToNow(new Date(thread.lastActivityAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {summaryDetails.summary && summaryDetails.summaryGeneratedAt && (
          <CardContent className='space-y-4 pt-0'>
            <div className='flex gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20'>
              <Sparkles
                className='h-5 w-5 text-primary shrink-0 mt-0.5'
                aria-hidden='true'
              />
              <div className='flex-1'>
                <div className='flex justify-between'>
                  <p className='text-sm font-semibold text-primary mb-1 flex items-center gap-2'>
                    AI Summary
                  </p>
                  <p className='text-sm text-primary italic'>
                    Generated {fromNow(summaryDetails.summaryGeneratedAt)}
                  </p>
                </div>
                <p className='text-sm text-foreground'>
                  {summaryDetails.summary}
                </p>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent className='space-y-3 pt-4 flex flex-col sm:flex-row gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='gap-2 bg-transparent cursor-pointer'
            title='Summarize Whole Thread using AI'
            disabled={summarizing}
            onClick={summaryGenerateHandler}
          >
            <Sparkles className='h-4 w-4' />
            {summarizing ? 'Summarizing...' : ' Summarize'}
          </Button>

          <Button
            variant='outline'
            size='sm'
            className='gap-2 bg-transparent cursor-pointer'
            disabled
            title='Coming Soon'
          >
            <Share2 className='h-4 w-4' />
            Share
          </Button>
        </CardContent>
      </Card>
    </article>
  )
}
