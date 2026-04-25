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
import Image from 'next/image'
import { cn } from '@/lib/utils'

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

const statusColors: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'In Progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

const priorityColors: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  Medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Critical: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
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

  const author = (thread as any).author || (thread as any).createdBy
  const authorImage = author?.profileImage || author?.avatarUrl || '/placeholder.svg'
  const authorName = author?.fullName || author?.username
  const postBody = (thread as any).postBody || thread.description
  const status = (thread as any).status
  const priority = (thread as any).priority
  const batch = (thread as any).batch
  const postType = (thread as any).postType
  const images = (thread as any).imagesOrVideos || []

  console.log(thread)
  return (
    <article className='space-y-6'>
      <Card className='border-2'>
        <CardHeader>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'>
                  <h1 className='text-3xl font-bold'>{thread.title}</h1>
                </div>
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
                      <span>Live updates</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className='h-3 w-3' />
                      <span>Reconnecting...</span>
                    </>
                  )}
                </div>
              </div>

              <div className='flex flex-wrap gap-2 mb-3'>
                {batch && <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900'>{batch}</Badge>}
                {postType && <Badge variant='outline'>{postType}</Badge>}
                {status && (
                  <Badge className={cn('text-xs', statusColors[status])}>
                    {status}
                  </Badge>
                )}
                {priority && (
                  <Badge className={cn('text-xs', priorityColors[priority])}>
                    {priority}
                  </Badge>
                )}
                {thread.tags && thread.tags.map((tag: string) => (
                  <Badge key={tag} variant='outline' className='text-xs'>
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className='text-sm text-muted-foreground mb-3'>
                {postBody && <p className='line-clamp-3'>{postBody}</p>}
              </div>
            </div>

            <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-6 pt-4 border-t'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src={authorImage} alt={authorName} />
                  <AvatarFallback>
                    {authorName?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 text-sm'>
                  <div className='flex items-center gap-2'>
                    <p className='font-semibold'>{authorName}</p>
                    {author?.role && (
                      <Badge variant='secondary' className='text-xs'>
                        {author.role}
                      </Badge>
                    )}
                  </div>
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

        {images && images.length > 0 && (
          <CardContent className='pt-0 pb-4'>
            <div className='space-y-2'>
              <p className='text-sm font-semibold text-muted-foreground'>Attachments</p>
              <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
                {images.map((img: any, idx: number) => (
                  <div
                    key={idx}
                    className='relative aspect-square rounded-lg overflow-hidden bg-muted'
                  >
                    {img.src.startsWith('data:') ? (
                      <img
                        src={img.src}
                        alt={`Attachment ${idx + 1}`}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <Image
                        src={img.src}
                        alt={`Attachment ${idx + 1}`}
                        fill
                        className='object-cover'
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}

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
