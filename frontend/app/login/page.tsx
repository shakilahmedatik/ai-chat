// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { LogIn } from "lucide-react"

// import { loginSchema, type LoginInput } from "@/lib/schemas"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// export default function LoginPage() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const form = useForm<LoginInput>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       emailOrUsername: "",
//       password: "",
//       rememberMe: false,
//     },
//   })

//   async function onSubmit(data: LoginInput) {
//     setIsLoading(true)
//     setError(null)

//     try {
//       // Fake authentication: set a cookie and redirect
//       const fakeToken = btoa(JSON.stringify({ user: data.emailOrUsername, exp: Date.now() + 24 * 60 * 60 * 1000 }))
//       document.cookie = `session=${fakeToken}; path=/; ${data.rememberMe ? "max-age=2592000" : ""}`

//       // Redirect to forum
//       router.push("/forum")
//     } catch (err) {
//       setError("Login failed. Please try again.")
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
//               <LogIn className="h-6 w-6 text-primary-foreground" />
//             </div>
//           </div>
//           <CardTitle className="text-center">Welcome back</CardTitle>
//           <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
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
//                 name="emailOrUsername"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email or Username</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Enter your email or username"
//                         autoComplete="username"
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
//                         placeholder="Enter your password"
//                         type="password"
//                         autoComplete="current-password"
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
//                 name="rememberMe"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-center space-x-2 space-y-0">
//                     <FormControl>
//                       <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
//                     </FormControl>
//                     <FormLabel className="font-normal cursor-pointer">Remember me</FormLabel>
//                   </FormItem>
//                 )}
//               />

//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? "Signing in..." : "Sign in"}
//               </Button>
//             </form>
//           </Form>

//           <div className="mt-4 text-center text-sm">
//             <span className="text-muted-foreground">Don't have an account? </span>
//             <Link href="/register" className="text-primary hover:underline font-medium">
//               Sign up
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
import { login, ApiError } from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
// import { initSocket } from '@/lib/socket'

export default function LoginPage() {
  const router = useRouter()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setSession } = useAuth()

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
      router.push('/')
    } catch (err: any) {
      const apiErr = err as ApiError
      setError(apiErr.message || 'Login failed')
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
        <h1 className='text-xl font-semibold text-center'>Sign in</h1>

        <div className='space-y-1'>
          <label className='block text-sm font-medium'>Email or Username</label>
          <input
            className='w-full border rounded-md px-3 py-2 text-sm'
            value={emailOrUsername}
            onChange={e => setEmailOrUsername(e.target.value)}
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
          className='w-full rounded-md py-2 text-sm font-medium bg-black text-white disabled:opacity-60'
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className='text-xs text-center text-gray-500'>
          Don&apos;t have an account?{' '}
          <Link href='/register' className='underline'>
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
