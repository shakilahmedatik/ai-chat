import { Router } from 'express'
import { requireAuth, AuthRequest, requireAdmin } from '../middleware/auth'
import { Thread } from '../models/Thread'
import { Post } from '../models/Post'
import { User } from '../models/User'

const router = Router()

// GET /api/admin/dashboard
router.get(
  '/admin/dashboard',
  requireAuth,
  requireAdmin,
  async (_req: AuthRequest, res) => {
    // --- Stats ---

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const flaggedMatch = {
      $and: [
        { status: { $ne: 'removed' } },
        {
          $or: [
            { isFlagged: true },
            { 'flags.0': { $exists: true } },
            { aiFlags: { $exists: true, $ne: null } },
          ],
        },
      ],
    }

    const [
      totalThreads,
      totalPosts,
      flaggedPostsCount,
      activeUsersAgg,
      flaggedPreview,
    ] = await Promise.all([
      Thread.countDocuments({}),
      Post.countDocuments({ status: { $ne: 'removed' } }),
      Post.countDocuments(flaggedMatch),
      // active users = distinct authors who posted in last 30 days
      Post.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$authorId' } },
        { $count: 'count' },
      ]),
      // recent flagged posts preview
      Post.aggregate([
        { $match: flaggedMatch },
        { $sort: { updatedAt: -1 } },
        { $limit: 10 },

        // Get last manual flag (if any)
        {
          $addFields: {
            lastFlag: {
              $cond: [
                { $gt: [{ $size: '$flags' }, 0] },
                { $arrayElemAt: ['$flags', -1] },
                null,
              ],
            },
          },
        },

        // Lookup author
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
          },
        },
        { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },

        {
          $project: {
            _id: 1,
            body: '$content',
            createdAt: 1,
            flaggedAt: {
              $ifNull: ['$lastFlag.createdAt', '$updatedAt'],
            },
            reason: {
              $ifNull: [
                '$lastFlag.reason',
                {
                  $ifNull: ['$aiFlags.reason', 'Flagged'],
                },
              ],
            },
            'author._id': 1,
            'author.username': 1,
          },
        },
      ]),
    ])

    const activeUsers =
      activeUsersAgg && activeUsersAgg[0]?.count ? activeUsersAgg[0].count : 0

    // Map preview into your frontend FlaggedPost DTO
    const flaggedPosts = flaggedPreview.map((p: any) => ({
      id: p._id.toString(),
      author: {
        id: p.author?._id?.toString() || '',
        username: p.author?.username || 'Unknown',
      },
      body: p.body,
      reason: p.reason,
      createdAt: p.createdAt.toISOString(),
      flaggedAt: (p.flaggedAt || p.createdAt).toISOString(),
    }))
    console.log({
      stats: {
        totalThreads,
        totalPosts,
        flaggedPosts: flaggedPostsCount,
        activeUsers,
      },
      flaggedPosts,
    })
    res.json({
      stats: {
        totalThreads,
        totalPosts,
        flaggedPosts: flaggedPostsCount,
        activeUsers,
      },
      flaggedPosts,
    })
  }
)

export default router
