'use client'

import { use } from 'react'
import { ThreadList } from '@/components/thread-list'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

interface TagDetailPageProps {
  params: Promise<{ tag: string }>
}

export default function TagDetailPage({ params }: TagDetailPageProps) {
  const { tag } = use(params)
  const decodedTag = decodeURIComponent(tag)

  const tagStats: Record<string, { count: number; description: string }> = {
    ai: {
      count: 45,
      description: 'Artificial Intelligence and machine learning discussions',
    },
    javascript: {
      count: 38,
      description: 'JavaScript language and ecosystem topics',
    },
    react: {
      count: 32,
      description: 'React framework and component development',
    },
    typescript: { count: 28, description: 'TypeScript and type safety' },
    'web-development': {
      count: 25,
      description: 'General web development practices',
    },
    'machine-learning': { count: 19, description: 'ML algorithms and models' },
    careers: { count: 16, description: 'Career advice and opportunities' },
    'ask-for-help': {
      count: 14,
      description: 'Questions and support requests',
    },
  }

  const currentTag = tagStats[decodedTag] || {
    count: 0,
    description: `Discussions tagged with ${decodedTag}`,
  }

  const relatedTags = [
    'javascript',
    'typescript',
    'web-development',
    'react',
  ].filter(t => t !== decodedTag)

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      {/* Main Content */}
      <div className='lg:col-span-3 space-y-6'>
        <div>
          <div className='flex items-center gap-3 mb-2'>
            <Badge variant='default' className='text-base px-3 py-1'>
              #{decodedTag}
            </Badge>
          </div>
          <h1 className='text-3xl font-bold capitalize'>{decodedTag}</h1>
          <p className='text-muted-foreground mt-2'>{currentTag.description}</p>
        </div>

        <Separator />

        {/* Thread list filtered by tag */}
        <ThreadList tag={tag} />
      </div>

      {/* Sticky Sidebar - Desktop only */}
      <aside className='hidden lg:block'>
        <Card className='sticky top-24 p-4 space-y-4'>
          <div>
            <h3 className='font-semibold mb-2'>Tag Info</h3>
            <p className='text-sm text-muted-foreground'>
              {currentTag.count} discussions in this category
            </p>
          </div>

          <Separator />

          <div className='space-y-2'>
            <h3 className='font-semibold text-sm mb-3'>Related Tags</h3>
            <div className='flex flex-wrap gap-2'>
              {relatedTags.map(t => (
                <Link key={t} href={`/tags/${t}`}>
                  <Badge
                    variant='outline'
                    className='cursor-pointer hover:bg-primary/10 transition-colors'
                  >
                    #{t}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          <div className='space-y-3 text-sm'>
            <p className='text-muted-foreground'>
              Use tags to organize and discover threads on specific topics.
            </p>
            <Link href='/tags' className='block'>
              <Button
                variant='outline'
                size='sm'
                className='w-full bg-transparent'
              >
                Browse all tags
              </Button>
            </Link>
          </div>
        </Card>
      </aside>
    </div>
  )
}
