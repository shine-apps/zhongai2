import { eq, and, desc, count, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { honorItems, honorRecords, users, activityRegistrations, donations } from '~/server/db/schema'
import { createErrorResponse, ResponseCode } from '~/server/utils/response'
import { parsePaginationQuery } from '~/server/utils/pagination'

export function requireAdmin(event: any) {
  const auth = event.context.auth
  if (!auth || auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }
  return auth
}

const TYPE_ABBREVIATIONS: Record<string, string> = {
  badge: 'BD',
  certificate: 'CT',
  gift: 'GT',
  title: 'TL',
}

const ELECTRONIC_TYPES = ['badge', 'certificate', 'title']

export interface UserStats {
  honorLevel: number
  totalPoints: number
  activityCount: number
  donationAmount: number
}

const HONOR_LEVEL_THRESHOLDS = [0, 10, 50, 100, 200]

function getUnlockThreshold(item: any): number {
  switch (item.unlockType) {
    case 'level':
      return HONOR_LEVEL_THRESHOLDS[item.unlockLevel ?? item.unlockValue] ?? item.unlockValue
    case 'activity_count':
      return item.unlockActivityCount ?? item.unlockValue
    case 'donation_amount':
      return parseFloat(item.unlockDonationAmount ?? String(item.unlockValue))
    default:
      return item.unlockValue
  }
}

function getUserProgress(item: any, userStats: UserStats): number {
  switch (item.unlockType) {
    case 'level':
      return userStats.totalPoints
    case 'activity_count':
      return userStats.activityCount
    case 'donation_amount':
      return userStats.donationAmount
    default:
      return 0
  }
}

export function checkUnlockStatus(item: any, userStats: UserStats): { unlocked: boolean } {
  const threshold = getUnlockThreshold(item)
  const progress = getUserProgress(item, userStats)
  return { unlocked: progress >= threshold }
}

function buildItemResponse(item: any, userStats: UserStats, claimedMap: Map<string, string>) {
  const { unlocked } = checkUnlockStatus(item, userStats)
  const isClaimed = !!claimedMap.get(item.id)
  const threshold = getUnlockThreshold(item)
  const progress = getUserProgress(item, userStats)
  const progressPercent = threshold === 0 ? (unlocked ? 100 : 0) : Math.min(100, Math.floor((progress / threshold) * 100))

  return {
    ...item,
    isUnlocked: unlocked,
    isClaimed,
    canClaim: unlocked && !isClaimed,
    userProgress: progress,
    progressPercent,
  }
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const [user] = await db
    .select({ honorLevel: users.honorLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const [regResult] = await db
    .select({ count: count() })
    .from(activityRegistrations)
    .where(eq(activityRegistrations.userId, userId))

  const [donationResult] = await db
    .select({ total: sql<string>`COALESCE(SUM(${donations.amount}), 0)` })
    .from(donations)
    .where(and(
      eq(donations.userId, userId),
      eq(donations.status, 'approved')
    ))

  const { pointAccounts } = await import('~/server/db/schema')
  const [accountResult] = await db
    .select({ totalPoints: pointAccounts.totalPoints })
    .from(pointAccounts)
    .where(eq(pointAccounts.userId, userId))
    .limit(1)

  return {
    honorLevel: user?.honorLevel ?? 0,
    totalPoints: accountResult?.totalPoints ?? 0,
    activityCount: Number(regResult?.count ?? 0),
    donationAmount: parseFloat(donationResult?.total ?? '0'),
  }
}

export async function getHonorItems(userId: string, userStats: UserStats) {
  const items = await db
    .select()
    .from(honorItems)
    .where(eq(honorItems.isActive, true))
    .orderBy(desc(honorItems.createdAt))

  const records = await db
    .select({ itemId: honorRecords.itemId, status: honorRecords.status })
    .from(honorRecords)
    .where(eq(honorRecords.userId, userId))

  const claimedMap = new Map(records.map(r => [r.itemId, r.status]))

  return items.map(item => buildItemResponse(item, userStats, claimedMap))
}

export async function getHonorItemById(itemId: string, userId: string, userStats: UserStats) {
  const [item] = await db
    .select()
    .from(honorItems)
    .where(eq(honorItems.id, itemId))
    .limit(1)

  if (!item) {
    throw createErrorResponse(404, '荣誉物品不存在')
  }

  const records = await db
    .select({ itemId: honorRecords.itemId, status: honorRecords.status })
    .from(honorRecords)
    .where(and(
      eq(honorRecords.userId, userId),
      eq(honorRecords.itemId, itemId)
    ))

  const claimedMap = new Map(records.map(r => [r.itemId, r.status]))
  return buildItemResponse(item, userStats, claimedMap)
}

export async function claimHonorItem(userId: string, itemId: string, userStats: UserStats) {
  const [item] = await db
    .select()
    .from(honorItems)
    .where(eq(honorItems.id, itemId))
    .limit(1)

  if (!item) {
    throw createErrorResponse(404, '荣誉物品不存在')
  }

  const { unlocked } = checkUnlockStatus(item, userStats)
  if (!unlocked) {
    throw createErrorResponse(403, '尚未解锁该荣誉物品')
  }

  const existingRecords = await db
    .select()
    .from(honorRecords)
    .where(and(
      eq(honorRecords.userId, userId),
      eq(honorRecords.itemId, itemId)
    ))

  if (existingRecords.length > 0) {
    throw createErrorResponse(409, '已领取该荣誉物品')
  }

  if (item.stock !== -1) {
    const [{ count: claimedCount }] = await db
      .select({ count: count() })
      .from(honorRecords)
      .where(eq(honorRecords.itemId, itemId))

    if (claimedCount >= item.stock) {
      throw createErrorResponse(400, '库存不足')
    }
  }

  const [{ count: recordCount }] = await db
    .select({ count: count() })
    .from(honorRecords)

  const certificateNo = generateCertificateNo(item.type, recordCount)
  const isElectronic = ELECTRONIC_TYPES.includes(item.type)
  const status = isElectronic ? 'issued' : 'pending'

  const [record] = await db
    .insert(honorRecords)
    .values({
      userId,
      itemId,
      itemName: item.name,
      itemType: item.type,
      status,
      certificateNo,
      issueTime: isElectronic ? new Date() : null,
    })
    .returning()

  return record
}

export function calculateProgress(unlockType: string, current: number, target: number) {
  const percentage = target === 0 ? 0 : Math.min(100, (current / target) * 100)
  return {
    current,
    target,
    percentage: Math.round(percentage * 100) / 100,
  }
}

export function generateCertificateNo(itemType: string, existingCount: number): string {
  const abbreviation = TYPE_ABBREVIATIONS[itemType] || 'BD'
  const year = new Date().getFullYear()
  const sequence = String(existingCount + 1).padStart(5, '0')
  return `ZA-${abbreviation}-${year}-${sequence}`
}

export async function createHonorItem(data: {
  name: string
  type: string
  description?: string
  imageUrl?: string
  unlockType: string
  unlockValue: number
  unlockLevel?: number
  unlockActivityCount?: number
  unlockDonationAmount?: string
  stock?: number
  isActive?: boolean
}) {
  const [item] = await db
    .insert(honorItems)
    .values({
      name: data.name,
      type: data.type,
      description: data.description,
      imageUrl: data.imageUrl,
      unlockType: data.unlockType,
      unlockValue: data.unlockValue,
      unlockLevel: data.unlockLevel ?? 0,
      unlockActivityCount: data.unlockActivityCount ?? 0,
      unlockDonationAmount: data.unlockDonationAmount ?? '0',
      stock: data.stock ?? -1,
      isActive: data.isActive ?? true,
    })
    .returning()

  return item
}

export async function updateHonorItem(itemId: string, data: {
  name?: string
  type?: string
  description?: string
  imageUrl?: string
  unlockType?: string
  unlockValue?: number
  unlockLevel?: number
  unlockActivityCount?: number
  unlockDonationAmount?: string
  stock?: number
  isActive?: boolean
}) {
  const [existing] = await db
    .select()
    .from(honorItems)
    .where(eq(honorItems.id, itemId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '荣誉物品不存在')
  }

  const updateData: Record<string, any> = { updatedAt: new Date() }
  const allowedFields = ['name', 'type', 'description', 'imageUrl', 'unlockType', 'unlockValue', 'unlockLevel', 'unlockActivityCount', 'unlockDonationAmount', 'stock', 'isActive']

  for (const field of allowedFields) {
    if (data[field as keyof typeof data] !== undefined) {
      updateData[field] = data[field as keyof typeof data]
    }
  }

  const [updated] = await db
    .update(honorItems)
    .set(updateData)
    .where(eq(honorItems.id, itemId))
    .returning()

  return updated
}

export async function deleteHonorItem(itemId: string) {
  const [existing] = await db
    .select()
    .from(honorItems)
    .where(eq(honorItems.id, itemId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '荣誉物品不存在')
  }

  await db
    .delete(honorItems)
    .where(eq(honorItems.id, itemId))
}
