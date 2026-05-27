import { eq, and, desc, sql, count } from 'drizzle-orm'
import { db } from '~/server/db'
import { pointAccounts, pointTransactions, pointRules, users } from '~/server/db/schema'
import { createErrorResponse, ResponseCode } from '~/server/utils/response'
import { parsePaginationQuery } from '~/server/utils/pagination'
import { calculateHonorLevel } from '~/server/services/user.service'

export async function getBalance(userId: string) {
  const [account] = await db
    .select()
    .from(pointAccounts)
    .where(eq(pointAccounts.userId, userId))
    .limit(1)

  if (!account) {
    return {
      activityTotal: 0,
      donationTotal: 0,
      totalPoints: 0,
    }
  }

  return {
    activityTotal: account.activityPointsTotal ?? 0,
    donationTotal: account.donationPointsTotal ?? 0,
    totalPoints: account.totalPoints ?? 0,
  }
}

export async function getTransactions(
  userId: string,
  query: { page?: number | string; pageSize?: number | string; pointType?: string; changeType?: string }
) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = [eq(pointTransactions.userId, userId)]

  if (query.pointType) {
    conditions.push(eq(pointTransactions.pointType, query.pointType))
  }

  if (query.changeType) {
    if (query.changeType === 'earn') {
      conditions.push(sql`${pointTransactions.amount} > 0`)
    } else if (query.changeType === 'spend') {
      conditions.push(sql`${pointTransactions.amount} < 0`)
    } else if (query.changeType === 'revert') {
      conditions.push(eq(pointTransactions.sourceType, 'revert'))
    }
  }

  const where = and(...conditions)

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(pointTransactions)
    .where(where)

  const list = await db
    .select()
    .from(pointTransactions)
    .where(where)
    .orderBy(desc(pointTransactions.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

export async function getRules(query?: { isActive?: boolean }) {
  const conditions = []

  if (query?.isActive !== undefined) {
    conditions.push(eq(pointRules.isActive, query.isActive))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const list = await db
    .select()
    .from(pointRules)
    .where(where)
    .orderBy(desc(pointRules.createdAt))

  return list
}

export async function createRule(data: {
  ruleType: string
  pointType: string
  pointsPerUnit: number
  unitDesc?: string
  minAmount?: string
  isActive?: boolean
}) {
  const [rule] = await db
    .insert(pointRules)
    .values({
      ruleType: data.ruleType,
      pointType: data.pointType,
      pointsPerUnit: data.pointsPerUnit,
      unitDesc: data.unitDesc,
      minAmount: data.minAmount,
      isActive: data.isActive ?? true,
    })
    .returning()

  return rule
}

export async function updateRule(
  ruleId: string,
  data: { pointsPerUnit?: number; unitDesc?: string; minAmount?: string; isActive?: boolean }
) {
  const [existing] = await db
    .select()
    .from(pointRules)
    .where(eq(pointRules.id, ruleId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, 'Rule not found', ResponseCode.NOT_FOUND)
  }

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (data.pointsPerUnit !== undefined) updateData.pointsPerUnit = data.pointsPerUnit
  if (data.unitDesc !== undefined) updateData.unitDesc = data.unitDesc
  if (data.minAmount !== undefined) updateData.minAmount = data.minAmount
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const [updated] = await db
    .update(pointRules)
    .set(updateData)
    .where(eq(pointRules.id, ruleId))
    .returning()

  return updated
}

export async function adjustPoints(
  adminId: string,
  data: { userId: string; pointType: string; amount: number; description: string }
) {
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, data.userId))
    .limit(1)

  if (!targetUser) {
    throw createErrorResponse(404, 'User not found', ResponseCode.NOT_FOUND)
  }

  let transaction: any

  await db.transaction(async (tx) => {
    const [account] = await tx
      .select()
      .from(pointAccounts)
      .where(eq(pointAccounts.userId, data.userId))
      .limit(1)

    if (!account) {
      await tx.insert(pointAccounts).values({
        userId: data.userId,
        activityPointsTotal: data.pointType === 'activity' && data.amount > 0 ? data.amount : 0,
        donationPointsTotal: data.pointType === 'donation' && data.amount > 0 ? data.amount : 0,
        totalPoints: data.amount > 0 ? data.amount : 0,
      })
    } else {
      const isActivity = data.pointType === 'activity'
      const totalField = isActivity ? pointAccounts.activityPointsTotal : pointAccounts.donationPointsTotal

      const updateSet: Record<string, any> = { updatedAt: new Date() }
      if (data.amount > 0) {
        updateSet[totalField.name] = sql`${totalField} + ${data.amount}`
        updateSet[pointAccounts.totalPoints.name] = sql`${pointAccounts.totalPoints} + ${data.amount}`
      }

      await tx
        .update(pointAccounts)
        .set(updateSet)
        .where(eq(pointAccounts.userId, data.userId))
    }

    const [inserted] = await tx
      .insert(pointTransactions)
      .values({
        userId: data.userId,
        pointType: data.pointType,
        amount: data.amount,
        sourceType: 'admin_adjust',
        sourceId: adminId,
        description: data.description,
      })
      .returning()

    transaction = inserted
  })

  await updateHonorLevel(data.userId)

  return transaction
}

export async function grantPoints(
  userId: string,
  data: { type: string; amount: number; source: string; sourceId?: string; description?: string }
) {
  let transaction: any

  await db.transaction(async (tx) => {
    const [account] = await tx
      .select()
      .from(pointAccounts)
      .where(eq(pointAccounts.userId, userId))
      .limit(1)

    if (!account) {
      await tx.insert(pointAccounts).values({
        userId,
        activityPointsTotal: data.type === 'activity' && data.amount > 0 ? data.amount : 0,
        donationPointsTotal: data.type === 'donation' && data.amount > 0 ? data.amount : 0,
        totalPoints: data.amount > 0 ? data.amount : 0,
      })
    } else {
      const isActivity = data.type === 'activity'
      const totalField = isActivity ? pointAccounts.activityPointsTotal : pointAccounts.donationPointsTotal

      const updateSet: Record<string, any> = { updatedAt: new Date() }
      if (data.amount > 0) {
        updateSet[totalField.name] = sql`${totalField} + ${data.amount}`
        updateSet[pointAccounts.totalPoints.name] = sql`${pointAccounts.totalPoints} + ${data.amount}`
      }

      await tx
        .update(pointAccounts)
        .set(updateSet)
        .where(eq(pointAccounts.userId, userId))
    }

    const [inserted] = await tx
      .insert(pointTransactions)
      .values({
        userId,
        pointType: data.type,
        amount: data.amount,
        sourceType: data.source,
        sourceId: data.sourceId ?? null,
        description: data.description ?? null,
      })
      .returning()

    transaction = inserted
  })

  await updateHonorLevel(userId)

  return transaction
}

export async function updateHonorLevel(userId: string) {
  const [account] = await db
    .select()
    .from(pointAccounts)
    .where(eq(pointAccounts.userId, userId))
    .limit(1)

  if (!account) return

  const totalPointsValue = account.totalPoints ?? 0
  const newLevel = calculateHonorLevel(totalPointsValue)

  const [user] = await db
    .select({ honorLevel: users.honorLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (user && user.honorLevel !== newLevel) {
    await db
      .update(users)
      .set({ honorLevel: newLevel, updatedAt: new Date() })
      .where(eq(users.id, userId))
  }
}
