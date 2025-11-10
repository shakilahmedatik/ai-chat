import type React from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteSidebar } from '@/components/site-sidebar'
import { BreadcrumbNav } from '@/components/breadcrumb-nav'

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex min-h-screen flex-col'>
      {/* Header */}
      <SiteHeader />

      {/* Main Content Area */}
      <div className='flex flex-1'>
        {/* Sidebar */}
        <SiteSidebar />

        {/* Content */}
        <main className='flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-6xl px-4 py-6'>
            <BreadcrumbNav />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
