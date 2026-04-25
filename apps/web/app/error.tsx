"use client"

import { useCallback, useEffect, useRef } from "react"

import { EmptyState } from "@/components/empty-state"

interface AppErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: AppErrorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.error(error)
  }, [error])

  const handleReset = useCallback(() => {
    reset()
    requestAnimationFrame(() => {
      const button =
        containerRef.current?.querySelector<HTMLElement>('[data-empty-state-action="true"]')
      button?.focus()
    })
  }, [reset])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" ref={containerRef}>
      <EmptyState
        variant="error"
        title="Something went wrong"
        description="An unexpected error occurred. You can try again."
        action={
          <button type="button" onClick={handleReset}>
            Try again
          </button>
        }
      />
    </div>
  )
}
