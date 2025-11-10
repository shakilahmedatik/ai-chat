"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import type { Post } from "@/lib/types"
import { PostItem } from "@/components/post-item"

interface VirtualizedPostListProps {
  posts: Post[]
  threadId: string
  itemHeight?: number
  visibleCount?: number
}

/**
 * Simple virtualized list component for rendering large post lists efficiently.
 * Only renders visible items + buffer to optimize performance.
 */
export function VirtualizedPostList({ posts, threadId, itemHeight = 200, visibleCount = 5 }: VirtualizedPostListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight))
  const endIndex = Math.min(posts.length, startIndex + visibleCount + 2) // +2 for buffer

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop)
  }, [])

  const visiblePosts = posts.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-y-auto"
      style={{ height: `${visibleCount * itemHeight}px` }}
      role="region"
      aria-label="Thread posts"
    >
      <div style={{ height: posts.length * itemHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }} className="space-y-3">
          {visiblePosts.map((post) => (
            <PostItem key={post.id} post={post} threadId={threadId} replies={[]} level={0} />
          ))}
        </div>
      </div>
    </div>
  )
}
