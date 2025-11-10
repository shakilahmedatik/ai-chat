'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { SearchInput } from '@/components/search-input'
import { useRouter } from 'next/navigation'
import { CreateThreadDialog } from '@/components/create-thread-dialog'
import { NotificationsDrawer } from '@/components/notifications-drawer'

import { getMe, logout, ApiError } from '@/lib/api'
import { User } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'

export function SiteHeader() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const { clearSession, setUser: updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getMe()
        setUser(res.user)
        updateUser(res.user)
      } catch (err: any) {
        const e = err as ApiError
        if (e.status === 401) {
          setUser(null)
          updateUser(undefined)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" focuses search
      if (e.ctrlKey && e.key === '/' && !isNewThreadOpen) {
        e.preventDefault()
        const searchInput = document.getElementById('global-search')
        if (searchInput) {
          searchInput.focus()
        }
      }
      // "n" opens new thread dialog

      if ((e.key === 'n' || e.key === 'N') && e.ctrlKey) {
        e.preventDefault()
        setIsNewThreadOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isNewThreadOpen])

  const handleLogout = async () => {
    try {
      await logout()
      clearSession()
    } finally {
      router.push('/login')
    }
  }

  return (
    <header className='sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
      <div className='flex h-16 items-center justify-between gap-4 px-4'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2 font-bold text-lg'>
          <div className='h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold'>
            AI
          </div>
          <span className='hidden sm:inline'>Forum</span>
        </Link>

        {/* Search Input */}
        <div className='flex-1 max-w-md'>
          <SearchInput />
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          {/* Theme Toggle */}
          <ThemeToggle />

          {user && !loading && (
            <>
              {/* New Thread Modal - Works Globally using ctrl+n */}
              <CreateThreadDialog
                open={isNewThreadOpen}
                onOpenChange={setIsNewThreadOpen}
              />

              {/* New Thread Button */}
              <Button
                size='sm'
                className='gap-2 cursor-pointer'
                onClick={() => setIsNewThreadOpen(true)}
              >
                <Plus className='h-4 w-4' />
                <span className='hidden sm:inline'>New Thread</span>
              </Button>

              {/* Notification Icon and drawer */}
              <NotificationsDrawer />

              {/* User Avatar Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='rounded-full'>
                    <Avatar className='h-8 w-8 cursor-pointer'>
                      <AvatarImage
                        src={user.avatarUrl || '/placeholder.svg'}
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium'>{user.username}</p>
                      <p className='text-xs text-muted-foreground'>
                        {user?.roles}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href='/profile'>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/settings'>Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href='/docs/ai-features'>Docs</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Button
                      className='cursor-pointer'
                      variant={'default'}
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!user && !loading && (
            <Button
              className='cursor-pointer'
              variant='secondary'
              onClick={() => router.push('/login')}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
