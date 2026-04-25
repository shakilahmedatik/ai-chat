'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { createThread } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BatchSelector } from '@/components/batch-selector'
import { PostTypeSelector } from '@/components/post-type-selector'
import { ImageUploader, UploadedImage } from '@/components/image-uploader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CreateThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateThreadDialog({
  open,
  onOpenChange,
}: CreateThreadDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [batch, setBatch] = useState('')
  const [postType, setPostType] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Set default batch if user logged in
  useEffect(() => {
    if (user?.batch && !batch) {
      setBatch(user.batch)
    }
  }, [user, batch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!postBody.trim()) newErrors.postBody = 'Post body is required'
    if (!batch) newErrors.batch = 'Batch is required'
    if (!postType) newErrors.postType = 'Post type is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare media uploads
      const imagesOrVideos: Array<{ src: string; type: 'image' | 'video' }> = []
      
      for (const img of images) {
        if (img.src.startsWith('data:')) {
          // For now, just use the data URL directly
          // In production, you'd upload to S3 and get a URL
          imagesOrVideos.push({
            src: img.src,
            type: 'image',
          })
        } else {
          imagesOrVideos.push({
            src: img.src,
            type: 'image',
          })
        }
      }

      const newThread = await createThread({
        title: title.trim(),
        postBody: postBody.trim(),
        batch,
        postType,
        imagesOrVideos,
      })

      // Success - reset form and close dialog
      setTitle('')
      setPostBody('')
      setBatch(user?.batch || '')
      setPostType('')
      setImages([])
      onOpenChange(false)

      toast({
        title: 'Success',
        description: 'Thread created successfully',
      })

      router.push(`/thread/${newThread._id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create thread',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('')
      setPostBody('')
      setBatch(user?.batch || '')
      setPostType('')
      setImages([])
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
          <DialogDescription>
            Create a new helpdesk thread - be descriptive and helpful
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Title Field */}
          <div className='space-y-2'>
            <Label htmlFor='title'>
              Thread Title <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='title'
              placeholder="What's your issue or question?"
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
              }}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className='text-xs text-destructive'>{errors.title}</p>
            )}
          </div>

          {/* Batch Selector */}
          <div className='space-y-2'>
            <Label htmlFor='batch'>
              Batch <span className='text-destructive'>*</span>
            </Label>
            <BatchSelector
              value={batch}
              onChange={batch => {
                setBatch(batch)
                if (errors.batch) setErrors(prev => ({ ...prev, batch: '' }))
              }}
              disabled={isSubmitting}
            />
            {errors.batch && (
              <p className='text-xs text-destructive'>{errors.batch}</p>
            )}
          </div>

          {/* Post Type Selector */}
          <div className='space-y-2'>
            <Label htmlFor='postType'>
              Post Type <span className='text-destructive'>*</span>
            </Label>
            <PostTypeSelector
              value={postType}
              onChange={postType => {
                setPostType(postType)
                if (errors.postType)
                  setErrors(prev => ({ ...prev, postType: '' }))
              }}
              disabled={isSubmitting}
            />
            {errors.postType && (
              <p className='text-xs text-destructive'>{errors.postType}</p>
            )}
          </div>

          {/* Post Body */}
          <div className='space-y-2'>
            <Label htmlFor='postBody'>
              Description <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='postBody'
              placeholder='Describe your issue in detail. Include steps to reproduce, error messages, or any other relevant information.'
              value={postBody}
              onChange={e => {
                setPostBody(e.target.value)
                if (errors.postBody)
                  setErrors(prev => ({ ...prev, postBody: '' }))
              }}
              disabled={isSubmitting}
              rows={6}
              className='resize-none'
            />
            {errors.postBody && (
              <p className='text-xs text-destructive'>{errors.postBody}</p>
            )}
          </div>

          {/* Image Uploader */}
          <ImageUploader
            images={images}
            onImagesChange={setImages}
            maxFiles={10}
          />

          {/* Submit Button */}
          <div className='flex gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='flex-1'
            >
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {isSubmitting ? 'Creating...' : 'Create Thread'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
