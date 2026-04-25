"use client"

import { EmptyState } from "@/components/empty-state"

export default function ModerationError() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <EmptyState
        variant="error"
        title="Moderation queue unavailable"
        description="We couldn't load flagged posts. Try again later."
      />
    </div>
  )
}
