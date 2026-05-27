import { db } from '~/server/db'
import { banners } from '~/server/db/schema'
import { eq, and, or, isNull, gte, lte, asc, desc, count, sql } from 'drizzle-orm'
import { createErrorResponse, ResponseCode } from '~/server/utils/response'
import { parsePaginationQuery } from '~/server/utils/pagination'

export function requireAdmin(event: any) {
  const auth = event.context.auth
  if (!auth || auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }
  return auth
}

export async function getActiveBanners(position: string) {
  const now = new Date()
  
  const result = await db
    .select()
    .from(banners)
    .where(and(
      eq(banners.position, position),
      eq(banners.status, 'published'),
      or(
        isNull(banners.startTime),
        lte(banners.startTime, now)
      ),
      or(
        isNull(banners.endTime),
        gte(banners.endTime, now)
      )
    ))
    .orderBy(asc(banners.sortOrder))

  return result
}

export async function getBannerList(query: {
  page?: number | string
  pageSize?: number | string
  position?: string
  status?: string
}) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = []
  if (query.position) conditions.push(eq(banners.position, query.position))
  if (query.status) conditions.push(eq(banners.status, query.status))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(banners)
    .where(where)

  const list = await db
    .select()
    .from(banners)
    .where(where)
    .orderBy(desc(banners.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

export async function getBannerById(bannerId: string) {
  const [banner] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, bannerId))
    .limit(1)

  if (!banner) {
    throw createErrorResponse(404, '轮播图不存在', ResponseCode.NOT_FOUND)
  }

  return banner
}

export async function createBanner(data: any, createdBy: string) {
  const [banner] = await db
    .insert(banners)
    .values({
      position: data.position,
      title: data.title,
      imageUrl: data.imageUrl,
      linkType: data.linkType || 'none',
      linkValue: data.linkValue,
      sortOrder: data.sortOrder ?? 0,
      status: 'draft',
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      createdBy,
    })
    .returning()

  return banner
}

export async function updateBanner(bannerId: string, data: any, updatedBy: string) {
  const [existing] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, bannerId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '轮播图不存在', ResponseCode.NOT_FOUND)
  }

  const updateData: Record<string, any> = { updatedAt: new Date(), updatedBy }
  const allowedFields = [
    'position', 'title', 'imageUrl', 'linkType', 'linkValue', 
    'sortOrder', 'startTime', 'endTime'
  ]

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (field === 'startTime' || field === 'endTime') {
        updateData[field] = data[field] ? new Date(data[field]) : null
      } else {
        updateData[field] = data[field]
      }
    }
  }

  const [updated] = await db
    .update(banners)
    .set(updateData)
    .where(eq(banners.id, bannerId))
    .returning()

  return updated
}

export async function deleteBanner(bannerId: string) {
  const [existing] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, bannerId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '轮播图不存在', ResponseCode.NOT_FOUND)
  }

  await db.delete(banners).where(eq(banners.id, bannerId))
}

export async function updateBannerStatus(bannerId: string, status: string, updatedBy: string) {
  const [existing] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, bannerId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '轮播图不存在', ResponseCode.NOT_FOUND)
  }

  const [updated] = await db
    .update(banners)
    .set({ status, updatedAt: new Date(), updatedBy })
    .where(eq(banners.id, bannerId))
    .returning()

  return updated
}

export async function recordBannerClick(bannerId: string) {
  const [existing] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, bannerId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '轮播图不存在', ResponseCode.NOT_FOUND)
  }

  const [updated] = await db
    .update(banners)
    .set({ clickCount: sql`${banners.clickCount} + 1` })
    .where(eq(banners.id, bannerId))
    .returning()

  return updated
}
