'use client'

import { useEffect, useState } from 'react'
import { getBatches } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BatchSelectorProps {
  value: string
  onChange: (batch: string) => void
  disabled?: boolean
}

export function BatchSelector({
  value,
  onChange,
  disabled = false,
}: BatchSelectorProps) {
  const [batches, setBatches] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await getBatches()
        setBatches(res.batches || [])
      } catch (err) {
        console.error('Failed to load batches:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBatches()
  }, [])

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
      <SelectTrigger className='bg-slate-900/70 border-slate-700 text-slate-50'>
        <SelectValue placeholder={loading ? 'Loading...' : 'Select batch'} />
      </SelectTrigger>
      <SelectContent className='bg-slate-900 border-slate-700'>
        {batches.map(batch => (
          <SelectItem key={batch} value={batch} className='text-slate-100'>
            {batch}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
