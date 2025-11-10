// 'use client'

// import { useState, useMemo } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { DateRange } from '@/components/filters/date-range'
// import { ModerationTable } from '@/components/moderation-table'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import { Protected } from '@/components/protected'

// interface FlaggedPost {
//   id: string
//   threadId: string
//   threadTitle: string
//   author: {
//     id: string
//     username: string
//     avatarUrl?: string
//   }
//   body: string
//   reason: string
//   createdAt: string
// }

// // Mock data
// const MOCK_FLAGGED_POSTS: FlaggedPost[] = [
//   {
//     id: '1',
//     threadId: 'thread-1',
//     threadTitle: 'How to learn React?',
//     author: { id: 'u1', username: 'spamuser123', avatarUrl: '/avatar1.png' },
//     body: 'BUY CHEAP PRODUCTS NOW!!! Click here for amazing deals and free money!!!',
//     reason: 'Spam',
//     createdAt: '2024-11-05T14:30:00Z',
//   },
//   {
//     id: '2',
//     threadId: 'thread-2',
//     threadTitle: 'Best practices for authentication',
//     author: { id: 'u2', username: 'troll99', avatarUrl: '/avatar2.png' },
//     body: 'This post contains inappropriate and offensive language that violates community guidelines',
//     reason: 'Inappropriate content',
//     createdAt: '2024-11-04T10:15:00Z',
//   },
//   {
//     id: '3',
//     threadId: 'thread-3',
//     threadTitle: 'JavaScript Tips and Tricks',
//     author: { id: 'u3', username: 'phisher', avatarUrl: '/avatar3.png' },
//     body: 'Click this link to verify your account and confirm your credit card details',
//     reason: 'Phishing',
//     createdAt: '2024-11-03T09:45:00Z',
//   },
//   {
//     id: '4',
//     threadId: 'thread-4',
//     threadTitle: 'Database optimization',
//     author: { id: 'u4', username: 'advert_bot', avatarUrl: '/avatar4.png' },
//     body: 'Check out my website for exclusive deals and premium content',
//     reason: 'Spam',
//     createdAt: '2024-11-02T16:20:00Z',
//   },
// ]

// const REASON_FILTERS = [
//   'All',
//   'Spam',
//   'Inappropriate content',
//   'Phishing',
//   'Off-topic',
// ]

// export default function ModerationPage() {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedReason, setSelectedReason] = useState('All')
//   const [dateRange, setDateRange] = useState({
//     from: null as Date | null,
//     to: null as Date | null,
//   })

//   const filteredPosts = useMemo(() => {
//     return MOCK_FLAGGED_POSTS.filter(post => {
//       const matchesSearch =
//         post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         post.author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         post.threadTitle.toLowerCase().includes(searchTerm.toLowerCase())

//       const matchesReason =
//         selectedReason === 'All' || post.reason === selectedReason

//       const postDate = new Date(post.createdAt)
//       const matchesDateRange =
//         (!dateRange.from || postDate >= dateRange.from) &&
//         (!dateRange.to || postDate <= dateRange.to)

//       return matchesSearch && matchesReason && matchesDateRange
//     })
//   }, [searchTerm, selectedReason, dateRange])

//   return (
//     <Protected isAdmin>
//       <div className='space-y-6 py-6 px-4'>
//         {/* Header */}

//         <div>
//           <h1 className='text-3xl font-bold'>Moderation</h1>
//           <p className='text-muted-foreground mt-1'>
//             Review and manage flagged posts
//           </p>
//         </div>

//         {/* Stats */}
//         <Card>
//           <CardHeader>
//             <CardTitle className='text-base'>Flagged Posts</CardTitle>
//             <CardDescription>
//               {filteredPosts.length} posts requiring review
//             </CardDescription>
//           </CardHeader>
//         </Card>

//         {/* Filters */}
//         <Card>
//           <CardHeader>
//             <CardTitle className='text-base'>Filters</CardTitle>
//           </CardHeader>
//           <CardContent className='space-y-4'>
//             <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
//               <div>
//                 <label className='text-sm font-medium mb-2 block'>Search</label>
//                 <Input
//                   placeholder='Search posts, authors, threads...'
//                   value={searchTerm}
//                   onChange={e => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className='text-sm font-medium mb-2 block'>Reason</label>
//                 <Select
//                   value={selectedReason}
//                   onValueChange={setSelectedReason}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {REASON_FILTERS.map(reason => (
//                       <SelectItem key={reason} value={reason}>
//                         {reason}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <label className='text-sm font-medium mb-2 block'>
//                   Date Range
//                 </label>
//                 <DateRange onRangeChange={setDateRange} />
//               </div>
//               <div className='flex items-end'>
//                 <Button
//                   variant='outline'
//                   onClick={() => {
//                     setSearchTerm('')
//                     setSelectedReason('All')
//                     setDateRange({ from: null, to: null })
//                   }}
//                   className='w-full'
//                 >
//                   Reset Filters
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle className='text-base'>Flagged Posts</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ModerationTable posts={filteredPosts} />
//           </CardContent>
//         </Card>
//       </div>
//     </Protected>
//   )
// }

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
