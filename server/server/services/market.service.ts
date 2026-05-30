import { db } from '#server/db'
import { marketPosts, marketFavorites, users } from '#server/db/schema'
import { eq, and, desc, count, sql, or, like } from 'drizzle-orm'
import { createErrorResponse, ResponseCode } from '#server/utils/response'
import { parsePaginationQuery } from '#server/utils/pagination'
import { maskPhone } from '#server/utils/encryption'

/**
 * Mask contact info for list views (privacy protection)
 * Phone: 13800138000 -> 138****8000
 * General: abc123 -> ab****23
 */
function maskContactInfo(contact: string | null): string | null {
  if (!contact) return null
  // Phone number pattern
  if (/^\d{11}$/.test(contact)) {
    return maskPhone(contact)
  }
  // General masking
  if (contact.length <= 4) return contact
  return contact.substring(0, 2) + '****' + contact.substring(contact.length - 2)
}

/**
 * Create a new market post (status=pending, awaiting review)
 */
export async function createPost(
  userId: string,
  data: {
    type: string
    title: string
    content: string
    images?: string[]
    contactInfo?: string
    location?: string
    price?: number
  }
) {
  const [post] = await db
    .insert(marketPosts)
    .values({
      userId,
      type: data.type,
      title: data.title,
      content: data.content,
      images: data.images || [],
      contactInfo: data.contactInfo,
      location: data.location,
      price: data.price?.toString(),
      status: 'pending',
    })
    .returning()

  return post
}

/**
 * Get a post by ID with user info. Increments view count.
 * If userId is provided, also returns isFavorited status.
 */
export async function getPostById(id: string, userId?: string) {
  const [post] = await db
    .select({
      id: marketPosts.id,
      userId: marketPosts.userId,
      type: marketPosts.type,
      title: marketPosts.title,
      content: marketPosts.content,
      images: marketPosts.images,
      contactInfo: marketPosts.contactInfo,
      location: marketPosts.location,
      price: marketPosts.price,
      status: marketPosts.status,
      viewCount: marketPosts.viewCount,
      favoriteCount: marketPosts.favoriteCount,
      reviewNote: marketPosts.reviewNote,
      createdAt: marketPosts.createdAt,
      updatedAt: marketPosts.updatedAt,
      authorNickname: users.nickname,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(marketPosts)
    .leftJoin(users, eq(marketPosts.userId, users.id))
    .where(eq(marketPosts.id, id))
    .limit(1)

  if (!post) {
    throw createErrorResponse(404, '帖子不存在', ResponseCode.NOT_FOUND)
  }

  // Increment view count
  await db
    .update(marketPosts)
    .set({ viewCount: sql`${marketPosts.viewCount} + 1`, updatedAt: new Date() })
    .where(eq(marketPosts.id, id))

  // Check if current user has favorited this post
  let isFavorited = false
  if (userId) {
    const [fav] = await db
      .select()
      .from(marketFavorites)
      .where(and(eq(marketFavorites.postId, id), eq(marketFavorites.userId, userId)))
      .limit(1)
    isFavorited = !!fav
  }

  return {
    ...post,
    viewCount: post.viewCount + 1,
    isFavorited,
  }
}

/**
 * Get public post list (only approved posts), with optional filters.
 * Contact info is masked for privacy in list view.
 */
export async function getPublicPosts(query: {
  page?: number | string
  pageSize?: number | string
  type?: string
  keyword?: string
}, userId?: string) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = [eq(marketPosts.status, 'approved')]
  if (query.type) conditions.push(eq(marketPosts.type, query.type))
  if (query.keyword) {
    conditions.push(
      or(
        like(marketPosts.title, `%${query.keyword}%`),
        like(marketPosts.content, `%${query.keyword}%`)
      )!
    )
  }

  const where = and(...conditions)

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(marketPosts)
    .where(where)

  const list = await db
    .select({
      id: marketPosts.id,
      userId: marketPosts.userId,
      type: marketPosts.type,
      title: marketPosts.title,
      content: marketPosts.content,
      images: marketPosts.images,
      contactInfo: marketPosts.contactInfo,
      location: marketPosts.location,
      price: marketPosts.price,
      status: marketPosts.status,
      viewCount: marketPosts.viewCount,
      favoriteCount: marketPosts.favoriteCount,
      createdAt: marketPosts.createdAt,
      updatedAt: marketPosts.updatedAt,
      authorNickname: users.nickname,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(marketPosts)
    .leftJoin(users, eq(marketPosts.userId, users.id))
    .where(where)
    .orderBy(desc(marketPosts.createdAt))
    .limit(pageSize)
    .offset(offset)

  // If userId provided, check which posts are favorited
  let favoriteSet = new Set<string>()
  if (userId && list.length > 0) {
    const postIds: string[] = list.map((p: any) => p.id)
    const favs = await db
      .select({ postId: marketFavorites.postId })
      .from(marketFavorites)
      .where(and(eq(marketFavorites.userId, userId), sql`${marketFavorites.postId} IN (${sql.join(postIds.map((id: string) => sql`${id}::uuid`), sql`, `)})`))

    favoriteSet = new Set(favs.map((f: any) => f.postId))
  }

  return {
    list: list.map((item: any) => ({
      ...item,
      contactInfo: maskContactInfo(item.contactInfo),
      isFavorited: favoriteSet.has(item.id),
    })),
    total,
    page,
    pageSize,
  }
}

/**
 * Get posts created by the current user
 */
export async function getMyPosts(
  userId: string,
  query: { page?: number | string; pageSize?: number | string; status?: string }
) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = [eq(marketPosts.userId, userId)]
  if (query.status) conditions.push(eq(marketPosts.status, query.status))

  const where = and(...conditions)

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(marketPosts)
    .where(where)

  const list = await db
    .select()
    .from(marketPosts)
    .where(where)
    .orderBy(desc(marketPosts.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

/**
 * Delete a post (only the author can delete)
 */
export async function deletePost(id: string, userId: string) {
  const [post] = await db
    .select()
    .from(marketPosts)
    .where(eq(marketPosts.id, id))
    .limit(1)

  if (!post) {
    throw createErrorResponse(404, '帖子不存在', ResponseCode.NOT_FOUND)
  }

  if (post.userId !== userId) {
    throw createErrorResponse(403, '只能删除自己发布的帖子', ResponseCode.FORBIDDEN)
  }

  await db.delete(marketPosts).where(eq(marketPosts.id, id))
}

/**
 * Toggle favorite status on a post.
 * Returns the new favorite state (true = favorited, false = unfavorited).
 */
export async function toggleFavorite(postId: string, userId: string): Promise<boolean> {
  // Check post exists
  const [post] = await db
    .select()
    .from(marketPosts)
    .where(eq(marketPosts.id, postId))
    .limit(1)

  if (!post) {
    throw createErrorResponse(404, '帖子不存在', ResponseCode.NOT_FOUND)
  }

  // Check if already favorited
  const [existing] = await db
    .select()
    .from(marketFavorites)
    .where(and(eq(marketFavorites.postId, postId), eq(marketFavorites.userId, userId)))
    .limit(1)

  if (existing) {
    // Unfavorite
    await db.transaction(async (tx: any) => {
      await tx
        .delete(marketFavorites)
        .where(and(eq(marketFavorites.postId, postId), eq(marketFavorites.userId, userId)))

      await tx
        .update(marketPosts)
        .set({
          favoriteCount: sql`GREATEST(${marketPosts.favoriteCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(marketPosts.id, postId))
    })
    return false
  } else {
    // Favorite
    await db.transaction(async (tx: any) => {
      await tx.insert(marketFavorites).values({ postId, userId })

      await tx
        .update(marketPosts)
        .set({
          favoriteCount: sql`${marketPosts.favoriteCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(marketPosts.id, postId))
    })
    return true
  }
}

/**
 * Get current user's favorited posts
 */
export async function getMyFavorites(
  userId: string,
  query: { page?: number | string; pageSize?: number | string }
) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(marketFavorites)
    .where(eq(marketFavorites.userId, userId))

  const list = await db
    .select({
      id: marketPosts.id,
      userId: marketPosts.userId,
      type: marketPosts.type,
      title: marketPosts.title,
      content: marketPosts.content,
      images: marketPosts.images,
      contactInfo: marketPosts.contactInfo,
      location: marketPosts.location,
      price: marketPosts.price,
      status: marketPosts.status,
      viewCount: marketPosts.viewCount,
      favoriteCount: marketPosts.favoriteCount,
      createdAt: marketPosts.createdAt,
      updatedAt: marketPosts.updatedAt,
      authorNickname: users.nickname,
      authorAvatarUrl: users.avatarUrl,
      favoritedAt: marketFavorites.createdAt,
    })
    .from(marketFavorites)
    .innerJoin(marketPosts, eq(marketFavorites.postId, marketPosts.id))
    .leftJoin(users, eq(marketPosts.userId, users.id))
    .where(eq(marketFavorites.userId, userId))
    .orderBy(desc(marketFavorites.createdAt))
    .limit(pageSize)
    .offset(offset)

  return {
    list: list.map((item) => ({
      ...item,
      contactInfo: maskContactInfo(item.contactInfo),
      isFavorited: true,
    })),
    total,
    page,
    pageSize,
  }
}

/**
 * Admin: get all posts with optional filters
 */
export async function getAdminPosts(query: {
  page?: number | string
  pageSize?: number | string
  status?: string
  type?: string
  keyword?: string
}) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = []
  if (query.status) conditions.push(eq(marketPosts.status, query.status))
  if (query.type) conditions.push(eq(marketPosts.type, query.type))
  if (query.keyword) {
    conditions.push(
      or(
        like(marketPosts.title, `%${query.keyword}%`),
        like(marketPosts.content, `%${query.keyword}%`)
      )!
    )
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(marketPosts)
    .where(where)

  const list = await db
    .select({
      id: marketPosts.id,
      userId: marketPosts.userId,
      type: marketPosts.type,
      title: marketPosts.title,
      content: marketPosts.content,
      images: marketPosts.images,
      contactInfo: marketPosts.contactInfo,
      location: marketPosts.location,
      price: marketPosts.price,
      status: marketPosts.status,
      viewCount: marketPosts.viewCount,
      favoriteCount: marketPosts.favoriteCount,
      reviewedBy: marketPosts.reviewedBy,
      reviewNote: marketPosts.reviewNote,
      createdAt: marketPosts.createdAt,
      updatedAt: marketPosts.updatedAt,
      authorNickname: users.nickname,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(marketPosts)
    .leftJoin(users, eq(marketPosts.userId, users.id))
    .where(where)
    .orderBy(desc(marketPosts.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

/**
 * Admin: review (approve/reject) a post
 */
export async function reviewPost(
  id: string,
  reviewerId: string,
  data: { status: 'approved' | 'rejected'; reviewNote?: string }
) {
  const [post] = await db
    .select()
    .from(marketPosts)
    .where(eq(marketPosts.id, id))
    .limit(1)

  if (!post) {
    throw createErrorResponse(404, '帖子不存在', ResponseCode.NOT_FOUND)
  }

  if (post.status !== 'pending') {
    throw createErrorResponse(400, '只有待审核的帖子才能审核', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(marketPosts)
    .set({
      status: data.status,
      reviewedBy: reviewerId,
      reviewNote: data.reviewNote,
      updatedAt: new Date(),
    })
    .where(eq(marketPosts.id, id))
    .returning()

  return updated
}
