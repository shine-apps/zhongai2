import { db } from '~/server/db'
import { feedbacks, users } from '~/server/db/schema'
import { eq, and, desc, count, sql } from 'drizzle-orm'
import { createErrorResponse, ResponseCode } from '~/server/utils/response'
import { parsePaginationQuery } from '~/server/utils/pagination'

type FeedbackType = 'suggestion' | 'bug' | 'complaint' | 'question' | 'other'

const feedbackSelectFields = {
  id: feedbacks.id,
  userId: feedbacks.userId,
  type: feedbacks.type,
  title: feedbacks.title,
  content: feedbacks.content,
  images: feedbacks.images,
  contactInfo: feedbacks.contactInfo,
  status: feedbacks.status,
  priority: feedbacks.priority,
  assignedTo: feedbacks.assignedTo,
  response: feedbacks.response,
  responseTime: feedbacks.responseTime,
  resolvedTime: feedbacks.resolvedTime,
  userRating: feedbacks.userRating,
  userRatingNote: feedbacks.userRatingNote,
  createdAt: feedbacks.createdAt,
  updatedAt: feedbacks.updatedAt,
  userNickname: users.nickname,
  userAvatar: users.avatarUrl,
}

function getPriorityByType(type: FeedbackType): string {
  switch (type) {
    case 'complaint':
      return 'high'
    case 'bug':
      return 'normal'
    case 'suggestion':
      return 'low'
    default:
      return 'normal'
  }
}

async function findFeedbackOrThrow(feedbackId: string) {
  const [feedback] = await db
    .select()
    .from(feedbacks)
    .where(eq(feedbacks.id, feedbackId))
    .limit(1)

  if (!feedback) {
    throw createErrorResponse(404, '反馈不存在', ResponseCode.NOT_FOUND)
  }

  return feedback
}

export async function createFeedback(
  userId: string,
  data: {
    type: FeedbackType
    title: string
    content: string
    images?: string[]
    contactInfo?: string
  }
) {
  if (!data.title || data.title.trim() === '') {
    throw createErrorResponse(422, '标题不能为空', ResponseCode.VALIDATION_ERROR)
  }

  if (!data.content || data.content.trim() === '') {
    throw createErrorResponse(422, '内容不能为空', ResponseCode.VALIDATION_ERROR)
  }

  const priority = getPriorityByType(data.type)

  const [feedback] = await db
    .insert(feedbacks)
    .values({
      userId,
      type: data.type,
      title: data.title,
      content: data.content,
      images: data.images,
      contactInfo: data.contactInfo,
      status: 'pending',
      priority,
    })
    .returning()

  return feedback
}

export async function getMyFeedbacks(
  userId: string,
  query: { page?: number | string; pageSize?: number | string; status?: string }
) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = [eq(feedbacks.userId, userId)]
  if (query.status) conditions.push(eq(feedbacks.status, query.status))

  const where = and(...conditions)

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(feedbacks)
    .where(where)

  const list = await db
    .select()
    .from(feedbacks)
    .where(where)
    .orderBy(desc(feedbacks.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

export async function getFeedbackById(feedbackId: string, userId: string, role: string) {
  const [feedback] = await db
    .select(feedbackSelectFields)
    .from(feedbacks)
    .leftJoin(users, eq(feedbacks.userId, users.id))
    .where(eq(feedbacks.id, feedbackId))
    .limit(1)

  if (!feedback) {
    throw createErrorResponse(404, '反馈不存在', ResponseCode.NOT_FOUND)
  }

  if (role !== 'admin' && feedback.userId !== userId) {
    throw createErrorResponse(403, '无权查看此反馈', ResponseCode.FORBIDDEN)
  }

  return feedback
}

export async function rateFeedback(
  feedbackId: string,
  userId: string,
  data: { rating: number; ratingNote?: string }
) {
  if (data.rating < 1 || data.rating > 5) {
    throw createErrorResponse(400, '评分必须在1-5之间', ResponseCode.BAD_REQUEST)
  }

  const feedback = await findFeedbackOrThrow(feedbackId)

  if (feedback.userId !== userId) {
    throw createErrorResponse(403, '无权评分此反馈', ResponseCode.FORBIDDEN)
  }

  if (feedback.status !== 'resolved') {
    throw createErrorResponse(400, '只有已解决的反馈才能评分', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(feedbacks)
    .set({
      userRating: data.rating,
      userRatingNote: data.ratingNote,
      updatedAt: new Date(),
    })
    .where(eq(feedbacks.id, feedbackId))
    .returning()

  return updated
}

export async function processFeedback(
  feedbackId: string,
  adminId: string,
  data: { response: string },
  role?: string
) {
  if (role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }

  const feedback = await findFeedbackOrThrow(feedbackId)

  if (feedback.status !== 'pending') {
    throw createErrorResponse(400, '只有待处理的反馈才能开始处理', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(feedbacks)
    .set({
      status: 'processing',
      assignedTo: adminId,
      response: data.response,
      responseTime: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feedbacks.id, feedbackId))
    .returning()

  return updated
}

export async function resolveFeedback(
  feedbackId: string,
  adminId: string,
  data: { response: string }
) {
  const feedback = await findFeedbackOrThrow(feedbackId)

  if (feedback.status !== 'processing') {
    throw createErrorResponse(400, '只有处理中的反馈才能标记为已解决', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(feedbacks)
    .set({
      status: 'resolved',
      response: data.response,
      resolvedTime: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feedbacks.id, feedbackId))
    .returning()

  return updated
}

export async function closeFeedback(
  feedbackId: string,
  adminId: string,
  data: { response: string }
) {
  const feedback = await findFeedbackOrThrow(feedbackId)

  if (feedback.status === 'closed') {
    throw createErrorResponse(400, '反馈已关闭', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(feedbacks)
    .set({
      status: 'closed',
      response: data.response,
      updatedAt: new Date(),
    })
    .where(eq(feedbacks.id, feedbackId))
    .returning()

  return updated
}

export async function getFeedbackStats() {
  const statusStats = await db
    .select({
      status: feedbacks.status,
      count: count(),
    })
    .from(feedbacks)
    .groupBy(feedbacks.status)

  const typeStats = await db
    .select({
      type: feedbacks.type,
      count: count(),
    })
    .from(feedbacks)
    .groupBy(feedbacks.type)

  const [ratingResult] = await db
    .select({
      avgRating: sql<string>`CAST(AVG(${feedbacks.userRating}) AS DECIMAL(10,1))`,
    })
    .from(feedbacks)
    .where(eq(feedbacks.status, 'resolved'))

  const byStatus: Record<string, number> = {}
  for (const row of statusStats) {
    byStatus[row.status] = Number(row.count)
  }

  const byType: Record<string, number> = {}
  for (const row of typeStats) {
    byType[row.type] = Number(row.count)
  }

  return {
    byStatus,
    byType,
    avgRating: ratingResult?.avgRating ? Number(ratingResult.avgRating) : 0,
  }
}

export async function getFeedbackList(query: {
  page?: number | string
  pageSize?: number | string
  status?: string
  type?: string
}) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = []
  if (query.status) conditions.push(eq(feedbacks.status, query.status))
  if (query.type) conditions.push(eq(feedbacks.type, query.type))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(feedbacks)
    .where(where)

  const list = await db
    .select(feedbackSelectFields)
    .from(feedbacks)
    .leftJoin(users, eq(feedbacks.userId, users.id))
    .where(where)
    .orderBy(desc(feedbacks.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

export async function getFeedbackByIdAdmin(feedbackId: string) {
  const [feedback] = await db
    .select(feedbackSelectFields)
    .from(feedbacks)
    .leftJoin(users, eq(feedbacks.userId, users.id))
    .where(eq(feedbacks.id, feedbackId))
    .limit(1)

  if (!feedback) {
    throw createErrorResponse(404, '反馈不存在', ResponseCode.NOT_FOUND)
  }

  return feedback
}
