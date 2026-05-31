import { eq, and, like, or, desc, sql, count } from 'drizzle-orm'
import { db } from '#server/db'
import { users, pointAccounts } from '#server/db/schema'
import { encryptIdCard, decryptIdCard, maskIdCard, maskPhone } from '#server/utils/encryption'
import { createErrorResponse } from '#server/utils/response'

const HONOR_LEVELS = [
  { level: 0, name: '普通志愿者', minPoints: 0, icon: '' },
  { level: 1, name: '铜牌志愿者', minPoints: 100, icon: '🥉' },
  { level: 2, name: '银牌志愿者', minPoints: 500, icon: '🥈' },
  { level: 3, name: '金牌志愿者', minPoints: 2000, icon: '🥇' },
  { level: 4, name: '钻石志愿者', minPoints: 5000, icon: '💎' },
]

function maskUser(user: any) {
  let maskedIdCard = user.idCardNo
  if (user.idCardNo) {
    // Only decrypt if the value is in encrypted format (iv:authTag:data)
    if (user.idCardNo.includes(':')) {
      try {
        maskedIdCard = maskIdCard(decryptIdCard(user.idCardNo))
      } catch {
        // Fallback: mask as-is if decryption fails
        maskedIdCard = maskIdCard(user.idCardNo)
      }
    } else {
      maskedIdCard = maskIdCard(user.idCardNo)
    }
  }
  return {
    ...user,
    phone: user.phone ? maskPhone(user.phone) : user.phone,
    idCardNo: maskedIdCard,
  }
}

export async function getUserById(userId: string) {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!result.length) {
    throw createErrorResponse(404, 'User not found')
  }
  return maskUser(result[0])
}

export async function getCurrentUser(userId: string) {
  const result = await db
    .select({
      user: users,
      pointAccount: pointAccounts,
    })
    .from(users)
    .leftJoin(pointAccounts, eq(users.id, pointAccounts.userId))
    .where(eq(users.id, userId))
    .limit(1)

  if (!result.length) {
    throw createErrorResponse(404, 'User not found')
  }

  const { user, pointAccount } = result[0]
  const maskedUser = maskUser(user)

  return {
    ...maskedUser,
    points: pointAccount
      ? {
          activityPointsBalance: pointAccount.activityPointsBalance,
          activityPointsTotal: pointAccount.activityPointsTotal,
          donationPointsBalance: pointAccount.donationPointsBalance,
          donationPointsTotal: pointAccount.donationPointsTotal,
        }
      : null,
  }
}

export async function updateUser(userId: string, data: { nickname?: string; avatarUrl?: string }) {
  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (data.nickname !== undefined) updateData.nickname = data.nickname
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning()

  if (!result.length) {
    throw createErrorResponse(404, 'User not found')
  }

  return maskUser(result[0])
}

function validateIdCard(idCard: string): boolean {
  if (idCard.length !== 18) return false

  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkChars = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    const charCode = idCard.charCodeAt(i)
    if (charCode < 48 || charCode > 57) return false
    sum += (charCode - 48) * weights[i]
  }

  const checkDigit = checkChars[sum % 11]
  return idCard[17].toUpperCase() === checkDigit
}

export async function verifyRealName(userId: string, data: { realName: string; idCardNo: string }) {
  if (!validateIdCard(data.idCardNo)) {
    throw createErrorResponse(422, 'Invalid ID card number format')
  }

  const encryptedIdCard = encryptIdCard(data.idCardNo)

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.idCardNo, encryptedIdCard), sql`${users.id} != ${userId}`))
    .limit(1)

  if (existing.length) {
    throw createErrorResponse(409, 'ID card number already registered by another user')
  }

  const result = await db
    .update(users)
    .set({
      realName: data.realName,
      idCardNo: encryptedIdCard,
      realNameVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  if (!result.length) {
    throw createErrorResponse(404, 'User not found')
  }

  return maskUser(result[0])
}

export async function getUserList(query: {
  page: number
  pageSize: number
  role?: string
  status?: string
  keyword?: string
}) {
  const conditions = []

  if (query.role) {
    conditions.push(eq(users.role, query.role))
  }
  if (query.status) {
    conditions.push(eq(users.status, query.status))
  }
  if (query.keyword) {
    conditions.push(
      or(
        like(users.nickname, `%${query.keyword}%`),
        like(users.username, `%${query.keyword}%`),
        like(users.phone, `%${query.keyword}%`),
        like(users.memberNo, `%${query.keyword}%`)
      )!
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const totalResult = await db
    .select({ count: count() })
    .from(users)
    .where(whereClause)

  const total = totalResult[0].count
  const offset = (query.page - 1) * query.pageSize

  const list = await db
    .select()
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(query.pageSize)
    .offset(offset)

  return {
    list: list.map(maskUser),
    total,
    page: query.page,
    pageSize: query.pageSize,
  }
}

export async function adminGetUserById(userId: string) {
  const result = await db
    .select({
      user: users,
      pointAccount: pointAccounts,
    })
    .from(users)
    .leftJoin(pointAccounts, eq(users.id, pointAccounts.userId))
    .where(eq(users.id, userId))
    .limit(1)

  if (!result.length) {
    throw createErrorResponse(404, 'User not found')
  }

  const { user, pointAccount } = result[0]

  return {
    ...user,
    idCardNo: user.idCardNo
      ? (user.idCardNo.includes(':') ? maskIdCard(decryptIdCard(user.idCardNo)) : maskIdCard(user.idCardNo))
      : user.idCardNo,
    points: pointAccount
      ? {
          activityPointsBalance: pointAccount.activityPointsBalance,
          activityPointsTotal: pointAccount.activityPointsTotal,
          donationPointsBalance: pointAccount.donationPointsBalance,
          donationPointsTotal: pointAccount.donationPointsTotal,
        }
      : null,
  }
}

export async function adminUpdateUser(
  userId: string,
  data: { role?: string; status?: string; honorLevel?: number }
) {
  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (data.role !== undefined) updateData.role = data.role
  if (data.status !== undefined) updateData.status = data.status
  if (data.honorLevel !== undefined) updateData.honorLevel = data.honorLevel

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning()

  if (!result.length) {
    throw createErrorResponse(404, 'User not found')
  }

  return result[0]
}

export async function freezeUser(userId: string) {
  const result = await db
    .update(users)
    .set({ status: 'frozen', updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning()

  if (!result.length) {
    throw createErrorResponse(404, 'User not found')
  }

  return result[0]
}

export async function unfreezeUser(userId: string) {
  const result = await db
    .update(users)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning()

  if (!result.length) {
    throw createErrorResponse(404, 'User not found')
  }

  return result[0]
}

export function getHonorLevels() {
  return HONOR_LEVELS
}

export function calculateHonorLevel(totalPoints: number): number {
  if (totalPoints >= 5000) return 4
  if (totalPoints >= 2000) return 3
  if (totalPoints >= 500) return 2
  if (totalPoints >= 100) return 1
  return 0
}

export async function generateMemberNo(): Promise<string> {
  const prefix = 'ZA'
  let memberNo = ''
  let attempts = 0

  while (attempts < 10) {
    const num = Math.floor(10000 + Math.random() * 90000)
    memberNo = `${prefix}-${num}`

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.memberNo, memberNo))
      .limit(1)

    if (!existing.length) {
      return memberNo
    }
    attempts++
  }

  throw createErrorResponse(500, 'Failed to generate unique member number')
}
