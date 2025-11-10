'use client'

import { useMemo } from 'react'
import { buildPostTree, PostNode } from '@/lib/post-tree'
import { Post } from '@/lib/types'

type Props = {
  posts: Post[]
  onReply?: (parentPost: PostNode) => void
}

export function Replies({ posts, onReply }: Props) {
  const tree = useMemo(() => buildPostTree(posts), [posts])

  return (
    <div className='space-y-4'>
      {tree.map(post => (
        <PostItem key={post._id} post={post} depth={0} onReply={onReply} />
      ))}
    </div>
  )
}

type ItemProps = {
  post: PostNode
  depth: number
  onReply?: (post: PostNode) => void
}

function PostItem({ post, depth, onReply }: ItemProps) {
  console.log(depth)
  return (
    <div
      className='border-l pl-3 pb-3'
      style={{ marginLeft: depth === 0 ? 0 : 16 }}
    >
      <div className='flex items-baseline gap-2'>
        <span className='font-semibold text-sm'>
          {typeof post.authorId === 'object' ? post.authorId.username : 'User'}
        </span>
        <span className='text-[10px] text-gray-500'>
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>

      <div className='text-sm mt-1 whitespace-pre-wrap'>{post.content}</div>

      <div className='mt-1 flex gap-3 text-[10px] text-gray-500'>
        {onReply && (
          <button onClick={() => onReply(post)} className='hover:underline'>
            Reply
          </button>
        )}
      </div>

      {post.replies.length > 0 && (
        <div className='mt-2 space-y-2'>
          {post.replies.map(child => (
            <PostItem
              key={child._id}
              post={child}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}
