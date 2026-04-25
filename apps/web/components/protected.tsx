'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, ApiError, logout } from '@/lib/api'

type Props = {
  children: React.ReactNode
  isAdmin?: boolean
}

export function Protected({ children, isAdmin }: Props) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)
  useEffect(() => {
    let cancelled = false

    const checkAccess = async () => {
      try {
        const res = await getMe()
        if (cancelled) return

        const user = res?.user
        if (!user) {
          router.replace('/login')
          return
        }

        // Normalize admin check (supports string or string[])
        const isUserAdmin = Array.isArray(user.roles)
          ? user.roles.includes('admin')
          : user.roles === 'admin'

        // If this page requires admin but user isn't admin → redirect
        if (isAdmin && !isUserAdmin) {
          await logout()
          router.replace('/login')
          return
        }

        // If this page is public/protected (not admin-only) and user exists → allow
        setAllowed(true)
      } catch (err: any) {
        if (cancelled) return

        const status = (err as ApiError)?.status
        if (status === 401) {
          await logout()
          router.replace('/login')
        } else {
          await logout()
          console.error('Auth check failed', err)
          router.replace('/login')
        }
      } finally {
        if (!cancelled) {
          setChecking(false)
        }
      }
    }

    checkAccess()

    return () => {
      cancelled = true
    }
  }, [router, isAdmin])

  if (checking) {
    return (
      <div className='w-full py-10 text-center text-sm text-muted-foreground'>
        Checking your session...
      </div>
    )
  }

  if (!allowed) {
    // We already redirected, but render nothing to be safe
    return null
  }
  if (isAdmin) return <>{children}</>

  return <>{children}</>
}
