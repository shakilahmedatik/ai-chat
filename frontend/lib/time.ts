// lib/time.ts
export function fromNow(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  const diff = (Date.now() - date.getTime()) / 1000
  const abs = Math.abs(diff)

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34524, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ]

  let unit: Intl.RelativeTimeFormatUnit = 'second'
  let value = abs
  for (const [step, u] of units) {
    if (value < step) {
      unit = u
      break
    }
    value /= step
  }
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  return rtf.format(Math.round(diff < 0 ? -value : -value), unit)
}

export function formatDate(
  d: string | Date,
  opts?: Intl.DateTimeFormatOptions
) {
  const date = typeof d === 'string' ? new Date(d) : d
  const fmt = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  })
  return fmt.format(date)
}

export const iso = (d: string | Date) =>
  (typeof d === 'string' ? new Date(d) : d).toISOString()
