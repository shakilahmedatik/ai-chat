'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { TagSparkline } from '@/components/tag-sparkline'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function TagsPage() {
  const [tags] = useState([
    { name: 'ai', count: 45, trend: 'up' },
    { name: 'javascript', count: 38, trend: 'stable' },
    { name: 'react', count: 32, trend: 'up' },
    { name: 'typescript', count: 28, trend: 'down' },
    { name: 'web-development', count: 25, trend: 'up' },
    { name: 'machine-learning', count: 19, trend: 'stable' },
    { name: 'careers', count: 16, trend: 'down' },
    { name: 'ask-for-help', count: 14, trend: 'up' },
  ])

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Tags</h1>
        <p className='text-muted-foreground mt-2'>
          Browse discussion categories and track activity
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {tags.map(tag => (
          <Link key={tag.name} href={`/tags/${tag.name}`}>
            <Card className='p-4 hover:shadow-md transition-all cursor-pointer h-full hover:border-primary/50'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <Badge variant='secondary' className='text-sm'>
                    #{tag.name}
                  </Badge>
                  <div className='flex items-center gap-1'>
                    {tag.trend === 'up' && (
                      <TrendingUp className='h-4 w-4 text-emerald-500' />
                    )}
                    {tag.trend === 'down' && (
                      <TrendingDown className='h-4 w-4 text-red-500' />
                    )}
                  </div>
                </div>

                {/* Sparkline */}
                <div className='py-2'>
                  {/* <TagSparkline tag={tag.name} /> */}
                </div>

                {/* Stats and CTA */}
                <div className='flex items-center justify-between pt-2 border-t border-border/40'>
                  <div>
                    <p className='text-lg font-semibold'>{tag.count}</p>
                    <p className='text-xs text-muted-foreground'>threads</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='hover:bg-primary/10'
                  >
                    View →
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
