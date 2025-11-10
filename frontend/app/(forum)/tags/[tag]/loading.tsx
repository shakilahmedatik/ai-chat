import { Skeleton } from "@/components/ui/skeleton"

export default function TagLoading() {
  return (
    <div
      className="mx-auto max-w-5xl px-4 py-10 space-y-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading tag posts"
    >
      <Skeleton className="h-7 w-64" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}
