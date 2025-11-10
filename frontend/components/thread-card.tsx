import type { Thread } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Dot } from 'lucide-react'
import Link from 'next/link'
import { fromNow } from '@/lib/time'

interface ThreadCardProps {
  thread: Thread
  hasUnread?: boolean
}

export function ThreadCard({ thread, hasUnread = false }: ThreadCardProps) {
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
              <div className='flex items-center gap-2 mt-2 text-sm text-muted-foreground'>
                <Avatar className='h-6 w-6'>
                  <AvatarImage
                    src={thread?.createdBy?.avatarUrl || '/placeholder.svg'}
                  />
                  <AvatarFallback>
                    {thread.createdBy.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span>{thread?.createdBy?.username}</span>
                <span>•</span>
                <span>{fromNow(thread.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {thread.summary && (
            <p className='text-sm text-muted-foreground italic line-clamp-1'>
              Ai Summary: "{thread.summary}"
            </p>
          )}
          <p className='font=light text-sm line-clamp-2 hover:text-primary'>
            {thread.description}
          </p>
          <div className='flex items-center justify-between'>
            <div className='flex gap-2 flex-wrap'>
              {thread.tags.map(tag => (
                <Badge key={tag} variant='secondary' className='text-xs'>
                  {tag}
                </Badge>
              ))}
            </div>
            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
              <MessageCircle className='h-4 w-4' />
              <span>{thread.postCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
