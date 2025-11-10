import { getPosts, getThread } from '@/lib/api'
import { ThreadDetail } from '@/components/thread-detail'
import { PostList } from '@/components/post-list'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Protected } from '@/components/protected'

interface ThreadPageProps {
  params: Promise<{ id: string }>
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params

  try {
    if (!id) return
    const { thread, posts } = await getThread(id)

    return (
      <Protected>
        <div className='container mx-auto py-6 px-4'>
          <main className='space-y-8'>
            <ThreadDetail thread={thread} posts={posts} />

            <Suspense fallback={<PostListSkeleton />}>
              <PostList threadId={id} flatPosts={posts} />
            </Suspense>
          </main>
        </div>
      </Protected>
    )
  } catch (error) {
    notFound()
  }
}

function PostListSkeleton() {
  return (
    <div
      className='space-y-4'
      role='status'
      aria-live='polite'
      aria-busy='true'
      aria-label='Loading posts'
    >
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className='h-32 bg-muted rounded-lg animate-pulse'
          aria-hidden='true'
        />
      ))}
    </div>
  )
}
