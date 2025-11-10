// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { UserPlus } from "lucide-react"

// import { registerSchema, type RegisterInput } from "@/lib/schemas"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// export default function RegisterPage() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const form = useForm<RegisterInput>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       username: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//   })

//   async function onSubmit(data: RegisterInput) {
//     setIsLoading(true)
//     setError(null)

//     try {
//       // Fake registration: set a cookie and redirect
//       const fakeToken = btoa(
//         JSON.stringify({ user: data.username, email: data.email, exp: Date.now() + 24 * 60 * 60 * 1000 }),
//       )
//       document.cookie = `session=${fakeToken}; path=/; max-age=2592000`

//       // Redirect to forum
//       router.push("/forum")
//     } catch (err) {
//       setError("Registration failed. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-background px-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <div className="flex items-center justify-center mb-2">
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
//               <UserPlus className="h-6 w-6 text-primary-foreground" />
//             </div>
//           </div>
//           <CardTitle className="text-center">Create account</CardTitle>
//           <CardDescription className="text-center">Join our community and start collaborating</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {error && (
//             <Alert variant="destructive" className="mb-4">
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="username"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Username</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Choose a username" autoComplete="username" disabled={isLoading} {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Enter your email"
//                         type="email"
//                         autoComplete="email"
//                         disabled={isLoading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Create a password"
//                         type="password"
//                         autoComplete="new-password"
//                         disabled={isLoading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="confirmPassword"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Confirm password</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Confirm your password"
//                         type="password"
//                         autoComplete="new-password"
//                         disabled={isLoading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? "Creating account..." : "Create account"}
//               </Button>
//             </form>
//           </Form>

//           <div className="mt-4 text-center text-sm">
//             <span className="text-muted-foreground">Already have an account? </span>
//             <Link href="/login" className="text-primary hover:underline font-medium">
//               Sign in
//             </Link>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { register, ApiError } from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
// import { initSocket } from '@/lib/socket'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setSession } = useAuth()
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await register(username, avatarUrl, email, password)
      if (!res.accessToken || !res.user) {
        throw new Error('Missing access token in registration response')
      }
      setSession({ user: res.user, accessToken: res.accessToken })
      // user is now logged in (cookies set); go to homepage / threads
      router.push('/')
    } catch (err: any) {
      const apiErr = err as ApiError
      setError(apiErr.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm space-y-4 border rounded-xl p-6 shadow-sm'
      >
        <h1 className='text-xl font-semibold text-center'>Create account</h1>

        <div className='space-y-1'>
          <label className='block text-sm font-medium'>Username</label>
          <input
            className='w-full border rounded-md px-3 py-2 text-sm'
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className='space-y-1'>
          <label className='block text-sm font-medium'>Avatar Url</label>
          <input
            className='w-full border rounded-md px-3 py-2 text-sm'
            type='url'
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
          />
        </div>

        <div className='space-y-1'>
          <label className='block text-sm font-medium'>Email</label>
          <input
            type='email'
            className='w-full border rounded-md px-3 py-2 text-sm'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className='space-y-1'>
          <label className='block text-sm font-medium'>Password</label>
          <input
            type='password'
            className='w-full border rounded-md px-3 py-2 text-sm'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className='text-sm text-red-600'>{error}</p>}

        <button
          type='submit'
          disabled={loading}
          className='w-full cursor-pointer rounded-md py-2 text-sm font-medium bg-black text-white disabled:opacity-60'
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>

        <p className='text-xs text-center text-gray-500'>
          Already have an account?{' '}
          <Link href='/login' className='underline'>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
