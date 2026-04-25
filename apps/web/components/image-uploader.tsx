'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface UploadedImage {
  src: string
  type: 'image' | 'video'
  file?: File
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxFiles?: number
  maxSizePerFile?: number
}

export function ImageUploader({
  images,
  onImagesChange,
  maxFiles = 10,
  maxSizePerFile = 5 * 1024 * 1024,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files
    if (!files) return

    setError(null)

    if (images.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`)
      return
    }

    const newImages: UploadedImage[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.size > maxSizePerFile) {
        setError(`File "${file.name}" is too large (max 5MB)`)
        continue
      }

      if (!file.type.startsWith('image/')) {
        setError(`File "${file.name}" is not an image`)
        continue
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        newImages.push({
          src: result,
          type: 'image',
          file,
        })

        if (newImages.length === files.length) {
          onImagesChange([...images, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    }

    e.target.value = ''
  }

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onImagesChange(updated)
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <label className='block text-xs font-medium text-slate-300'>
          Images ({images.length}/{maxFiles})
        </label>
      </div>

      <div className='space-y-2'>
        <input
          id='image-upload'
          type='file'
          multiple
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
          disabled={uploading || images.length >= maxFiles}
        />

        <Button
          type='button'
          variant='outline'
          size='sm'
          className={cn(
            'w-full gap-2 border-dashed border-slate-700 bg-slate-900/50',
            'hover:bg-slate-800 text-slate-100',
            (uploading || images.length >= maxFiles) && 'opacity-60 cursor-not-allowed'
          )}
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={uploading || images.length >= maxFiles}
        >
          <Upload className='h-4 w-4' />
          {uploading
            ? 'Uploading...'
            : images.length >= maxFiles
              ? 'Max images reached'
              : 'Click to upload or drag'}
        </Button>

        {error && (
          <div className='flex items-start gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-900/50 rounded-md px-3 py-2'>
            <AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {images.length > 0 && (
          <div className='grid grid-cols-3 gap-2'>
            {images.map((img, idx) => (
              <div
                key={idx}
                className='relative aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-900/50'
              >
                <Image
                  src={img.src}
                  alt={`Preview ${idx + 1}`}
                  fill
                  className='object-cover'
                />
                <button
                  type='button'
                  onClick={() => removeImage(idx)}
                  className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity'
                >
                  <Trash2 className='h-4 w-4 text-red-400' />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className='text-[10px] text-slate-500'>
        JPG/PNG up to 5MB per file. Maximum {maxFiles} files.
      </p>
    </div>
  )
}
