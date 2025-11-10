'use client'

import { useEffect, useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { getAdminDashboard, approvePost, removePost } from '@/lib/api'
import { AdminStats, FlaggedPost } from '@/lib/types'

export default function AdminDashboard() {
  const { toast } = useToast()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedPost, setSelectedPost] = useState<FlaggedPost | null>(null)
  const [actionOpen, setActionOpen] = useState(false)
  const [action, setAction] = useState<'approve' | 'remove'>('remove')

  // Load dashboard data
  useEffect(() => {
    ;(async () => {
      try {
        const res = await getAdminDashboard()
        setStats(res.stats)
        setFlaggedPosts(res.flaggedPosts)
      } catch (err: any) {
        toast({
          title: 'Failed to load admin dashboard',
          description: err?.message || 'Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [toast])

  const handlePostAction = async (
    postId: string,
    act: 'approve' | 'remove'
  ) => {
    if (!stats) return
    try {
      if (act === 'approve') {
        await approvePost(postId)
      } else {
        await removePost(postId)
      }

      // Update local flagged posts list
      const updated = flaggedPosts.filter(p => p.id !== postId)
      setFlaggedPosts(updated)

      // Update flagged count in stats
      setStats({
        ...stats,
        flaggedPosts: Math.max(stats.flaggedPosts - 1, 0),
      })

      setActionOpen(false)
      setSelectedPost(null)

      toast({
        title: 'Success',
        description:
          act === 'approve'
            ? 'Post approved and unflagged.'
            : 'Post removed and hidden from users.',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description:
          err?.message ||
          `Failed to ${act === 'approve' ? 'approve' : 'remove'} post`,
        variant: 'destructive',
      })
    }
  }

  const effectiveStats: AdminStats = stats || {
    totalThreads: 0,
    totalPosts: 0,
    flaggedPosts: 0,
    activeUsers: 0,
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
            { label: 'Total Threads', value: effectiveStats.totalThreads },
            { label: 'Total Posts', value: effectiveStats.totalPosts },
            {
              label: 'Flagged Posts',
              value: effectiveStats.flaggedPosts,
            },
            { label: 'Active Users (30d)', value: effectiveStats.activeUsers },
          ].map(stat => (
            <Card key={stat.label}>
              <CardHeader className='pb-2'>
                <CardDescription className='text-xs font-medium'>
                  {stat.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold'>
                  {loading ? '—' : stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Moderation Tabs */}
        <Tabs defaultValue='flagged' className='space-y-4'>
          <TabsList>
            <TabsTrigger className='cursor-pointer' value='flagged'>
              Flagged Posts ({effectiveStats.flaggedPosts})
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
            {loading ? (
              <Alert>
                <AlertDescription>Loading flagged posts...</AlertDescription>
              </Alert>
            ) : flaggedPosts.length === 0 ? (
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
                        Flagged: {new Date(post.createdAt).toLocaleString()}
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
                  : 'This post will be removed and hidden from users.'}
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
                    void handlePostAction(selectedPost.id, action)
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
