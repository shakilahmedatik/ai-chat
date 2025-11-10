'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, ApiError } from '@/lib/api'

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

    ;(async () => {
      try {
        const res = await getMe()
        if (!cancelled && res?.user) {
          setAllowed(true)
        }
      } catch (err: any) {
        const e = err as ApiError
        if (!cancelled && e.status === 401) {
          router.replace('/login')
        }
      } finally {
        if (!cancelled) setChecking(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router])

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
