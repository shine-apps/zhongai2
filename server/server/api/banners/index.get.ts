import { db } from '#server/db'
import { banners } from '#server/db/schema'
import { eq, and, lte, gte, or, isNull, asc } from 'drizzle-orm'
import { success } from '#server/utils/response'

export default defineEventHandler(async () => {
  const now = new Date()

  const activeBanners = await db
    .select({
      id: banners.id,
      title: banners.title,
      image: banners.imageUrl,
      link: banners.linkValue,
      linkType: banners.linkType,
      sortOrder: banners.sortOrder,
    })
    .from(banners)
    .where(
      and(
        eq(banners.isActive, true),
        or(isNull(banners.startAt), lte(banners.startAt, now)),
        or(isNull(banners.endAt), gte(banners.endAt, now)),
      ),
    )
    .orderBy(asc(banners.sortOrder))

  return success(activeBanners)
})
