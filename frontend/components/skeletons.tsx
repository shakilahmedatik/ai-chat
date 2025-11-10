import { Skeleton } from "@/components/ui/skeleton"

export function ThreadCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

export function PostSkeleton() {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
