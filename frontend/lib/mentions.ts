import type { Post } from './types'

export type MentionUser = {
  id: string
  username: string
}

export function buildMentionUsersFromPosts(posts: Post[]): MentionUser[] {
  const byUsername = new Map<string, MentionUser>() // key = lowercase username

  for (const post of posts) {
    // 1) From author info (preferred source)
    const author: any = post.authorId

    if (author && typeof author === 'object' && author._id && author.username) {
      const key = author.username.toLowerCase()
      if (!byUsername.has(key)) {
        byUsername.set(key, {
          id: author._id,
          username: author.username,
        })
      }
    }

    // 2) From @mentions in content (fallback / extra options)
    if (post.content) {
      const regex = /@([a-zA-Z0-9_]+)/g
      let match
      while ((match = regex.exec(post.content)) !== null) {
        const username = match[1]
        const key = username.toLowerCase()

        if (!byUsername.has(key)) {
          // We don't know the real userId here, so use a stable pseudo-id.
          byUsername.set(key, {
            id: `mention-${username}`,
            username,
          })
        }
      }
    }
  }

  // Sort alphabetically by username for a nice dropdown
  return Array.from(byUsername.values()).sort((a, b) =>
    a.username.localeCompare(b.username)
  )
}
