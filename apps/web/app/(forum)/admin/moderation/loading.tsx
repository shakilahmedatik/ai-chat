export default function ModerationLoading() {
  return (
    <div
      className='mx-auto max-w-6xl px-4 py-10 space-y-3'
      role='status'
      aria-live='polite'
      aria-busy='true'
      aria-label='Loading moderation queue'
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className='h-16 rounded-md bg-muted animate-pulse' />
      ))}
    </div>
  )
}
