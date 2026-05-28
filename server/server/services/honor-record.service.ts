import { db } from '~/server/db'
import { honorRecords } from '~/server/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
import { createErrorResponse, ResponseCode } from '~/server/utils/response'
import { parsePaginationQuery } from '~/server/utils/pagination'

const ELECTRONIC_TYPES = ['badge', 'certificate', 'title']

async function findRecordOrThrow(recordId: string) {
  const [record] = await db
    .select()
    .from(honorRecords)
    .where(eq(honorRecords.id, recordId))
    .limit(1)

  if (!record) {
    throw createErrorResponse(404, '荣誉记录不存在', ResponseCode.NOT_FOUND)
  }

  return record
}

export async function getMyRecords(
  userId: string,
  query: { page?: number | string; pageSize?: number | string; itemType?: string; status?: string }
) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = [eq(honorRecords.userId, userId)]
  if (query.itemType) conditions.push(eq(honorRecords.itemType, query.itemType))
  if (query.status) conditions.push(eq(honorRecords.status, query.status))

  const where = and(...conditions)

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(honorRecords)
    .where(where)

  const list = await db
    .select()
    .from(honorRecords)
    .where(where)
    .orderBy(desc(honorRecords.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

export async function getRecordById(recordId: string, userId: string, role: string) {
  const record = await findRecordOrThrow(recordId)

  if (role !== 'admin' && record.userId !== userId) {
    throw createErrorResponse(403, '无权查看此荣誉记录', ResponseCode.FORBIDDEN)
  }

  return record
}

export async function reserveReceive(
  recordId: string,
  userId: string,
  data: { receiveLocation: string; receiveContact: string }
) {
  const record = await findRecordOrThrow(recordId)

  if (record.userId !== userId) {
    throw createErrorResponse(403, '无权操作此荣誉记录', ResponseCode.FORBIDDEN)
  }

  if (record.itemType !== 'gift') {
    throw createErrorResponse(400, '只有实体物品可以预约领取', ResponseCode.BAD_REQUEST)
  }

  if (record.status !== 'pending' && record.status !== 'issued') {
    throw createErrorResponse(400, '当前状态不可预约领取', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(honorRecords)
    .set({
      receiveLocation: data.receiveLocation,
      receiveContact: data.receiveContact,
      updatedAt: new Date(),
    })
    .where(eq(honorRecords.id, recordId))
    .returning()

  return updated
}

export async function issueHonor(
  recordId: string,
  operatorId: string,
  role: string,
  data: { certificateNo?: string; certificateUrl?: string; note?: string }
) {
  if (role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }

  const record = await findRecordOrThrow(recordId)

  if (record.status === 'issued' || record.status === 'received') {
    throw createErrorResponse(400, '荣誉已发放，不可重复发放', ResponseCode.BAD_REQUEST)
  }

  const isElectronic = ELECTRONIC_TYPES.includes(record.itemType)

  const updateData: Record<string, any> = {
    issuedBy: operatorId,
    issueTime: new Date(),
    updatedAt: new Date(),
  }

  if (data.certificateNo) updateData.certificateNo = data.certificateNo
  if (data.certificateUrl) updateData.certificateUrl = data.certificateUrl
  if (data.note) updateData.note = data.note

  if (isElectronic) {
    updateData.status = 'received'
    updateData.receiveTime = new Date()
  } else {
    updateData.status = 'issued'
  }

  const [updated] = await db
    .update(honorRecords)
    .set(updateData)
    .where(eq(honorRecords.id, recordId))
    .returning()

  return updated
}

export async function confirmReceive(
  recordId: string,
  operatorId: string,
  role: string
) {
  if (role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }

  const record = await findRecordOrThrow(recordId)

  if (record.status !== 'issued') {
    throw createErrorResponse(400, '只有已发放的荣誉才能确认领取', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(honorRecords)
    .set({
      status: 'received',
      receiveTime: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(honorRecords.id, recordId))
    .returning()

  return updated
}

export async function getHonorStats() {
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(honorRecords)

  const statusStats = await db
    .select({
      status: honorRecords.status,
      count: count(),
    })
    .from(honorRecords)
    .groupBy(honorRecords.status)

  const typeStats = await db
    .select({
      itemType: honorRecords.itemType,
      count: count(),
    })
    .from(honorRecords)
    .groupBy(honorRecords.itemType)

  const byStatus: Record<string, number> = {}
  for (const row of statusStats) {
    if (row.status) {
      byStatus[row.status] = row.count
    }
  }

  const byType: Record<string, number> = {}
  for (const row of typeStats) {
    if (row.itemType) {
      byType[row.itemType] = row.count
    }
  }

  return { total, byStatus, byType }
}
