'use client'

import { isValidElement } from 'react'
import type { ReactNode } from 'react'
import { AlertCircle, Inbox, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type EmptyStateVariant = 'generic' | 'empty' | 'search' | 'error'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  variant?: EmptyStateVariant
  className?: string
}

const iconByVariant: Record<EmptyStateVariant, typeof AlertCircle> = {
  generic: AlertCircle,
  empty: Inbox,
  search: Search,
  error: AlertCircle,
}

export function EmptyState({
  title,
  description,
  action,
  variant = 'generic',
  className,
}: EmptyStateProps) {
  const Icon = iconByVariant[variant]

  return (
    <section
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live='polite'
      className={cn(
        'flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 text-center',
        'bg-muted/30',
        className
      )}
    >
      <Icon
        aria-hidden='true'
        className={cn(
          'h-12 w-12',
          variant === 'error' ? 'text-destructive' : 'text-muted-foreground'
        )}
      />
      <div className='space-y-2'>
        <h2 className='text-lg font-semibold'>{title}</h2>
        {description ? (
          <p className='text-sm text-muted-foreground'>{description}</p>
        ) : null}
      </div>
      {action ? (
        isValidElement(action) ? (
          <Button asChild data-empty-state-action='true'>
            {action}
          </Button>
        ) : (
          <Button data-empty-state-action='true'>{action}</Button>
        )
      ) : null}
    </section>
  )
}

export function EmptyThreads() {
  return (
    <EmptyState
      variant='empty'
      title='No threads yet'
      description='Press ctrl+n to open Create Thread Dialog'
    />
  )
}

export function EmptyPosts() {
  return (
    <EmptyState
      variant='empty'
      title='No posts in this thread'
      description='Share your thoughts to kick things off.'
      action={<span>Reply to thread</span>}
    />
  )
}

export function EmptySearch({ q }: { q?: string }) {
  const query = q?.trim()

  return (
    <EmptyState
      variant='search'
      title='No results found'
      description={
        query
          ? `We couldn't find any matches for "${query}". Try a different search term.`
          : 'Use the search field to find threads, posts, and tags.'
      }
    />
  )
}
