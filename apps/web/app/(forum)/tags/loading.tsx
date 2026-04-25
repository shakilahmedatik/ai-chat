export default function TagsLoading() {
  return (
    <div
      className="mx-auto max-w-5xl px-4 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading tags"
    >
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="h-24 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
