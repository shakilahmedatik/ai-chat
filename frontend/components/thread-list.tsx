'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getThreads } from '@/lib/api'
import type { Thread } from '@/lib/types'
import { ThreadCard } from '@/components/thread-card'
import { TagFilter } from '@/components/tag-filter'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { EmptySearch, EmptyThreads } from '@/components/empty-state'
import { useSearchParams } from 'next/navigation'
type SortOption = 'recent' | 'active'
interface ThreadListProps {
  tag?: string
}

export function ThreadList({ tag }: ThreadListProps) {
  const params = useSearchParams()
  const searchParams = params.get('search') || '' // Get the value of 'myParam'

  const [threads, setThreads] = useState<Thread[]>([])
  const [allThreads, setAllThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sort, setSort] = useState<SortOption>('recent')

  const debouncedSearch = useDebounce(search, 300)
  const hasSearch = debouncedSearch.trim().length > 0

  // Get available tags from all threads
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    allThreads.forEach(thread => {
      thread.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [allThreads])

  // Load all threads on mount
  useEffect(() => {
    async function loadThreads() {
      try {
        setLoading(true)
        const data = await getThreads({ tag, search: searchParams })
        setAllThreads(data.threads)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load threads')
      } finally {
        setLoading(false)
      }
    }

    loadThreads()
  }, [searchParams])

  useEffect(() => {
    let filtered = allThreads

    // Filter by search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        thread =>
          thread.title.toLowerCase().includes(query) ||
          thread.createdBy.username.toLowerCase().includes(query)
      )
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(thread =>
        selectedTags.some(tag => thread.tags.includes(tag))
      )
    }

    // Sort threads
    if (sort === 'active') {
      filtered.sort(
        (a, b) =>
          new Date(b.lastActivityAt).getTime() -
          new Date(a.lastActivityAt).getTime()
      )
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    setThreads(filtered)
  }, [allThreads, debouncedSearch, selectedTags, sort])

  const getHasUnread = useCallback((threadId: string) => {
    return Math.random() > 0.7
  }, [])

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
      <div className='space-y-4'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end'>
          <div className='flex-1'>
            <label className='text-sm font-medium mb-2 block'>Search</label>
            <Input
              placeholder='Search threads or authors...'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className='w-full md:w-40'>
            <label className='text-sm font-medium mb-2 block'>Sort by</label>
            <Select
              value={sort}
              onValueChange={value => setSort(value as SortOption)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='recent'>Most Recent</SelectItem>
                <SelectItem value='active'>Most Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className='text-sm font-medium mb-2 block'>
            Filter by tags
          </label>
          <TagFilter
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            availableTags={availableTags}
          />
        </div>
      </div>

      {loading && (
        <div
          className='space-y-4'
          role='status'
          aria-live='polite'
          aria-busy='true'
          aria-label='Loading threads'
        >
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className='h-32 rounded-lg' />
          ))}
        </div>
      )}

      {!loading && hasSearch && threads.length === 0 && (
        <EmptySearch q={debouncedSearch.trim()} />
      )}

      {!loading &&
        !hasSearch &&
        threads.length === 0 &&
        allThreads.length === 0 && <EmptyThreads />}

      {!loading &&
        !hasSearch &&
        threads.length === 0 &&
        allThreads.length > 0 && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground mb-4'>
              No threads match your filters.
            </p>
            <Button
              variant='outline'
              onClick={() => {
                setSearch('')
                setSelectedTags([])
              }}
            >
              Reset filters
            </Button>
          </div>
        )}

      {!loading && threads.length > 0 && (
        <>
          {threads.map(thread => (
            <div key={thread._id} className='space-y-4'>
              <ThreadCard
                thread={thread}
                hasUnread={getHasUnread(thread._id)}
              />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
