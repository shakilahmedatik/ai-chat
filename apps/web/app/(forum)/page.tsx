import { ThreadList } from '@/components/thread-list'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Helpdesk Forum</h1>
          <p className='text-muted-foreground mt-2'>
            Get support, share issues, and find solutions for your batch
          </p>
        </div>

        <Suspense fallback={<ThreadListSkeleton />}>
          <ThreadList />
        </Suspense>
      </div>
    </div>
  )
}

function ThreadListSkeleton() {
  return (
    <div
      className='space-y-6'
      role='status'
      aria-live='polite'
      aria-busy='true'
      aria-label='Loading threads'
    >
      <div className='space-y-4'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>
      <div className='space-y-4'>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className='h-32 rounded-lg' />
        ))}
      </div>
    </div>
  )
}
