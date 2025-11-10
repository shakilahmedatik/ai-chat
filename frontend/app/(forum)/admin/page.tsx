'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, X, Zap } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Protected } from '@/components/protected'

interface FlaggedPost {
  id: string
  author: { username: string; id: string }
  body: string
  reason: string
  createdAt: string
  flaggedAt: string
}

interface AdminStats {
  totalThreads: number
  totalPosts: number
  flaggedPosts: number
  activeUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalThreads: 1240,
    totalPosts: 8932,
    flaggedPosts: 23,
    activeUsers: 456,
  })

  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([
    {
      id: '1',
      author: { username: 'user123', id: 'u1' },
      body: 'This is a flagged post content...',
      reason: 'Spam',
      createdAt: '2024-11-01T10:00:00Z',
      flaggedAt: '2024-11-05T14:30:00Z',
    },
    {
      id: '2',
      author: { username: 'spamuser', id: 'u2' },
      body: 'Another flagged post with inappropriate content...',
      reason: 'Inappropriate content',
      createdAt: '2024-11-02T15:45:00Z',
      flaggedAt: '2024-11-05T11:20:00Z',
    },
  ])

  const [selectedPost, setSelectedPost] = useState<FlaggedPost | null>(null)
  const [actionOpen, setActionOpen] = useState(false)
  const [action, setAction] = useState<'approve' | 'remove'>('remove')

  const handlePostAction = async (
    postId: string,
    act: 'approve' | 'remove'
  ) => {
    // In a real app, this would call the API
    setFlaggedPosts(prev => prev.filter(p => p.id !== postId))
    setActionOpen(false)
    setSelectedPost(null)
  }

  return (
    <Protected isAdmin>
      <div className='container mx-auto py-6 px-4 space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
          <p className='text-muted-foreground mt-2'>
            Manage forum moderation and statistics
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[
            { label: 'Total Threads', value: stats.totalThreads },
            { label: 'Total Posts', value: stats.totalPosts },
            {
              label: 'Flagged Posts',
              value: stats.flaggedPosts,
              variant: 'warning',
            },
            { label: 'Active Users', value: stats.activeUsers },
          ].map(stat => (
            <Card key={stat.label}>
              <CardHeader className='pb-2'>
                <CardDescription className='text-xs font-medium'>
                  {stat.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold'>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Moderation Tabs */}
        <Tabs defaultValue='flagged' className='space-y-4'>
          <TabsList>
            <TabsTrigger className='cursor-pointer' value='flagged'>
              Flagged Posts ({stats.flaggedPosts})
            </TabsTrigger>
            <TabsTrigger className='cursor-pointer' value='users'>
              Users
            </TabsTrigger>
            <TabsTrigger className='cursor-pointer' value='activity'>
              Activity Log
            </TabsTrigger>
          </TabsList>

          {/* Flagged Posts Tab */}
          <TabsContent value='flagged' className='space-y-4'>
            {flaggedPosts.length === 0 ? (
              <Alert>
                <Zap className='h-4 w-4' />
                <AlertDescription>
                  All posts approved! No flagged content to review.
                </AlertDescription>
              </Alert>
            ) : (
              flaggedPosts.map(post => (
                <Card
                  key={post.id}
                  className='border-destructive/50 bg-destructive/5 dark:bg-destructive/10'
                >
                  <CardHeader>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <p className='font-semibold'>
                            {post.author.username}
                          </p>
                          <Badge variant='destructive' className='text-xs'>
                            {post.reason}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground line-clamp-2'>
                          {post.body}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='text-xs text-muted-foreground'>
                      <p>
                        Flagged: {new Date(post.flaggedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className='flex gap-2 flex-wrap'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='gap-2 bg-transparent cursor-pointer'
                        onClick={() => {
                          setSelectedPost(post)
                          setAction('approve')
                          setActionOpen(true)
                        }}
                      >
                        <Check className='h-4 w-4' />
                        Approve
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        className='gap-2 cursor-pointer'
                        onClick={() => {
                          setSelectedPost(post)
                          setAction('remove')
                          setActionOpen(true)
                        }}
                      >
                        <X className='h-4 w-4' />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value='users'>
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-muted-foreground'>
                  User management coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value='activity'>
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-muted-foreground'>
                  Activity log coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Confirmation Dialog */}
        <AlertDialog open={actionOpen} onOpenChange={setActionOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {action === 'approve' ? 'Approve Post?' : 'Remove Post?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {action === 'approve'
                  ? 'This post will be restored and visible to all users.'
                  : 'This post will be removed and hidden from users. The author will be notified.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className='space-y-2 p-4 bg-muted rounded'>
              <p className='text-sm font-semibold'>Post Preview:</p>
              <p className='text-sm text-muted-foreground line-clamp-3'>
                {selectedPost?.body}
              </p>
            </div>
            <div className='flex gap-2 justify-end'>
              <AlertDialogCancel className='cursor-pointer'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedPost) {
                    handlePostAction(selectedPost.id, action)
                  }
                }}
                className={
                  action === 'remove'
                    ? 'bg-destructive cursor-pointer text-destructive-foreground hover:bg-destructive/90'
                    : 'cursor-pointer'
                }
              >
                {action === 'approve' ? 'Approve' : 'Remove'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Protected>
  )
}
