import { Post } from './types'

export interface PostNode extends Post {
  replies: PostNode[]
}

export function buildPostTree(posts: Post[]): PostNode[] {
  console.log('From generator-----> ', posts)
  const map = new Map<string, PostNode>()
  const roots: PostNode[] = []

  // 1) Wrap all posts with replies = []
  for (const p of posts) {
    map.set(p._id, { ...p, replies: [] })
  }

  // 2) Link children to parents
  for (const p of posts) {
    const node = map.get(p._id)!
    const parentId = (p as any).parentId || (p as any).parentPostId || null

    if (parentId && map.has(parentId)) {
      map.get(parentId)!.replies.push(node)
    } else {
      // no parent → top-level
      roots.push(node)
    }
  }

  // 3) Sort (optional but usually needed)
  const sortRecursively = (nodes: PostNode[]) => {
    nodes.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    nodes.forEach(n => sortRecursively(n.replies))
  }

  sortRecursively(roots)

  return roots
}
