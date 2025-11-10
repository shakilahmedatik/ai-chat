'use client'

import { useEffect, useState } from 'react'
import { getThreads } from '@/lib/api'
import type { Thread } from '@/lib/types'
import { ThreadCard } from '@/components/thread-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { notFound } from 'next/navigation'
import { Protected } from '@/components/protected'

export default function MyThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    async function loadThreads() {
      if (!user) return notFound()
      try {
        // In a real app, this would filter by current user
        const { threads } = await getThreads({ authorId: user.id })
        console.log(threads)
        setThreads(threads)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load threads')
      } finally {
        setLoading(false)
      }
    }

    loadThreads()
  }, [user])

  if (error) {
    return (
      <div className='container mx-auto py-6 px-4'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Protected>
      <div className='container mx-auto py-6 px-4'>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold'>My Threads</h1>
            <p className='text-muted-foreground mt-2'>Threads you've started</p>
          </div>

          {threads.length === 0 && !loading ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>
                You haven't created any threads yet.
              </p>
            </div>
          ) : (
            <>
              {threads.map(thread => (
                <div key={thread._id} className='space-y-4'>
                  <ThreadCard thread={thread} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </Protected>
  )
}
