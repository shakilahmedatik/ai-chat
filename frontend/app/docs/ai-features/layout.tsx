// app/docs/layout.tsx
import * as React from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className='pt-20 md:pt-24'>
      <header className='fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b shadow-sm'>
        <div className='container mx-auto flex flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:py-6 lg:px-8'>
          <div>
            <h1 className='text-2xl md:text-3xl font-semibold'>Docs</h1>
            <p className='mt-1 text-sm md:text-base text-muted-foreground'>
              Learn about features, moderation, privacy, and usage guidelines.
            </p>
          </div>
          <Button asChild size='sm' variant='outline' className='gap-2 self-start md:self-auto'>
            <Link href='/'>
              <Home className='h-4 w-4' />
              Home
            </Link>
          </Button>
        </div>
      </header>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 sticky top-20 md:top-24 max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-6rem)] overflow-y-auto pb-10'>
        {children}
      </div>
    </section>
  )
}
