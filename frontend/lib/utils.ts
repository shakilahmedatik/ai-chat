import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDate as fmt } from '@/lib/time'
export const formatDate = fmt

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export function formatDate(date: string | Date) {
//   const d = new Date(date)
//   return d.toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
//   })
// }

export function formatTime(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}
