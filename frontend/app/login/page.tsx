'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, ApiError } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setSession } = useAuth()
  const { toast } = useToast()

  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user, accessToken } = await login(emailOrUsername, password)
      if (!accessToken) {
        throw new Error('Missing access token in login response')
      }

      setSession({ user, accessToken })

      toast({
        title: 'Welcome back 👋',
        description: 'You are now signed in.',
      })

      router.push('/')
    } catch (err: any) {
      const apiErr = err as ApiError
      const msg = apiErr.message || 'Invalid credentials. Please try again.'
      setError(msg)
      toast({
        title: 'Login failed',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='mb-6 text-center text-slate-100'>
          <h1 className='text-3xl font-bold tracking-tight'>Welcome back</h1>
          <p className='mt-2 text-sm text-slate-400'>
            Sign in to continue the conversation.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={cn(
            'space-y-5 rounded-2xl border border-slate-800/80 bg-slate-900/80',
            'backdrop-blur-md shadow-xl px-6 py-6'
          )}
        >
          {/* Email / Username */}
          <div className='space-y-1.5'>
            <label className='block text-xs font-medium text-slate-300'>
              Email or Username
            </label>
            <Input
              className='bg-slate-900/70 border-slate-700 text-slate-50 placeholder:text-slate-500'
              value={emailOrUsername}
              onChange={e => setEmailOrUsername(e.target.value)}
              placeholder='your@email.com or username'
              required
            />
          </div>

          {/* Password */}
          <div className='space-y-1.5'>
            <label className='block text-xs font-medium text-slate-300'>
              Password
            </label>
            <Input
              type='password'
              className='bg-slate-900/70 border-slate-700 text-slate-50 placeholder:text-slate-500'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className='text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-md px-3 py-2'>
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type='submit'
            disabled={loading}
            className='w-full cursor-pointer rounded-md py-2 text-sm font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 disabled:opacity-60 flex items-center justify-center gap-2'
          >
            {loading ? (
              'Signing you in...'
            ) : (
              <>
                <LogIn className='h-4 w-4' />
                Sign in
              </>
            )}
          </Button>

          {/* Link to register */}
          <p className='text-xs text-center text-slate-500 mt-1'>
            Don&apos;t have an account?{' '}
            <Link
              href='/register'
              className='text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline'
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
