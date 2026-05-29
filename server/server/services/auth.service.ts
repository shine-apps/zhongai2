import { db } from '#server/db'
import { users, pointAccounts } from '#server/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { signAccessToken, signRefreshToken, verifyToken } from '#server/utils/jwt'
import { code2Session, getPhoneNumber } from '#server/utils/wechat'
import { maskPhone } from '#server/utils/encryption'
import { createErrorResponse } from '#server/utils/response'
import bcrypt from 'bcryptjs'
import type { LoginResponse, UserInfo } from '#server/types'

function generateMemberNo(): string {
  const num = Math.floor(10000 + Math.random() * 90000)
  return `ZA-${num}`
}

async function ensureUniqueMemberNo(): Promise<string> {
  let memberNo = generateMemberNo()
  let existing = await db.select({ id: users.id }).from(users).where(eq(users.memberNo, memberNo)).limit(1)
  while (existing.length > 0) {
    memberNo = generateMemberNo()
    existing = await db.select({ id: users.id }).from(users).where(eq(users.memberNo, memberNo)).limit(1)
  }
  return memberNo
}

async function buildUserInfo(user: any): Promise<UserInfo> {
  const account = await db.select().from(pointAccounts).where(eq(pointAccounts.userId, user.id)).limit(1)
  const pa = account[0]
  return {
    id: user.id,
    username: user.username || undefined,
    openid: user.openid || undefined,
    nickname: user.nickname || '',
    avatar: user.avatarUrl || undefined,
    phone: user.phone ? maskPhone(user.phone) : undefined,
    idCardEncrypted: user.idCardNo || undefined,
    role: user.role as any,
    status: user.status as any,
    points: (pa?.activityPointsBalance ?? 0) + (pa?.donationPointsBalance ?? 0),
    createdAt: user.createdAt?.toISOString() ?? '',
    updatedAt: user.updatedAt?.toISOString() ?? '',
  }
}

export async function login(
  code: string,
  phoneCode: string,
  nickname?: string,
  avatarUrl?: string
): Promise<LoginResponse> {
  const session = await code2Session(code)
  const phoneResult = await getPhoneNumber(phoneCode)

  const existing = await db.select().from(users).where(eq(users.openid, session.openid)).limit(1)

  let user: any

  if (existing.length > 0) {
    user = existing[0]
    const updateData: Record<string, any> = { updatedAt: new Date() }
    if (nickname) updateData.nickname = nickname
    if (avatarUrl) updateData.avatarUrl = avatarUrl
    if (phoneResult.phoneNumber && !user.phone) {
      updateData.phone = phoneResult.phoneNumber
    }
    if (session.unionid && !user.unionId) {
      updateData.unionId = session.unionid
    }
    await db.update(users).set(updateData).where(eq(users.id, user.id))
    user = { ...user, ...updateData }
  } else {
    const memberNo = await ensureUniqueMemberNo()
    const [inserted] = await db.insert(users).values({
      openid: session.openid,
      unionId: session.unionid || null,
      phone: phoneResult.phoneNumber || null,
      nickname: nickname || null,
      avatarUrl: avatarUrl || null,
      memberNo,
      role: 'volunteer',
      status: 'active',
    }).returning()
    user = inserted

    await db.insert(pointAccounts).values({
      userId: user.id,
      activityPointsBalance: 0,
      activityPointsTotal: 0,
      donationPointsBalance: 0,
      donationPointsTotal: 0,
    })
  }

  const accessToken = await signAccessToken(user.id, user.role)
  const refreshToken = await signRefreshToken(user.id, user.role)
  const userInfo = await buildUserInfo(user)

  return { accessToken, refreshToken, userInfo }
}

export async function loginWithPassword(username: string, password: string): Promise<LoginResponse> {
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1)

  if (result.length === 0) {
    throw createErrorResponse(401, '用户名或密码错误')
  }

  const user = result[0]!

  if (!user.passwordHash) {
    throw createErrorResponse(401, '用户名或密码错误')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw createErrorResponse(401, '用户名或密码错误')
  }

  if (user.status !== 'active') {
    throw createErrorResponse(403, '账号已被禁用，请联系管理员')
  }

  const accessToken = await signAccessToken(user.id, user.role ?? 'volunteer')
  const refreshToken = await signRefreshToken(user.id, user.role ?? 'volunteer')
  const userInfo = await buildUserInfo(user)

  return { accessToken, refreshToken, userInfo }
}

export async function adminLogin(username: string, password: string): Promise<LoginResponse> {
  const result = await db.select().from(users).where(
    and(eq(users.username, username), sql`${users.role} IN ('admin', 'leader')`)
  ).limit(1)

  if (result.length === 0) {
    throw createErrorResponse(401, 'Invalid username or password')
  }

  const user = result[0]

  if (!user.passwordHash) {
    throw createErrorResponse(401, 'Invalid username or password')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw createErrorResponse(401, 'Invalid username or password')
  }

  const accessToken = await signAccessToken(user.id, user.role)
  const refreshToken = await signRefreshToken(user.id, user.role)
  const userInfo = await buildUserInfo(user)

  return { accessToken, refreshToken, userInfo }
}

export async function refreshToken(refreshTokenStr: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  let payload: { sub: string; role: string; type: string }
  try {
    payload = await verifyToken(refreshTokenStr)
  } catch {
    throw createErrorResponse(401, 'Invalid or expired refresh token')
  }

  if (payload.type !== 'refresh') {
    throw createErrorResponse(401, 'Invalid token type')
  }

  const user = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1)
  if (user.length === 0) {
    throw createErrorResponse(401, 'User not found')
  }

  const accessToken = await signAccessToken(payload.sub, payload.role)
  const newRefreshToken = await signRefreshToken(payload.sub, payload.role)

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: 7 * 24 * 3600,
  }
}

export async function bindPhone(userId: string, phoneCode: string): Promise<{ phone: string }> {
  const phoneResult = await getPhoneNumber(phoneCode)

  await db.update(users).set({ phone: phoneResult.phoneNumber, updatedAt: new Date() }).where(eq(users.id, userId))

  return { phone: maskPhone(phoneResult.phoneNumber) }
}

export async function getCurrentUser(userId: string): Promise<UserInfo> {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (result.length === 0) {
    throw createErrorResponse(404, 'User not found')
  }

  return buildUserInfo(result[0])
}
