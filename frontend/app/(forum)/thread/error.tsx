'use client'

import { useCallback, useRef } from 'react'

import { EmptyState } from '@/components/empty-state'

interface ThreadErrorProps {
  reset: () => void
}

export default function ThreadError({ reset }: ThreadErrorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleReset = useCallback(() => {
    reset()
    requestAnimationFrame(() => {
      const button = containerRef.current?.querySelector<HTMLElement>(
        '[data-empty-state-action="true"]'
      )
      button?.focus()
    })
  }, [reset])

  return (
    <div className='mx-auto max-w-3xl px-4 py-12' ref={containerRef}>
      <EmptyState
        variant='error'
        title="Can't load this thread"
        description='Please check your connection or try again.'
        action={
          <button type='button' onClick={handleReset}>
            Reload
          </button>
        }
      />
    </div>
  )
}
