import { eq, and, like, or, desc, count, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { marketPosts, marketFavorites, users } from '~/server/db/schema'
import { createErrorResponse } from '~/server/utils/response'
import { maskPhone } from '~/server/utils/encryption'

const VALID_POST_TYPES = ['job', 'resume', 'idle'] as const
const VALID_STATUSES = ['pending', 'approved', 'rejected'] as const
const VALID_REVIEW_STATUSES = ['approved', 'rejected'] as const

type PostType = typeof VALID_POST_TYPES[number]
type PostStatus = typeof VALID_STATUSES[number]
type ReviewStatus = typeof VALID_REVIEW_STATUSES[number]

export interface CreateMarketPostData {
  postType: PostType
  title: string
  content: string
  images?: string[]
  contactInfo?: string
  location?: string
  price?: number
}

export interface GetMarketPostsParams {
  page?: number
  pageSize?: number
  postType?: PostType
  keyword?: string
}

export interface ReviewMarketPostData {
  status: ReviewStatus
  reviewNote?: string
}

function maskContactInfo(contactInfo?: string): string | undefined {
  if (!contactInfo) return undefined
  if (/^\d{11}$/.test(contactInfo)) {
    return maskPhone(contactInfo)
  }
  return contactInfo
}

function validateCreatePostData(data: CreateMarketPostData): void {
  if (!VALID_POST_TYPES.includes(data.postType)) {
    throw createErrorResponse(422, 'Invalid post type')
  }
  if (!data.title || data.title.length < 5 || data.title.length > 100) {
    throw createErrorResponse(422, 'Title must be between 5 and 100 characters')
  }
  if (!data.content || data.content.length < 20 || data.content.length > 2000) {
    throw createErrorResponse(422, 'Content must be between 20 and 2000 characters')
  }
  if (data.images && data.images.length > 9) {
    throw createErrorResponse(422, 'Maximum 9 images allowed')
  }
  if (data.postType === 'idle' && data.price !== undefined && data.price < 0) {
    throw createErrorResponse(422, 'Price cannot be negative')
  }
}

export async function createMarketPost(userId: string, data: CreateMarketPostData) {
  validateCreatePostData(data)

  const result = await db.insert(marketPosts).values({
    userId,
    postType: data.postType,
    title: data.title,
    content: data.content,
    images: data.images || [],
    contactInfo: data.contactInfo,
    location: data.location,
    price: data.price,
    status: 'pending',
  }).returning()

  if (!result.length) {
    throw createErrorResponse(500, 'Failed to create post')
  }

  return result[0]
}

export async function getMarketPosts(
  params: GetMarketPostsParams,
  currentUserId?: string
) {
  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const offset = (page - 1) * pageSize

  const whereConditions = [eq(marketPosts.status, 'approved')]

  if (params.postType) {
    whereConditions.push(eq(marketPosts.postType, params.postType))
  }

  if (params.keyword) {
    whereConditions.push(or(
      like(marketPosts.title, `%${params.keyword}%`),
      like(marketPosts.content, `%${params.keyword}%`)
    ))
  }

  const where = and(...whereConditions)

  const [totalResult] = await db.select({ count: count() }).from(marketPosts).where(where)
  const total = totalResult.count

  const postsWithUser = await db
    .select({
      post: marketPosts,
      user: {
        id: users.id,
        nickname: users.nickname,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(marketPosts)
    .leftJoin(users, eq(marketPosts.userId, users.id))
    .where(where)
    .orderBy(desc(marketPosts.createdAt))
    .limit(pageSize)
    .offset(offset)

  let userFavorites = new Set<string>()
  if (currentUserId) {
    const favorites = await db
      .select({ postId: marketFavorites.postId })
      .from(marketFavorites)
      .where(eq(marketFavorites.userId, currentUserId))
    userFavorites = new Set(favorites.map(f => f.postId))
  }

  const list = postsWithUser.map(({ post, user }) => {
    const safePost = post || {} as any
    return {
      ...safePost,
      user,
      isFavorited: safePost.id ? userFavorites.has(safePost.id) : false,
      contactInfo: maskContactInfo(safePost.contactInfo),
    }
  })

  return {
    list,
    total,
    page,
    pageSize,
  }
}

export async function getMarketPostById(postId: string, currentUserId?: string) {
  const postsWithUser = await db
    .select({
      post: marketPosts,
      user: {
        id: users.id,
        nickname: users.nickname,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(marketPosts)
    .leftJoin(users, eq(marketPosts.userId, users.id))
    .where(eq(marketPosts.id, postId))
    .limit(1)

  if (!postsWithUser.length) {
    throw createErrorResponse(404, 'Post not found')
  }

  const { post, user } = postsWithUser[0]

  let isFavorited = false
  if (currentUserId) {
    const favorite = await db
      .select()
      .from(marketFavorites)
      .where(and(
        eq(marketFavorites.postId, postId),
        eq(marketFavorites.userId, currentUserId)
      ))
      .limit(1)
    isFavorited = favorite.length > 0
  }

  await db.update(marketPosts)
    .set({ viewCount: sql`${marketPosts.viewCount} + 1` })
    .where(eq(marketPosts.id, postId))

  const safePost = post || {} as any
  return {
    ...safePost,
    user,
    isFavorited,
    contactInfo: currentUserId ? safePost.contactInfo : maskContactInfo(safePost.contactInfo),
  }
}

export async function deleteMarketPost(userId: string, postId: string) {
  const existingPosts = await db
    .select()
    .from(marketPosts)
    .where(eq(marketPosts.id, postId))
    .limit(1)

  if (!existingPosts.length) {
    throw createErrorResponse(404, 'Post not found')
  }

  const post = existingPosts[0]
  if (post.userId !== userId) {
    throw createErrorResponse(403, 'Not authorized to delete this post')
  }

  const result = await db.delete(marketPosts)
    .where(eq(marketPosts.id, postId))
    .returning()

  return result[0]
}

export async function favoriteMarketPost(userId: string, postId: string) {
  const existingPosts = await db
    .select()
    .from(marketPosts)
    .where(eq(marketPosts.id, postId))
    .limit(1)

  if (!existingPosts.length) {
    throw createErrorResponse(404, 'Post not found')
  }

  try {
    await db.insert(marketFavorites).values({
      postId,
      userId,
    })
  } catch (error) {
    const post = await db.select().from(marketPosts).where(eq(marketPosts.id, postId)).limit(1)
    return post[0]
  }

  const updatedPosts = await db.update(marketPosts)
    .set({ favoriteCount: sql`${marketPosts.favoriteCount} + 1` })
    .where(eq(marketPosts.id, postId))
    .returning()

  return updatedPosts[0]
}

export async function unfavoriteMarketPost(userId: string, postId: string) {
  const existingPosts = await db
    .select()
    .from(marketPosts)
    .where(eq(marketPosts.id, postId))
    .limit(1)

  if (!existingPosts.length) {
    throw createErrorResponse(404, 'Post not found')
  }

  await db.delete(marketFavorites)
    .where(and(
      eq(marketFavorites.postId, postId),
      eq(marketFavorites.userId, userId)
    ))

  const updatedPosts = await db.update(marketPosts)
    .set({ favoriteCount: sql`GREATEST(${marketPosts.favoriteCount} - 1, 0)` })
    .where(eq(marketPosts.id, postId))
    .returning()

  return updatedPosts[0]
}

export async function getMyMarketPosts(userId: string, params: GetMarketPostsParams) {
  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const offset = (page - 1) * pageSize

  const whereConditions = [eq(marketPosts.userId, userId)]

  if (params.postType) {
    whereConditions.push(eq(marketPosts.postType, params.postType))
  }

  const where = and(...whereConditions)

  const [totalResult] = await db.select({ count: count() }).from(marketPosts).where(where)
  const total = totalResult.count

  const list = await db
    .select()
    .from(marketPosts)
    .where(where)
    .orderBy(desc(marketPosts.createdAt))
    .limit(pageSize)
    .offset(offset)

  return {
    list,
    total,
    page,
    pageSize,
  }
}

export async function getPendingMarketPosts(params: GetMarketPostsParams) {
  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const offset = (page - 1) * pageSize

  const where = eq(marketPosts.status, 'pending')

  const [totalResult] = await db.select({ count: count() }).from(marketPosts).where(where)
  const total = totalResult.count

  const postsWithUser = await db
    .select({
      post: marketPosts,
      user: {
        id: users.id,
        nickname: users.nickname,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(marketPosts)
    .leftJoin(users, eq(marketPosts.userId, users.id))
    .where(where)
    .orderBy(desc(marketPosts.createdAt))
    .limit(pageSize)
    .offset(offset)

  const list = postsWithUser.map(({ post, user }) => ({
    ...post,
    user,
  }))

  return {
    list,
    total,
    page,
    pageSize,
  }
}

export async function reviewMarketPost(
  reviewerId: string,
  postId: string,
  status: ReviewStatus,
  reviewNote?: string
) {
  if (!VALID_REVIEW_STATUSES.includes(status)) {
    throw createErrorResponse(422, 'Invalid review status')
  }

  const existingPosts = await db
    .select()
    .from(marketPosts)
    .where(eq(marketPosts.id, postId))
    .limit(1)

  if (!existingPosts.length) {
    throw createErrorResponse(404, 'Post not found')
  }

  if (existingPosts[0].status !== 'pending') {
    throw createErrorResponse(400, 'Post is already reviewed')
  }

  const updatedPosts = await db.update(marketPosts)
    .set({
      status,
      reviewerId,
      reviewNote,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(marketPosts.id, postId))
    .returning()

  return updatedPosts[0]
}
