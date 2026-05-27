import { db } from '~/server/db'
import { donations, pointAccounts, pointTransactions, users } from '~/server/db/schema'
import { eq, and, desc, count, gte, lte, sql } from 'drizzle-orm'
import { createErrorResponse, ResponseCode } from '~/server/utils/response'
import { parsePaginationQuery } from '~/server/utils/pagination'
import { maskPhone } from '~/server/utils/encryption'

export async function createDonation(
  userId: string,
  data: {
    donationType: string
    amount?: number
    materialDesc?: string
    materialValue?: number
    evidenceImages: string[]
    evidenceDesc?: string
  }
) {
  const [donation] = await db
    .insert(donations)
    .values({
      userId,
      donationType: data.donationType,
      amount: data.amount?.toString(),
      materialDesc: data.materialDesc,
      materialValue: data.materialValue?.toString(),
      evidenceImages: data.evidenceImages,
      evidenceDesc: data.evidenceDesc,
      status: 'pending',
      pointsGranted: false,
    })
    .returning()

  return donation
}

export async function getMyDonations(
  userId: string,
  query: { page?: number | string; pageSize?: number | string; status?: string }
) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = [eq(donations.userId, userId)]
  if (query.status) conditions.push(eq(donations.status, query.status))

  const where = and(...conditions)

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(donations)
    .where(where)

  const list = await db
    .select()
    .from(donations)
    .where(where)
    .orderBy(desc(donations.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { list, total, page, pageSize }
}

export async function getDonationById(donationId: string, userId: string, role: string) {
  const [donation] = await db
    .select({
      id: donations.id,
      userId: donations.userId,
      donationType: donations.donationType,
      amount: donations.amount,
      materialDesc: donations.materialDesc,
      materialValue: donations.materialValue,
      evidenceImages: donations.evidenceImages,
      evidenceDesc: donations.evidenceDesc,
      status: donations.status,
      reviewerId: donations.reviewerId,
      reviewedAt: donations.reviewedAt,
      reviewRemark: donations.reviewRemark,
      pointsGranted: donations.pointsGranted,
      createdAt: donations.createdAt,
      updatedAt: donations.updatedAt,
      donorNickname: users.nickname,
      donorAvatar: users.avatarUrl,
      donorPhone: users.phone,
    })
    .from(donations)
    .leftJoin(users, eq(donations.userId, users.id))
    .where(eq(donations.id, donationId))
    .limit(1)

  if (!donation) {
    throw createErrorResponse(404, '捐助记录不存在', ResponseCode.NOT_FOUND)
  }

  if (role !== 'admin' && donation.userId !== userId) {
    throw createErrorResponse(403, '无权查看此捐助记录', ResponseCode.FORBIDDEN)
  }

  return {
    ...donation,
    donorPhone: donation.donorPhone ? maskPhone(donation.donorPhone) : donation.donorPhone,
  }
}

export async function getDonationList(query: {
  page?: number | string
  pageSize?: number | string
  status?: string
  donationType?: string
  startDate?: string
  endDate?: string
}) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const conditions = []
  if (query.status) conditions.push(eq(donations.status, query.status))
  if (query.donationType) conditions.push(eq(donations.donationType, query.donationType))
  if (query.startDate) conditions.push(gte(donations.createdAt, new Date(query.startDate)))
  if (query.endDate) conditions.push(lte(donations.createdAt, new Date(query.endDate)))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(donations)
    .where(where)

  const list = await db
    .select({
      id: donations.id,
      userId: donations.userId,
      donationType: donations.donationType,
      amount: donations.amount,
      materialDesc: donations.materialDesc,
      materialValue: donations.materialValue,
      evidenceImages: donations.evidenceImages,
      evidenceDesc: donations.evidenceDesc,
      status: donations.status,
      reviewerId: donations.reviewerId,
      reviewedAt: donations.reviewedAt,
      reviewRemark: donations.reviewRemark,
      pointsGranted: donations.pointsGranted,
      createdAt: donations.createdAt,
      updatedAt: donations.updatedAt,
      donorNickname: users.nickname,
      donorAvatar: users.avatarUrl,
      donorPhone: users.phone,
    })
    .from(donations)
    .leftJoin(users, eq(donations.userId, users.id))
    .where(where)
    .orderBy(desc(donations.createdAt))
    .limit(pageSize)
    .offset(offset)

  return {
    list: list.map((item) => ({
      ...item,
      donorPhone: item.donorPhone ? maskPhone(item.donorPhone) : item.donorPhone,
    })),
    total,
    page,
    pageSize,
  }
}

export async function approveDonation(
  donationId: string,
  reviewerId: string,
  data: { pointsToGrant?: number; reviewRemark?: string }
) {
  const [existing] = await db
    .select()
    .from(donations)
    .where(eq(donations.id, donationId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '捐助记录不存在', ResponseCode.NOT_FOUND)
  }

  if (existing.status !== 'pending') {
    throw createErrorResponse(400, '只有待审核的捐助记录才能审核通过', ResponseCode.BAD_REQUEST)
  }

  const pointsToGrant = data.pointsToGrant ?? 0

  if (pointsToGrant > 0) {
    await db.transaction(async (tx) => {
      await tx
        .update(donations)
        .set({
          status: 'approved',
          reviewerId,
          reviewedAt: new Date(),
          reviewRemark: data.reviewRemark,
          pointsGranted: true,
          updatedAt: new Date(),
        })
        .where(eq(donations.id, donationId))

      await tx
        .update(pointAccounts)
        .set({
          donationPointsTotal: sql`${pointAccounts.donationPointsTotal} + ${pointsToGrant}`,
          totalPoints: sql`${pointAccounts.totalPoints} + ${pointsToGrant}`,
          updatedAt: new Date(),
        })
        .where(eq(pointAccounts.userId, existing.userId))

      await tx.insert(pointTransactions).values({
        userId: existing.userId,
        pointType: 'donation',
        amount: pointsToGrant,
        sourceType: 'donation',
        sourceId: donationId,
        description: '捐助审核通过，获得积分',
      })
    })
  } else {
    await db
      .update(donations)
      .set({
        status: 'approved',
        reviewerId,
        reviewedAt: new Date(),
        reviewRemark: data.reviewRemark,
        updatedAt: new Date(),
      })
      .where(eq(donations.id, donationId))
  }

  const [updated] = await db
    .select()
    .from(donations)
    .where(eq(donations.id, donationId))
    .limit(1)

  return updated
}

export async function rejectDonation(
  donationId: string,
  reviewerId: string,
  data: { reviewRemark: string }
) {
  const [existing] = await db
    .select()
    .from(donations)
    .where(eq(donations.id, donationId))
    .limit(1)

  if (!existing) {
    throw createErrorResponse(404, '捐助记录不存在', ResponseCode.NOT_FOUND)
  }

  if (existing.status !== 'pending') {
    throw createErrorResponse(400, '只有待审核的捐助记录才能驳回', ResponseCode.BAD_REQUEST)
  }

  const [updated] = await db
    .update(donations)
    .set({
      status: 'rejected',
      reviewerId,
      reviewedAt: new Date(),
      reviewRemark: data.reviewRemark,
      updatedAt: new Date(),
    })
    .where(eq(donations.id, donationId))
    .returning()

  return updated
}
