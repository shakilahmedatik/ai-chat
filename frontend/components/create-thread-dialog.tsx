'use client'

import type React from 'react'
import { useState } from 'react'
import { createThread } from '@/lib/api'
import { createThreadSchema } from '@/lib/schemas'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader2, X } from 'lucide-react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        if (tags.length < 5) {
          setTags([...tags, newTag])
          setTagInput('')
          setErrors(prev => ({ ...prev, tags: '' }))
        } else {
          setErrors(prev => ({ ...prev, tags: 'Maximum 5 tags allowed' }))
        }
      } else {
        setErrors(prev => ({ ...prev, tags: 'Tag already added' }))
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
    setErrors(prev => ({ ...prev, tags: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate using zod schema
    const result = createThreadSchema.safeParse({
      title,
      description,
      tags,
    })

    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach(error => {
        const field = error.path[0] as string
        newErrors[field] = error.message
      })
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const newThread = await createThread({
        title: result.data.title,
        description: result.data.description,
        tags: result.data.tags,
      })

      // Success - reset form and close dialog
      setTitle('')
      setDescription('')
      setTags([])
      setTagInput('')
      onOpenChange(false)

      // Show success toast
      toast({
        title: 'Success',
        description: 'Thread created successfully',
      })
      console.log(newThread)
      // Navigate to the new thread
      router.push(`/thread/${newThread._id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create thread',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTitle('')
      setDescription('')
      setTags([])
      setTagInput('')
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
          <DialogDescription>
            Start a new discussion with the community
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
              placeholder="What's your question or topic?"
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id='title-error' className='text-sm text-destructive'>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Provide more details... (optional)'
              value={description}
              onChange={e => {
                setDescription(e.target.value)
                if (errors.description)
                  setErrors(prev => ({ ...prev, description: '' }))
              }}
              disabled={isSubmitting}
              rows={3}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? 'description-error' : undefined
              }
            />
            {errors.description && (
              <p id='description-error' className='text-sm text-destructive'>
                {errors.description}
              </p>
            )}
          </div>

          {/* Tags Field */}
          <div className='space-y-2'>
            <Label htmlFor='tags'>
              Tags{' '}
              <span className='text-muted-foreground text-xs'>(up to 5)</span>
            </Label>
            <div className='space-y-2'>
              <Input
                id='tags'
                placeholder='Type tag and press Enter'
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                disabled={isSubmitting}
                aria-invalid={!!errors.tags}
                aria-describedby={errors.tags ? 'tags-error' : undefined}
              />
              {errors.tags && (
                <p id='tags-error' className='text-sm text-destructive'>
                  {errors.tags}
                </p>
              )}
            </div>

            {/* Tag Chips */}
            {tags.length > 0 && (
              <div className='flex flex-wrap gap-2 pt-2'>
                {tags.map(tag => (
                  <Badge key={tag} variant='secondary' className='gap-1'>
                    {tag}
                    <button
                      type='button'
                      onClick={() => handleRemoveTag(tag)}
                      className='ml-1 hover:text-destructive transition-colors'
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full'
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                Creating...
              </>
            ) : (
              'Create Thread'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
