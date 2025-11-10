"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  availableTags: string[]
  placeholder?: string
}

export function TagFilter({
  selectedTags,
  onTagsChange,
  availableTags,
  placeholder = "Select tags...",
}: TagFilterProps) {
  const [open, setOpen] = useState(false)

  const handleToggleTag = useCallback(
    (tag: string) => {
      const updated = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
      onTagsChange(updated)
    },
    [selectedTags, onTagsChange],
  )

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag))
  }

  const handleClearAll = () => {
    onTagsChange([])
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent"
          >
            {selectedTags.length > 0
              ? `${selectedTags.length} tag${selectedTags.length !== 1 ? "s" : ""} selected`
              : placeholder}
            <X className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {availableTags.map((tag) => (
                  <CommandItem key={tag} value={tag} onSelect={() => handleToggleTag(tag)}>
                    <Check className={cn("mr-2 h-4 w-4", selectedTags.includes(tag) ? "opacity-100" : "opacity-0")} />
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
