'use client'

import type React from 'react'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export function SearchInput() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query)}`)
    } else {
      router.push(`/`)
    }
  }

  return (
    <form onSubmit={handleSearch} className='relative w-full'>
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
      <Input
        id='global-search'
        placeholder='Search threads... (Press ctrl + / to focus)'
        className='pl-9 text-sm'
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
    </form>
  )
}
