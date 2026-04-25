import { ThreadCardSkeleton } from "@/components/skeletons"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading forum content"
        className="flex w-full max-w-2xl flex-col gap-4 px-4"
      >
        <ThreadCardSkeleton />
        <ThreadCardSkeleton />
        <ThreadCardSkeleton />
      </div>
    </div>
  )
}
