"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface DateRange {
  from: Date | null
  to: Date | null
}

export interface DateRangeProps {
  onRangeChange: (range: DateRange) => void
  placeholder?: string
}

export function DateRange({ onRangeChange, placeholder = "Select date range" }: DateRangeProps) {
  const [range, setRange] = useState<DateRange>({ from: null, to: null })
  const [open, setOpen] = useState(false)

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const from = e.target.value ? new Date(e.target.value) : null
    setRange({ ...range, from })
    onRangeChange({ ...range, from })
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const to = e.target.value ? new Date(e.target.value) : null
    setRange({ ...range, to })
    onRangeChange({ ...range, to })
  }

  const handleClear = () => {
    setRange({ from: null, to: null })
    onRangeChange({ from: null, to: null })
  }

  const displayText = range.from && range.to ? `${formatDate(range.from)} - ${formatDate(range.to)}` : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <CalendarIcon className="h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">From</label>
            <Input
              type="date"
              value={range.from ? range.from.toISOString().split("T")[0] : ""}
              onChange={handleFromChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">To</label>
            <Input
              type="date"
              value={range.to ? range.to.toISOString().split("T")[0] : ""}
              onChange={handleToChange}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClear} variant="outline" size="sm" className="flex-1 bg-transparent">
              Clear
            </Button>
            <Button onClick={() => setOpen(false)} size="sm" className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
