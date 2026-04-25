'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const POST_TYPES = [
  'Courses Topics',
  'Bugs',
  'Guidelines',
  'Feature Requests',
  'Others',
]

interface PostTypeSelectorProps {
  value: string
  onChange: (type: string) => void
  disabled?: boolean
}

export function PostTypeSelector({
  value,
  onChange,
  disabled = false,
}: PostTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className='bg-slate-900/70 border-slate-700 text-slate-50'>
        <SelectValue placeholder='Select post type' />
      </SelectTrigger>
      <SelectContent className='bg-slate-900 border-slate-700'>
        {POST_TYPES.map(type => (
          <SelectItem key={type} value={type} className='text-slate-100'>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
