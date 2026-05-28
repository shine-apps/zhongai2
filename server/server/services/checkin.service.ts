import { db } from '#server/db'
import { activityCheckins, activities, activityRegistrations, pointAccounts, pointTransactions, users } from '#server/db/schema'
import { eq, and, inArray, desc, count, sql } from 'drizzle-orm'
import { createErrorResponse, ResponseCode } from '#server/utils/response'
import { parsePaginationQuery } from '#server/utils/pagination'
import { maskPhone } from '#server/utils/encryption'

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaPhi = toRad(lat2 - lat1)
  const deltaLambda = toRad(lon2 - lon1)
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function gpsCheckin(activityId: string, userId: string, latitude: number, longitude: number) {
  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!activity) {
    throw createErrorResponse(404, '活动不存在', ResponseCode.NOT_FOUND)
  }

  if (activity.status !== 'ongoing') {
    throw createErrorResponse(400, '活动未在进行中', ResponseCode.BAD_REQUEST)
  }

  const now = new Date()
  if (now < activity.startTime) {
    throw createErrorResponse(400, '活动尚未开始', ResponseCode.BAD_REQUEST)
  }
  if (now > activity.endTime) {
    throw createErrorResponse(400, '活动已结束', ResponseCode.BAD_REQUEST)
  }

  const [registration] = await db
    .select()
    .from(activityRegistrations)
    .where(and(
      eq(activityRegistrations.activityId, activityId),
      eq(activityRegistrations.userId, userId),
    ))
    .limit(1)

  if (!registration || registration.status !== 'approved') {
    throw createErrorResponse(403, '您未获得该活动的报名批准', ResponseCode.FORBIDDEN)
  }

  const [existingCheckin] = await db
    .select()
    .from(activityCheckins)
    .where(and(
      eq(activityCheckins.activityId, activityId),
      eq(activityCheckins.userId, userId),
    ))
    .limit(1)

  if (existingCheckin) {
    throw createErrorResponse(409, '您已签到该活动', ResponseCode.CONFLICT)
  }

  if (activity.latitude && activity.longitude) {
    const activityLat = parseFloat(activity.latitude)
    const activityLon = parseFloat(activity.longitude)
    const distance = calculateDistance(latitude, longitude, activityLat, activityLon)
    const radius = activity.checkinRadius ?? 200

    if (distance > radius) {
      throw createErrorResponse(400, `您距离活动地点${Math.round(distance)}米，超出签到范围${radius}米`, ResponseCode.BAD_REQUEST)
    }
  }

  const [checkin] = await db
    .insert(activityCheckins)
    .values({
      activityId,
      userId,
      checkinType: 'gps',
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      verified: false,
      pointsGranted: false,
    })
    .returning()

  return checkin
}

export async function verifyCheckin(checkinId: string, verifierId: string, verifierRole: string) {
  if (verifierRole !== 'leader' && verifierRole !== 'admin') {
    throw createErrorResponse(403, '需要团长或管理员权限', ResponseCode.FORBIDDEN)
  }

  const [checkin] = await db
    .select()
    .from(activityCheckins)
    .where(eq(activityCheckins.id, checkinId))
    .limit(1)

  if (!checkin) {
    throw createErrorResponse(404, '签到记录不存在', ResponseCode.NOT_FOUND)
  }

  if (checkin.verified) {
    throw createErrorResponse(400, '该签到已验证', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(activityCheckins)
    .set({
      verified: true,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
    })
    .where(eq(activityCheckins.id, checkinId))
    .returning()

  return updated
}

export async function getCheckinList(activityId: string, query: { page?: number | string; pageSize?: number | string }) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(activityCheckins)
    .where(eq(activityCheckins.activityId, activityId))

  const list = await db
    .select({
      id: activityCheckins.id,
      activityId: activityCheckins.activityId,
      userId: activityCheckins.userId,
      checkinType: activityCheckins.checkinType,
      latitude: activityCheckins.latitude,
      longitude: activityCheckins.longitude,
      checkinTime: activityCheckins.checkinTime,
      verified: activityCheckins.verified,
      verifiedBy: activityCheckins.verifiedBy,
      verifiedAt: activityCheckins.verifiedAt,
      pointsGranted: activityCheckins.pointsGranted,
      createdAt: activityCheckins.createdAt,
      userName: users.nickname,
      userAvatar: users.avatarUrl,
      userPhone: users.phone,
    })
    .from(activityCheckins)
    .leftJoin(users, eq(activityCheckins.userId, users.id))
    .where(eq(activityCheckins.activityId, activityId))
    .orderBy(desc(activityCheckins.checkinTime))
    .limit(pageSize)
    .offset(offset)

  const maskedList = list.map((item) => ({
    ...item,
    userPhone: item.userPhone ? maskPhone(item.userPhone) : null,
  }))

  return { list: maskedList, total, page, pageSize }
}

export async function completeActivity(activityId: string, checkinIds: string[], operatorId: string, operatorRole: string) {
  if (operatorRole !== 'leader' && operatorRole !== 'admin') {
    throw createErrorResponse(403, '需要团长或管理员权限', ResponseCode.FORBIDDEN)
  }

  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!activity) {
    throw createErrorResponse(404, '活动不存在', ResponseCode.NOT_FOUND)
  }

  if (activity.status !== 'ongoing') {
    throw createErrorResponse(400, '活动未在进行中', ResponseCode.BAD_REQUEST)
  }

  const checkinRecords = await db
    .select()
    .from(activityCheckins)
    .where(and(
      eq(activityCheckins.activityId, activityId),
      inArray(activityCheckins.id, checkinIds),
    ))

  if (checkinRecords.length !== checkinIds.length) {
    const foundIds = new Set(checkinRecords.map((c) => c.id))
    const missing = checkinIds.filter((id) => !foundIds.has(id))
    throw createErrorResponse(404, `签到记录不存在: ${missing.join(', ')}`, ResponseCode.NOT_FOUND)
  }

  const unverified = checkinRecords.filter((c) => !c.verified)
  if (unverified.length > 0) {
    throw createErrorResponse(400, '存在未验证的签到记录，请先验证', ResponseCode.BAD_REQUEST)
  }

  const alreadyGranted = checkinRecords.filter((c) => c.pointsGranted)
  if (alreadyGranted.length > 0) {
    throw createErrorResponse(400, '存在已发放积分的签到记录', ResponseCode.BAD_REQUEST)
  }

  const rewardPoints = activity.rewardPoints
  let totalPointsGranted = 0

  await db.transaction(async (tx) => {
    for (const checkin of checkinRecords) {
      await tx
        .insert(pointAccounts)
        .values({
          userId: checkin.userId,
          activityPointsBalance: rewardPoints,
          activityPointsTotal: rewardPoints,
        })
        .onConflictDoUpdate({
          target: pointAccounts.userId,
          set: {
            activityPointsBalance: sql`${pointAccounts.activityPointsBalance} + ${rewardPoints}`,
            activityPointsTotal: sql`${pointAccounts.activityPointsTotal} + ${rewardPoints}`,
            updatedAt: new Date(),
          },
        })

      await tx
        .insert(pointTransactions)
        .values({
          userId: checkin.userId,
          pointType: 'activity',
          amount: rewardPoints,
          sourceType: 'activity_complete',
          sourceId: activityId,
          description: `完成活动「${activity.title}」获得积分`,
        })

      await tx
        .update(activityCheckins)
        .set({ pointsGranted: true })
        .where(eq(activityCheckins.id, checkin.id))

      totalPointsGranted += rewardPoints
    }

    await tx
      .update(activities)
      .set({
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
  })

  return {
    activityId,
    checkinCount: checkinRecords.length,
    pointsPerUser: rewardPoints,
    totalPointsGranted,
  }
}
