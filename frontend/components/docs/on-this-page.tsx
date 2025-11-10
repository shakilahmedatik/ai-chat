'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function OnThisPage({
  items,
  className,
}: {
  items: { href: string; label: string }[]
  className?: string
}) {
  // highlight active section
  const [active, setActive] = React.useState<string>(items?.[0]?.href)

  React.useEffect(() => {
    const observers: IntersectionObserver[] = []
    items.forEach(item => {
      const el = document.querySelector(item.href)
      if (!el) return
      const io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) setActive(item.href)
          })
        },
        { rootMargin: '0px 0px -70% 0px' } // trigger a bit before the heading
      )
      io.observe(el)
      observers.push(io)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [items])

  return (
    <nav
      className={cn(
        'sticky top-0 max-h-full overflow-auto rounded-xl border bg-card p-4 text-sm',
        className
      )}
      aria-label='On this page'
    >
      <div className='mb-2 font-medium'>On this page</div>
      <ul className='space-y-1'>
        {items.map(it => (
          <li key={it.href}>
            <a
              href={it.href}
              className={cn(
                'block rounded px-2 py-1 hover:bg-muted',
                active === it.href
                  ? 'bg-muted font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
