// 'use client'

// import type React from 'react'

// import { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormDescription,
//   FormMessage,
// } from '@/components/ui/form'
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
// import { useToast } from '@/hooks/use-toast'
// import { profileSchema, type ProfileInput } from '@/lib/schemas'
// import { Upload } from 'lucide-react'

// export default function ProfilePage() {
//   const { toast } = useToast()
//   const [isLoading, setIsLoading] = useState(false)
//   const [avatarUrl, setAvatarUrl] = useState(
//     'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
//   )

//   const form = useForm<ProfileInput>({
//     resolver: zodResolver(profileSchema),
//     defaultValues: {
//       displayName: 'John Doe',
//       bio: 'Passionate about community discussions and AI',
//     },
//   })

//   async function onSubmit(data: ProfileInput) {
//     setIsLoading(true)
//     try {
//       // Simulated API call
//       await new Promise(resolve => setTimeout(resolve, 1000))
//       toast({
//         title: 'Profile updated',
//         description: 'Your profile has been saved successfully.',
//       })
//       form.reset(data)
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to update profile. Please try again.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     // Stub for avatar upload
//     const file = e.target.files?.[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onloadend = () => {
//         setAvatarUrl(reader.result as string)
//         toast({
//           title: 'Avatar updated',
//           description: 'Your avatar preview has been updated.',
//         })
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   return (
//     <div className='min-h-screen bg-background'>
//       <div className='mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
//         {/* Header */}
//         <div>
//           <h1 className='text-3xl font-bold tracking-tight text-foreground'>
//             Profile
//           </h1>
//           <p className='mt-2 text-muted-foreground'>
//             Manage your public profile information
//           </p>
//         </div>

//         {/* Avatar Section */}
//         <div className='rounded-lg border border-border bg-card p-6'>
//           <div className='flex flex-col items-center gap-4 sm:flex-row'>
//             <Avatar className='h-24 w-24'>
//               <AvatarImage
//                 src={avatarUrl || '/placeholder.svg'}
//                 alt='Profile avatar'
//               />
//               <AvatarFallback>JD</AvatarFallback>
//             </Avatar>
//             <div className='flex flex-1 flex-col gap-3'>
//               <div>
//                 <label htmlFor='avatar-upload' className='sr-only'>
//                   Upload avatar
//                 </label>
//                 <input
//                   id='avatar-upload'
//                   type='file'
//                   accept='image/*'
//                   className='hidden'
//                   onChange={handleAvatarUpload}
//                 />
//                 <Button
//                   variant='outline'
//                   size='sm'
//                   onClick={() =>
//                     document.getElementById('avatar-upload')?.click()
//                   }
//                 >
//                   <Upload className='mr-2 h-4 w-4' />
//                   Upload Photo
//                 </Button>
//               </div>
//               <p className='text-xs text-muted-foreground'>
//                 JPG, PNG, GIF up to 10MB
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Form Section */}
//         <div className='rounded-lg border border-border bg-card p-6'>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
//               <FormField
//                 control={form.control}
//                 name='displayName'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Display Name</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder='Your display name'
//                         {...field}
//                         disabled={isLoading}
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       This is how others will see you on the forum
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name='bio'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Bio</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder='Tell us about yourself...'
//                         className='min-h-24 resize-none'
//                         {...field}
//                         disabled={isLoading}
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       Introduce yourself to the community (up to 500 characters)
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <Button type='submit' disabled={isLoading}>
//                 {isLoading ? 'Saving...' : 'Save Changes'}
//               </Button>
//             </form>
//           </Form>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { profileSchema, type ProfileInput } from '@/lib/schemas'
import { Upload } from 'lucide-react'
import { getMyProfile, updateMyProfile, uploadAvatarImage } from '@/lib/api'
import { Protected } from '@/components/protected'

type ProfileFormValues = Omit<ProfileInput, 'bio'> & { bio?: string }

export default function ProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const form = useForm<ProfileFormValues, any, ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      bio: '',
    },
  })

  // Load current profile
  useEffect(() => {
    ;(async () => {
      try {
        const profile = await getMyProfile()
        setAvatarUrl(profile.avatarUrl)
        form.reset({
          displayName: profile.displayName || profile.username,
          bio: profile.bio || '',
        })
      } catch (err: any) {
        toast({
          title: 'Failed to load profile',
          description: err?.message || 'Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(data: ProfileInput) {
    setSaving(true)
    try {
      await updateMyProfile(data)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      })
      form.reset(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image under 10MB.',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const result = reader.result as string
        const base64 = result.split(',')[1] // strip data: prefix
        if (!base64) {
          throw new Error('Invalid image data')
        }

        setAvatarUploading(true)

        const res = await uploadAvatarImage(base64)
        setAvatarUrl(res.avatarUrl)

        toast({
          title: 'Avatar updated',
          description: 'Your profile picture has been updated.',
        })
      } catch (error: any) {
        toast({
          title: 'Upload failed',
          description:
            error?.message || 'Could not upload avatar. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setAvatarUploading(false)
      }
    }

    reader.readAsDataURL(file)
  }

  const currentAvatar =
    avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'

  return (
    <Protected>
      <div className='min-h-screen bg-background'>
        <div className='mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
          {/* Header */}
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>
              Profile
            </h1>
            <p className='mt-2 text-muted-foreground'>
              Manage your public profile information
            </p>
          </div>

          {/* Avatar Section */}
          <div className='rounded-lg border border-border bg-card p-6'>
            <div className='flex flex-col items-center gap-4 sm:flex-row'>
              <Avatar className='h-24 w-24'>
                <AvatarImage
                  src={currentAvatar || '/placeholder.svg'}
                  alt='Profile avatar'
                />
                <AvatarFallback>
                  {form.getValues('displayName')?.slice(0, 2).toUpperCase() ||
                    'U'}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-1 flex-col gap-3'>
                <div>
                  <label htmlFor='avatar-upload' className='sr-only'>
                    Upload avatar
                  </label>
                  <input
                    id='avatar-upload'
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading || isLoading}
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      document.getElementById('avatar-upload')?.click()
                    }
                    disabled={avatarUploading || isLoading}
                  >
                    <Upload className='mr-2 h-4 w-4' />
                    {avatarUploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  JPG, PNG, GIF up to 10MB. Uploaded via imgbb.
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className='rounded-lg border border-border bg-card p-6'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='displayName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Your display name'
                          {...field}
                          disabled={isLoading || saving}
                        />
                      </FormControl>
                      <FormDescription>
                        This is how others will see you on the forum.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Tell us about yourself...'
                          className='min-h-24 resize-none'
                          {...field}
                          disabled={isLoading || saving}
                        />
                      </FormControl>
                      <FormDescription>
                        Introduce yourself to the community (up to 500
                        characters).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type='submit' disabled={isLoading || saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Protected>
  )
}
