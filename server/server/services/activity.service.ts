import { db } from '#server/db'
import { activities, activityRegistrations, users } from '#server/db/schema'
import { eq, ne, and, ilike, desc, sql, count, gte, lte } from 'drizzle-orm'
import { createErrorResponse, ResponseCode } from '#server/utils/response'
import { parsePaginationQuery } from '#server/utils/pagination'

export function requireLeaderOrAdmin(event: any) {
  const auth = event.context.auth
  if (!auth || (auth.role !== 'leader' && auth.role !== 'admin')) {
    throw createErrorResponse(403, '需要团长或管理员权限', ResponseCode.FORBIDDEN)
  }
  return auth
}

export async function requireOrganizerOrAdmin(event: any, activityId: string) {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }
  if (auth.role === 'admin') return auth

  const [activity] = await db
    .select({ organizerId: activities.organizerId })
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!activity) {
    throw createErrorResponse(404, '活动不存在', ResponseCode.NOT_FOUND)
  }
  if (activity.organizerId !== auth.userId) {
    throw createErrorResponse(403, '需要活动组织者或管理员权限', ResponseCode.FORBIDDEN)
  }
  return auth
}

export async function getActivityList(query: {
  page?: number | string
  pageSize?: number | string
  category?: string
  status?: string
  keyword?: string
  startDate?: string
  endDate?: string
}) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = []
  if (query.category) conditions.push(eq(activities.category, query.category))
  if (query.status) conditions.push(eq(activities.status, query.status))
  if (query.keyword) conditions.push(ilike(activities.title, `%${query.keyword}%`))
  if (query.startDate) conditions.push(gte(activities.startTime, new Date(query.startDate)))
  if (query.endDate) conditions.push(lte(activities.endTime, new Date(query.endDate)))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(activities)
    .where(where)

  const list = await db
    .select({
      id: activities.id,
      title: activities.title,
      category: activities.category,
      description: activities.description,
      coverImage: activities.coverImage,
      startTime: activities.startTime,
      endTime: activities.endTime,
      location: activities.location,
      latitude: activities.latitude,
      longitude: activities.longitude,
      checkinRadius: activities.checkinRadius,
      maxParticipants: activities.maxParticipants,
      currentParticipants: activities.currentParticipants,
      rewardPoints: activities.rewardPoints,
      status: activities.status,
      organizerId: activities.organizerId,
      publishedAt: activities.publishedAt,
      createdAt: activities.createdAt,
      updatedAt: activities.updatedAt,
      organizerName: users.nickname,
      organizerAvatar: users.avatarUrl,
    })
    .from(activities)
    .leftJoin(users, eq(activities.organizerId, users.id))
    .where(where)
    .orderBy(desc(activities.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

export async function getActivityById(activityId: string, currentUserId?: string) {
  const [activity] = await db
    .select({
      id: activities.id,
      title: activities.title,
      category: activities.category,
      description: activities.description,
      coverImage: activities.coverImage,
      startTime: activities.startTime,
      endTime: activities.endTime,
      location: activities.location,
      latitude: activities.latitude,
      longitude: activities.longitude,
      checkinRadius: activities.checkinRadius,
      maxParticipants: activities.maxParticipants,
      currentParticipants: activities.currentParticipants,
      rewardPoints: activities.rewardPoints,
      status: activities.status,
      organizerId: activities.organizerId,
      publishedAt: activities.publishedAt,
      createdAt: activities.createdAt,
      updatedAt: activities.updatedAt,
      organizerName: users.nickname,
      organizerAvatar: users.avatarUrl,
    })
    .from(activities)
    .leftJoin(users, eq(activities.organizerId, users.id))
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!activity) {
    throw createErrorResponse(404, '活动不存在', ResponseCode.NOT_FOUND)
  }

  let isRegistered = false
  if (currentUserId) {
    const [reg] = await db
      .select({ id: activityRegistrations.id })
      .from(activityRegistrations)
      .where(and(
        eq(activityRegistrations.activityId, activityId),
        eq(activityRegistrations.userId, currentUserId),
        ne(activityRegistrations.status, 'cancelled'),
      ))
      .limit(1)
    isRegistered = !!reg
  }

  return { ...activity, isRegistered }
}

export async function createActivity(data: any, organizerId: string) {
  const [activity] = await db
    .insert(activities)
    .values({
      title: data.title,
      category: data.category,
      description: data.description,
      coverImage: data.coverImage,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      checkinRadius: data.checkinRadius,
      maxParticipants: data.maxParticipants,
      rewardPoints: data.rewardPoints,
      organizerId,
      status: 'draft',
    })
    .returning()

  return activity
}

export async function updateActivity(activityId: string, data: any, userId: string, role: string) {
  const [existing] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '活动不存在', ResponseCode.NOT_FOUND)
  }

  if (role !== 'admin' && existing.organizerId !== userId) {
    throw createErrorResponse(403, '需要活动组织者或管理员权限', ResponseCode.FORBIDDEN)
  }

  const updateData: Record<string, any> = { updatedAt: new Date() }
  const allowedFields = [
    'title', 'category', 'description', 'coverImage',
    'startTime', 'endTime', 'location', 'latitude', 'longitude',
    'checkinRadius', 'maxParticipants', 'rewardPoints',
  ]

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field]
    }
  }

  const [updated] = await db
    .update(activities)
    .set(updateData)
    .where(eq(activities.id, activityId))
    .returning()

  return updated
}

export async function publishActivity(activityId: string, userId: string, role: string) {
  const [existing] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '活动不存在', ResponseCode.NOT_FOUND)
  }

  if (role !== 'admin' && existing.organizerId !== userId) {
    throw createErrorResponse(403, '需要活动组织者或管理员权限', ResponseCode.FORBIDDEN)
  }

  if (existing.status !== 'draft') {
    throw createErrorResponse(400, '只有草稿状态的活动才能发布', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(activities)
    .set({
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activityId))
    .returning()

  return updated
}

export async function cancelActivity(activityId: string, userId: string, role: string) {
  const [existing] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '活动不存在', ResponseCode.NOT_FOUND)
  }

  if (role !== 'admin' && existing.organizerId !== userId) {
    throw createErrorResponse(403, '需要活动组织者或管理员权限', ResponseCode.FORBIDDEN)
  }

  if (existing.status === 'cancelled') {
    throw createErrorResponse(400, '活动已取消', ResponseCode.BAD_REQUEST)
  }

  if (existing.status === 'completed') {
    throw createErrorResponse(400, '已完成的活动不能取消', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(activities)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activityId))
    .returning()

  return updated
}

export async function deleteActivity(activityId: string, userId: string, role: string) {
  const [existing] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '活动不存在', ResponseCode.NOT_FOUND)
  }

  if (role !== 'admin' && existing.organizerId !== userId) {
    throw createErrorResponse(403, '需要活动组织者或管理员权限', ResponseCode.FORBIDDEN)
  }

  if (existing.status !== 'draft') {
    throw createErrorResponse(400, '只有草稿状态的活动才能删除', ResponseCode.BAD_REQUEST)
  }

  await db.delete(activities).where(eq(activities.id, activityId))
}

export async function registerActivity(activityId: string, userId: string, remark?: string) {
  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!activity) {
    throw createErrorResponse(404, '活动不存在', ResponseCode.NOT_FOUND)
  }

  if (activity.status !== 'published' && activity.status !== 'ongoing') {
    throw createErrorResponse(400, '活动未开放报名', ResponseCode.BAD_REQUEST)
  }

  if (activity.maxParticipants !== null && activity.currentParticipants >= activity.maxParticipants) {
    throw createErrorResponse(400, '活动人数已满', ResponseCode.BAD_REQUEST)
  }

  if (activity.organizerId === userId) {
    throw createErrorResponse(400, '组织者不能报名自己的活动', ResponseCode.BAD_REQUEST)
  }

  const [existingReg] = await db
    .select()
    .from(activityRegistrations)
    .where(and(
      eq(activityRegistrations.activityId, activityId),
      eq(activityRegistrations.userId, userId),
    ))
    .limit(1)

  if (existingReg && existingReg.status !== 'cancelled') {
    throw createErrorResponse(409, '已经报名该活动', ResponseCode.CONFLICT)
  }

  let registration: any

  await db.transaction(async (tx) => {
    if (existingReg) {
      const [updated] = await tx
        .update(activityRegistrations)
        .set({ status: 'pending', remark: remark ?? existingReg.remark, updatedAt: new Date() })
        .where(eq(activityRegistrations.id, existingReg.id))
        .returning()
      registration = updated
    } else {
      const [inserted] = await tx
        .insert(activityRegistrations)
        .values({ activityId, userId, remark, status: 'pending' })
        .returning()
      registration = inserted
    }

    await tx
      .update(activities)
      .set({ currentParticipants: sql`${activities.currentParticipants} + 1` })
      .where(eq(activities.id, activityId))
  })

  return registration
}

export async function cancelRegistration(activityId: string, userId: string) {
  const [registration] = await db
    .select()
    .from(activityRegistrations)
    .where(and(
      eq(activityRegistrations.activityId, activityId),
      eq(activityRegistrations.userId, userId),
    ))
    .limit(1)

  if (!registration) {
    throw createErrorResponse(404, '报名记录不存在', ResponseCode.NOT_FOUND)
  }

  if (registration.status === 'cancelled') {
    throw createErrorResponse(400, '报名已取消', ResponseCode.BAD_REQUEST)
  }

  await db.transaction(async (tx) => {
    await tx
      .update(activityRegistrations)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(activityRegistrations.id, registration.id))

    await tx
      .update(activities)
      .set({ currentParticipants: sql`GREATEST(${activities.currentParticipants} - 1, 0)` })
      .where(eq(activities.id, activityId))
  })
}

export async function getRegistrations(activityId: string, query: { page?: number | string; pageSize?: number | string }) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(activityRegistrations)
    .where(eq(activityRegistrations.activityId, activityId))

  const list = await db
    .select({
      id: activityRegistrations.id,
      activityId: activityRegistrations.activityId,
      userId: activityRegistrations.userId,
      status: activityRegistrations.status,
      remark: activityRegistrations.remark,
      createdAt: activityRegistrations.createdAt,
      updatedAt: activityRegistrations.updatedAt,
      userName: users.nickname,
      userAvatar: users.avatarUrl,
    })
    .from(activityRegistrations)
    .leftJoin(users, eq(activityRegistrations.userId, users.id))
    .where(eq(activityRegistrations.activityId, activityId))
    .orderBy(desc(activityRegistrations.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

export async function getMyRegistration(activityId: string, userId: string) {
  const [registration] = await db
    .select()
    .from(activityRegistrations)
    .where(and(
      eq(activityRegistrations.activityId, activityId),
      eq(activityRegistrations.userId, userId),
    ))
    .limit(1)

  return registration || null
}
