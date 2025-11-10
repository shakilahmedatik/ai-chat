'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRange } from '@/components/filters/date-range'
import { ModerationTable } from '@/components/moderation-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Protected } from '@/components/protected'
import { useToast } from '@/hooks/use-toast'
import { getFlaggedPosts, approvePost, removePost } from '@/lib/api'

interface FlaggedPost {
  id: string
  threadId: string
  threadTitle: string
  author: {
    id: string
    username: string
    avatarUrl?: string
  }
  body: string
  reason: string
  createdAt: string
}

const REASON_FILTERS = [
  'All',
  'Spam',
  'Inappropriate content',
  'Phishing',
  'Off-topic',
  'AI flagged',
  'Flagged',
]

type ReasonFilter = (typeof REASON_FILTERS)[number]

export default function ModerationPage() {
  const { toast } = useToast()
  const [posts, setPosts] = useState<FlaggedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReason, setSelectedReason] = useState<ReasonFilter>('All')
  const [dateRange, setDateRange] = useState<{
    from: Date | null
    to: Date | null
  }>({ from: null, to: null })

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getFlaggedPosts()
        console.log(res.items)
        setPosts(res.items)
      } catch (err: any) {
        toast({
          title: 'Failed to load flagged posts',
          description: err?.message || 'Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [toast])

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const haystack =
        `${post.body} ${post.author.username} ${post.threadTitle}`.toLowerCase()
      const matchesSearch = haystack.includes(searchTerm.toLowerCase())

      const matchesReason =
        selectedReason === 'All' ||
        post.reason.toLowerCase().includes(selectedReason.toLowerCase())

      const postDate = new Date(post.createdAt)
      const matchesDateRange =
        (!dateRange.from || postDate >= dateRange.from) &&
        (!dateRange.to || postDate <= dateRange.to)

      return matchesSearch && matchesReason && matchesDateRange
    })
  }, [posts, searchTerm, selectedReason, dateRange])

  const handleApprove = async (id: string) => {
    try {
      await approvePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
      toast({ title: 'Post approved', description: 'Flag removed.' })
    } catch (err: any) {
      toast({
        title: 'Failed to approve post',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
      toast({
        title: 'Post removed',
        description: 'The post is no longer visible in the forum.',
      })
    } catch (err: any) {
      toast({
        title: 'Failed to remove post',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Protected isAdmin>
      <div className='space-y-6 py-6 px-4'>
        <div>
          <h1 className='text-3xl font-bold'>Moderation</h1>
          <p className='text-muted-foreground mt-1'>
            Review and manage flagged posts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Flagged Posts</CardTitle>
            <CardDescription>
              {loading
                ? 'Loading...'
                : `${filteredPosts.length} posts requiring review`}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Filters</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='text-sm font-medium mb-2 block'>Search</label>
                <Input
                  placeholder='Search posts, authors, threads...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block'>Reason</label>
                <Select
                  value={selectedReason}
                  onValueChange={v => setSelectedReason(v as ReasonFilter)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REASON_FILTERS.map(reason => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Date Range
                </label>
                <DateRange onRangeChange={setDateRange} />
              </div>
              <div className='flex items-end'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedReason('All')
                    setDateRange({ from: null, to: null })
                  }}
                  className='w-full'
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Flagged Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <ModerationTable
              loading={loading}
              posts={filteredPosts}
              onApprove={handleApprove}
              onRemove={handleRemove}
            />
          </CardContent>
        </Card>
      </div>
    </Protected>
  )
}
