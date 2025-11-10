'use client'

import type { ComponentType } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FileText,
  Tag,
  Settings,
  Menu,
  ShieldCheck,
  Webhook,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { useAuth } from '@/hooks/use-auth'

// Mock trending tags data
const trendingTags = [
  { name: 'react', count: 342 },
  { name: 'javascript', count: 298 },
  { name: 'typescript', count: 256 },
  { name: 'nextjs', count: 189 },
  { name: 'ai', count: 167 },
]

interface NavItem {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'My Threads', href: '/my-threads', icon: FileText },
  { label: 'Tags', href: '/tags', icon: Tag },
]
const adminNavItems: NavItem[] = [
  {
    label: 'Admin',
    href: '/admin',
    icon: Settings,
  },
  {
    label: 'Moderation',
    href: '/admin/moderation',
    icon: ShieldCheck,
  },
  {
    label: 'Webhooks',
    href: '/admin/webhooks',
    icon: Webhook,
  },
]

function SidebarContent() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className='flex h-full flex-col bg-sidebar text-sidebar-foreground'>
      {/* Navigation */}
      <div className='flex-1 overflow-hidden flex flex-col'>
        <div className='space-y-2 p-4'>
          <h2 className='px-2 py-1.5 text-sm font-semibold'>Menu</h2>

          {navItems.map(item => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <div key={item.href} className='space-y-1'>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className='w-full justify-start gap-2'
                  asChild
                >
                  <Link href={item.href} className='flex items-center gap-2'>
                    <Icon className='h-4 w-4' />
                    {item.label}
                  </Link>
                </Button>
              </div>
            )
          })}
          {user?.roles?.includes('admin') && (
            <h2 className='px-2 py-1.5 text-sm font-semibold'>Admin Menu</h2>
          )}
          {user?.roles?.includes('admin') &&
            adminNavItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <div key={item.href} className='space-y-1'>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className='w-full justify-start gap-2'
                    asChild
                  >
                    <Link href={item.href} className='flex items-center gap-2'>
                      <Icon className='h-4 w-4' />
                      {item.label}
                    </Link>
                  </Button>
                </div>
              )
            })}
        </div>

        <Separator className='bg-sidebar-border' />

        {/* Trending Tags */}
        <div className='flex-1 overflow-hidden p-4 flex flex-col'>
          <h2 className='px-2 py-1.5 text-sm font-semibold'>Trending Tags</h2>
          <ScrollArea className='flex-1 mt-2'>
            <div className='space-y-2'>
              {trendingTags.map(tag => (
                <Link key={tag.name} href={`/tags/${tag.name}`}>
                  <Button
                    variant='ghost'
                    className='w-full justify-between'
                    size='sm'
                  >
                    <span className='text-sm'>{tag.name}</span>
                    <Badge variant='secondary' className='text-xs'>
                      {tag.count}
                    </Badge>
                  </Button>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export function SiteSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className='md:hidden flex  gap-2 px-4 py-2 border-b bg-background'>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon'>
              <Menu className='h-5 w-5' />
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-64 p-0'>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className='hidden md:flex md:sticky md:top-16 md:h-[calc(100vh-4rem)] flex-col w-64 border-r'>
        <SidebarContent />
      </aside>
    </>
  )
}
