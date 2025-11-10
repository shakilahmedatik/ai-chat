import { Skeleton } from '@/components/ui/skeleton'
import { PostSkeleton } from '@/components/skeletons'

export default function ThreadLoading() {
  return (
    <div
      className='mx-auto max-w-3xl px-4 py-8 space-y-6'
      role='status'
      aria-live='polite'
      aria-busy='true'
      aria-label='Loading thread'
    >
      <div className='space-y-3'>
        <Skeleton className='h-8 w-2/3' />
        <Skeleton className='h-4 w-1/3' />
      </div>
      <div className='space-y-6'>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  )
}
