// 'use client'

// import { FormEvent, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { register, ApiError } from '@/lib/api'
// import Link from 'next/link'
// import { useAuth } from '@/hooks/use-auth'
// // import { initSocket } from '@/lib/socket'

// export default function RegisterPage() {
//   const router = useRouter()
//   const [username, setUsername] = useState('')
//   const [avatarUrl, setAvatarUrl] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const { setSession } = useAuth()
//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault()
//     setError(null)
//     setLoading(true)

//     try {
//       const res = await register(username, avatarUrl, email, password)
//       if (!res.accessToken || !res.user) {
//         throw new Error('Missing access token in registration response')
//       }
//       setSession({ user: res.user, accessToken: res.accessToken })
//       // user is now logged in (cookies set); go to homepage / threads
//       router.push('/')
//     } catch (err: any) {
//       const apiErr = err as ApiError
//       setError(apiErr.message || 'Registration failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className='min-h-screen flex items-center justify-center'>
//       <form
//         onSubmit={handleSubmit}
//         className='w-full max-w-sm space-y-4 border rounded-xl p-6 shadow-sm'
//       >
//         <h1 className='text-xl font-semibold text-center'>Create account</h1>

//         <div className='space-y-1'>
//           <label className='block text-sm font-medium'>Username</label>
//           <input
//             className='w-full border rounded-md px-3 py-2 text-sm'
//             value={username}
//             onChange={e => setUsername(e.target.value)}
//             required
//           />
//         </div>
//         <div className='space-y-1'>
//           <label className='block text-sm font-medium'>Avatar Url</label>
//           <input
//             className='w-full border rounded-md px-3 py-2 text-sm'
//             type='url'
//             value={avatarUrl}
//             onChange={e => setAvatarUrl(e.target.value)}
//           />
//         </div>

//         <div className='space-y-1'>
//           <label className='block text-sm font-medium'>Email</label>
//           <input
//             type='email'
//             className='w-full border rounded-md px-3 py-2 text-sm'
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className='space-y-1'>
//           <label className='block text-sm font-medium'>Password</label>
//           <input
//             type='password'
//             className='w-full border rounded-md px-3 py-2 text-sm'
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             required
//           />
//         </div>

//         {error && <p className='text-sm text-red-600'>{error}</p>}

//         <button
//           type='submit'
//           disabled={loading}
//           className='w-full cursor-pointer rounded-md py-2 text-sm font-medium bg-black text-white disabled:opacity-60'
//         >
//           {loading ? 'Creating...' : 'Create account'}
//         </button>

//         <p className='text-xs text-center text-gray-500'>
//           Already have an account?{' '}
//           <Link href='/login' className='underline'>
//             Sign in
//           </Link>
//         </p>
//       </form>
//     </div>
//   )
// }

'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register, ApiError } from '@/lib/api'
import { uploadRegisterAvatar } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const { setSession } = useAuth()
  const { toast } = useToast()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar must be smaller than 5MB')
      toast({
        title: 'File too large',
        description: 'Please upload an image under 5MB.',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      if (!base64) {
        setError('Invalid image file')
        return
      }
      setAvatarPreview(result)
      setAvatarBase64(base64)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let avatarUrl: string | undefined = undefined

      if (avatarBase64) {
        setAvatarUploading(true)
        const res = await uploadRegisterAvatar(avatarBase64)
        avatarUrl = res.avatarUrl
        setAvatarUploading(false)
      }

      const res = await register(username, avatarUrl || '', email, password)

      if (!res.accessToken || !res.user) {
        throw new Error('Missing access token in registration response')
      }

      setSession({ user: res.user, accessToken: res.accessToken })

      toast({
        title: 'Welcome!',
        description: 'Your account has been created successfully.',
      })

      router.push('/')
    } catch (err: any) {
      const apiErr = err as ApiError
      setError(apiErr.message || 'Registration failed')
    } finally {
      setLoading(false)
      setAvatarUploading(false)
    }
  }

  const initialLetter = username?.trim()?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950'>
      <div className='w-full max-w-md'>
        <div className='mb-6 text-center text-slate-100'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Join AI Chat Forum
          </h1>
          <p className='mt-2 text-sm text-slate-400'>
            Create your account to start exploring threads &amp; discussions.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={cn(
            'space-y-5 rounded-2xl border border-slate-800/80 bg-slate-900/80',
            'backdrop-blur-md shadow-xl px-6 py-6'
          )}
        >
          {/* Avatar */}
          <div className='flex flex-col items-center gap-3'>
            <Avatar className='h-16 w-16 border border-slate-700'>
              <AvatarImage
                src={
                  avatarPreview ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    username || 'User'
                  )}`
                }
                alt='Avatar preview'
              />
              <AvatarFallback>{initialLetter}</AvatarFallback>
            </Avatar>
            <div>
              <label htmlFor='avatar-upload' className='sr-only'>
                Upload avatar
              </label>
              <input
                id='avatar-upload'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleAvatarChange}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-2 border-slate-700/80 bg-slate-900/80 text-slate-100 hover:bg-slate-800'
                onClick={() =>
                  document.getElementById('avatar-upload')?.click()
                }
                disabled={loading}
              >
                <Upload className='h-4 w-4' />
                {avatarUploading ? 'Uploading...' : 'Upload avatar (optional)'}
              </Button>
              <p className='mt-1 text-[10px] text-slate-500 text-center'>
                JPG/PNG up to 5MB. We host it securely via imgbb.
              </p>
            </div>
          </div>

          {/* Username */}
          <div className='space-y-1.5'>
            <label className='block text-xs font-medium text-slate-300'>
              Username
            </label>
            <Input
              className='bg-slate-900/70 border-slate-700 text-slate-50 placeholder:text-slate-500'
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
            />
          </div>

          {/* Email */}
          <div className='space-y-1.5'>
            <label className='block text-xs font-medium text-slate-300'>
              Email
            </label>
            <Input
              type='email'
              className='bg-slate-900/70 border-slate-700 text-slate-50 placeholder:text-slate-500'
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              required
              minLength={6}
            />
            <p className='text-[10px] text-slate-500'>
              Use at least 6 characters. Avoid using a real password here for
              demo.
            </p>
          </div>

          {error && (
            <p className='text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-md px-3 py-2'>
              {error}
            </p>
          )}

          <Button
            type='submit'
            disabled={loading || avatarUploading}
            className='w-full cursor-pointer rounded-md py-2 text-sm font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 disabled:opacity-60'
          >
            {loading || avatarUploading
              ? 'Creating your account...'
              : 'Create account'}
          </Button>

          <p className='text-xs text-center text-slate-500 mt-1'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline'
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
