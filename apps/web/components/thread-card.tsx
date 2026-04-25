import type { Thread } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Dot } from 'lucide-react'
import Link from 'next/link'
import { fromNow } from '@/lib/time'
import { cn } from '@/lib/utils'

interface ThreadCardProps {
  thread: Thread
  hasUnread?: boolean
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

export function ThreadCard({ thread, hasUnread = false }: ThreadCardProps) {
  const author = (thread as any).author || (thread as any).createdBy
  const authorImage = author?.profileImage || author?.avatarUrl || '/placeholder.svg'
  const authorName = author?.fullName || author?.username

  return (
    <Link href={`/thread/${thread._id}`}>
      <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
        <CardHeader>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <h3 className='font-semibold text-lg line-clamp-2 hover:text-primary'>
                  {thread.title}
                </h3>

                {hasUnread && (
                  <div className='shrink-0'>
                    <Dot className='h-6 w-6 fill-primary text-primary' />
                  </div>
                )}
              </div>
              <div className='flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-wrap'>
                <Avatar className='h-6 w-6'>
                  <AvatarImage src={authorImage} />
                  <AvatarFallback>
                    {authorName?.slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>{authorName}</span>
                {author?.role && (
                  <>
                    <span>•</span>
                    <Badge variant='outline' className='text-xs'>
                      {author.role}
                    </Badge>
                  </>
                )}
                <span>•</span>
                <span>{fromNow(thread.createdAt)}</span>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              {(thread as any).status && (
                <Badge
                  className={cn(
                    'text-xs',
                    statusColors[(thread as any).status] ||
                      'bg-slate-100 text-slate-800'
                  )}
                >
                  {(thread as any).status}
                </Badge>
              )}
              {(thread as any).priority && (
                <Badge
                  className={cn(
                    'text-xs',
                    priorityColors[(thread as any).priority] ||
                      'bg-slate-100 text-slate-800'
                  )}
                >
                  {(thread as any).priority}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {(thread as any).batch && (
            <div className='flex items-center gap-2 text-xs'>
              <Badge variant='secondary'>{(thread as any).batch}</Badge>
              {(thread as any).postType && (
                <Badge variant='outline'>{(thread as any).postType}</Badge>
              )}
            </div>
          )}
          {thread.summary && (
            <p className='text-sm text-muted-foreground italic line-clamp-1'>
              Ai Summary: "{thread.summary}"
            </p>
          )}
          <p className='font=light text-sm line-clamp-2 hover:text-primary'>
            {(thread as any).postBody || thread.description}
          </p>
          {(thread as any).imagesOrVideos && (thread as any).imagesOrVideos.length > 0 && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span>{(thread as any).imagesOrVideos.length} attachment(s)</span>
            </div>
          )}
          <div className='flex items-center justify-between'>
            <div className='flex gap-2 flex-wrap'>
              {thread.tags && thread.tags.map((tag: string) => (
                <Badge key={tag} variant='secondary' className='text-xs'>
                  {tag}
                </Badge>
              ))}
            </div>
            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
              <MessageCircle className='h-4 w-4' />
              <span>{(thread as any).commentsCount || (thread as any).postCount || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
