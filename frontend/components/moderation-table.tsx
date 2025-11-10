'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Check, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/time'

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

interface ModerationTableProps {
  posts: FlaggedPost[]
  loading?: boolean
  onApprove: (id: string) => Promise<void> | void
  onRemove: (id: string) => Promise<void> | void
  onRefresh?: () => void // optional if you later want to refetch from parent
}

type Action = 'approve' | 'remove' | null

type DialogState = {
  isOpen: boolean
  postId: string | null
  action: Action
}

export function ModerationTable({
  posts,
  loading,
  onApprove,
  onRemove,
  onRefresh,
}: ModerationTableProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    postId: null,
    action: null,
  })
  const [bulkLoading, setBulkLoading] = useState(false)

  // Keep selection consistent if rows change
  const cleanSelected = useCallback(
    (ids: Set<string>) => {
      const valid = new Set<string>()
      for (const id of ids) {
        if (posts.some(p => p.id === id)) valid.add(id)
      }
      return valid
    },
    [posts]
  )

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return cleanSelected(next)
    })
  }

  const handleSelectAll = () => {
    setSelectedRows(prev => {
      if (prev.size === posts.length) {
        return new Set()
      }
      return new Set(posts.map(p => p.id))
    })
  }

  const runAction = useCallback(
    async (postId: string, action: 'approve' | 'remove') => {
      try {
        if (action === 'approve') {
          await onApprove(postId)
        } else {
          await onRemove(postId)
        }

        setDialogState({ isOpen: false, postId: null, action: null })
        setSelectedRows(prev => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })

        toast({
          title: 'Success',
          description:
            action === 'approve'
              ? 'Post approved and unflagged.'
              : 'Post removed and hidden from users.',
        })

        onRefresh?.()
      } catch (error: any) {
        toast({
          title: 'Error',
          description:
            error?.message ||
            `Failed to ${action === 'approve' ? 'approve' : 'remove'} post`,
          variant: 'destructive',
        })
      }
    },
    [onApprove, onRemove, onRefresh, toast]
  )

  const handleBulkAction = useCallback(
    async (action: 'approve' | 'remove') => {
      if (selectedRows.size === 0) return
      setBulkLoading(true)
      try {
        const ids = Array.from(selectedRows)

        // Simple sequential execution; good enough for this scale.
        for (const id of ids) {
          if (action === 'approve') {
            await onApprove(id)
          } else {
            await onRemove(id)
          }
        }

        setSelectedRows(new Set())

        toast({
          title: 'Success',
          description: `${ids.length} posts ${
            action === 'approve' ? 'approved' : 'removed'
          }.`,
        })

        onRefresh?.()
      } catch (error: any) {
        toast({
          title: 'Error',
          description:
            error?.message || 'Bulk action failed. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setBulkLoading(false)
      }
    },
    [selectedRows, onApprove, onRemove, onRefresh, toast]
  )

  // Empty state
  if (!loading && posts.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground mb-4'>
          No flagged posts to review.
        </p>
        <Button onClick={() => router.push('/admin')} variant='outline'>
          Back to Admin
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Bulk actions banner */}
      {selectedRows.size > 0 && (
        <div className='bg-muted/50 border rounded-lg p-4 mb-4 flex items-center justify-between'>
          <p className='text-sm font-medium'>{selectedRows.size} selected</p>
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => handleBulkAction('approve')}
              className='gap-2'
              disabled={bulkLoading}
            >
              <Check className='h-4 w-4' />
              Approve All
            </Button>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => handleBulkAction('remove')}
              className='gap-2'
              disabled={bulkLoading}
            >
              <Trash2 className='h-4 w-4' />
              Remove All
            </Button>
          </div>
        </div>
      )}

      <div className='border rounded-lg overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-12'>
                <Checkbox
                  checked={
                    posts.length > 0 && selectedRows.size === posts.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label='Select all posts'
                />
              </TableHead>
              <TableHead>Post Excerpt</TableHead>
              <TableHead>Thread</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Reason/Source</TableHead>
              <TableHead>Flagged At</TableHead>
              <TableHead className='w-12 text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='py-10 text-center text-muted-foreground text-sm'
                >
                  Loading flagged posts...
                </TableCell>
              </TableRow>
            ) : (
              posts.map(post => (
                <TableRow
                  key={post.id}
                  data-state={
                    selectedRows.has(post.id) ? 'selected' : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(post.id)}
                      onCheckedChange={() => handleSelectRow(post.id)}
                      aria-label={`Select post ${post.id}`}
                    />
                  </TableCell>
                  <TableCell className='max-w-xs'>
                    <p className='text-sm line-clamp-2 text-muted-foreground'>
                      {post.body}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='link'
                      size='sm'
                      onClick={() => router.push(`/thread/${post.threadId}`)}
                      className='p-0 h-auto'
                    >
                      {post.threadTitle}
                    </Button>
                  </TableCell>
                  <TableCell className='text-sm'>
                    {post.author.username}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        /spam/i.test(post.reason) ? 'destructive' : 'secondary'
                      }
                    >
                      {post.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {formatDate(post.createdAt)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                        >
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() =>
                            setDialogState({
                              isOpen: true,
                              postId: post.id,
                              action: 'approve',
                            })
                          }
                        >
                          <Check className='h-4 w-4 mr-2' />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            setDialogState({
                              isOpen: true,
                              postId: post.id,
                              action: 'remove',
                            })
                          }
                          className='text-destructive focus:text-destructive'
                        >
                          <Trash2 className='h-4 w-4 mr-2' />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirm dialog */}
      <AlertDialog
        open={dialogState.isOpen}
        onOpenChange={open =>
          setDialogState(prev => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogState.action === 'approve'
                ? 'Approve Post?'
                : 'Remove Post?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.action === 'approve'
                ? 'This post will be restored and visible to all users.'
                : 'This post will be removed and hidden from users.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-2 p-4 bg-muted rounded'>
            <p className='text-sm font-semibold'>Post Preview:</p>
            <p className='text-sm text-muted-foreground line-clamp-3'>
              {posts.find(p => p.id === dialogState.postId)?.body}
            </p>
          </div>
          <div className='flex gap-2 justify-end'>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialogState.postId && dialogState.action) {
                  void runAction(dialogState.postId, dialogState.action)
                }
              }}
              className={
                dialogState.action === 'remove'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {dialogState.action === 'approve' ? 'Approve' : 'Remove'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
