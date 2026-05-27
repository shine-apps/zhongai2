import { eq, and, gte, desc, sql, count } from 'drizzle-orm'
import { db } from '~/server/db'
import {
  pointAccounts,
  pointTransactions,
  users,
  donations,
  activityCheckins,
  activityRegistrations,
} from '~/server/db/schema'

export type RankingType = 'activity' | 'donation' | 'active'
export type RankingPeriod = 'week' | 'month' | 'all'

export interface RankingItem {
  rank: number
  userId: string
  nickname: string
  avatarUrl: string | null
  score: number
  change: number
  isTop3: boolean
}

export interface DonationRankingItem extends RankingItem {
  donationCount: number
}

export interface ActiveRankingItem extends RankingItem {
  checkinCount: number
  activityCount: number
}

export interface RankingResponse {
  type: RankingType
  period: RankingPeriod
  total: number
  page: number
  pageSize: number
  myRank: RankingItem | DonationRankingItem | ActiveRankingItem | null
  list: (RankingItem | DonationRankingItem | ActiveRankingItem)[]
}

const ACTIVE_SCORE_FORMULA = {
  checkin: 10,
  activity: 20,
  donation: 30,
}

function getPeriodStartDate(period: RankingPeriod): Date | null {
  const now = new Date()
  let startDate: Date | null = null

  if (period === 'week') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
  } else if (period === 'month') {
    startDate = new Date(now)
    startDate.setMonth(now.getMonth() - 1)
  }

  return startDate
}

export function calculateActiveScore(
  checkinCount: number,
  activityCount: number,
  donationCount: number
): number {
  return (
    checkinCount * ACTIVE_SCORE_FORMULA.checkin +
    activityCount * ACTIVE_SCORE_FORMULA.activity +
    donationCount * ACTIVE_SCORE_FORMULA.donation
  )
}

export function getRankChange(currentRank: number, previousRank: number | null): number {
  if (previousRank === null) return 0
  return previousRank - currentRank
}

function buildRankingItem(
  userId: string,
  nickname: string,
  avatarUrl: string | null,
  score: number,
  rank: number,
  change: number = 0
): RankingItem {
  return {
    rank,
    userId,
    nickname,
    avatarUrl,
    score,
    change,
    isTop3: rank <= 3,
  }
}

export async function getActivityRanking(
  period: RankingPeriod,
  page: number,
  pageSize: number
): Promise<RankingResponse> {
  const startDate = getPeriodStartDate(period)
  const offset = (page - 1) * pageSize

  const totalResult = await db
    .select({ count: count() })
    .from(pointTransactions)
    .where(
      and(
        eq(pointTransactions.pointType, 'activity'),
        startDate ? gte(pointTransactions.createdAt, startDate) : undefined
      )
    )

  const total = totalResult[0]?.count || 0

  const rankData = await db
    .select({
      userId: pointTransactions.userId,
      totalPoints: sql<number>`SUM(${pointTransactions.amount})`,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
    })
    .from(pointTransactions)
    .leftJoin(users, eq(pointTransactions.userId, users.id))
    .where(
      and(
        eq(pointTransactions.pointType, 'activity'),
        startDate ? gte(pointTransactions.createdAt, startDate) : undefined
      )
    )
    .groupBy(pointTransactions.userId, users.nickname, users.avatarUrl)
    .orderBy(desc(sql`SUM(${pointTransactions.amount})`))
    .limit(pageSize)
    .offset(offset)

  const list: RankingItem[] = rankData.map((item, index) => ({
    ...buildRankingItem(
      item.userId,
      item.nickname || '匿名用户',
      item.avatarUrl,
      Number(item.totalPoints || 0),
      offset + index + 1
    ),
  }))

  return {
    type: 'activity',
    period,
    total,
    page,
    pageSize,
    myRank: null,
    list,
  }
}

export async function getDonationRanking(
  period: RankingPeriod,
  page: number,
  pageSize: number
): Promise<RankingResponse> {
  const startDate = getPeriodStartDate(period)
  const offset = (page - 1) * pageSize

  const totalResult = await db
    .select({ count: count() })
    .from(donations)
    .where(
      and(
        eq(donations.status, 'approved'),
        startDate ? gte(donations.createdAt, startDate) : undefined
      )
    )

  const total = totalResult[0]?.count || 0

  const rankData = await db
    .select({
      userId: donations.userId,
      totalAmount: sql<string>`COALESCE(SUM(${donations.amount}), 0)`,
      donationCount: sql<number>`COUNT(${donations.id})`,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
    })
    .from(donations)
    .leftJoin(users, eq(donations.userId, users.id))
    .where(
      and(
        eq(donations.status, 'approved'),
        startDate ? gte(donations.createdAt, startDate) : undefined
      )
    )
    .groupBy(donations.userId, users.nickname, users.avatarUrl)
    .orderBy(desc(sql`SUM(${donations.amount})`))
    .limit(pageSize)
    .offset(offset)

  const list: DonationRankingItem[] = rankData.map((item, index) => ({
    ...buildRankingItem(
      item.userId,
      item.nickname || '匿名用户',
      item.avatarUrl,
      Number(item.totalAmount || 0),
      offset + index + 1
    ),
    donationCount: Number(item.donationCount || 0),
  }))

  return {
    type: 'donation',
    period,
    total,
    page,
    pageSize,
    myRank: null,
    list,
  }
}

export async function getActiveRanking(
  period: RankingPeriod,
  page: number,
  pageSize: number
): Promise<RankingResponse> {
  const startDate = getPeriodStartDate(period)
  const offset = (page - 1) * pageSize

  const usersResult = await db.select({ id: users.id }).from(users)

  const userIds = usersResult.map(u => u.id)
  const total = userIds.length

  const userStats = await Promise.all(
    userIds.map(async (userId) => {
      const [checkinCountResult] = await db
        .select({ count: count() })
        .from(activityCheckins)
        .where(
          and(
            eq(activityCheckins.userId, userId),
            startDate ? gte(activityCheckins.checkinTime, startDate) : undefined
          )
        )

      const [activityCountResult] = await db
        .select({ count: count() })
        .from(activityRegistrations)
        .where(
          and(
            eq(activityRegistrations.userId, userId),
            startDate ? gte(activityRegistrations.createdAt, startDate) : undefined
          )
        )

      const [donationCountResult] = await db
        .select({ count: count() })
        .from(donations)
        .where(
          and(
            eq(donations.userId, userId),
            eq(donations.status, 'approved'),
            startDate ? gte(donations.createdAt, startDate) : undefined
          )
        )

      const checkinCount = Number(checkinCountResult?.count || 0)
      const activityCount = Number(activityCountResult?.count || 0)
      const donationCount = Number(donationCountResult?.count || 0)
      const score = calculateActiveScore(checkinCount, activityCount, donationCount)

      return {
        userId,
        checkinCount,
        activityCount,
        donationCount,
        score,
      }
    })
  )

  const sortedUsers = userStats
    .filter(u => u.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(offset, offset + pageSize)

  const userDetails = await db
    .select({
      id: users.id,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, sortedUsers[0]?.userId || ''))

  const allUserDetails = await Promise.all(
    sortedUsers.map(async (user) => {
      const [details] = await db
        .select({
          id: users.id,
          nickname: users.nickname,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, user.userId))
      return details
    })
  )

  const userMap = new Map(allUserDetails.filter(Boolean).map(u => [u!.id, u!]))

  const list: ActiveRankingItem[] = sortedUsers.map((item, index) => {
    const user = userMap.get(item.userId)
    return {
      ...buildRankingItem(
        item.userId,
        user?.nickname || '匿名用户',
        user?.avatarUrl || null,
        item.score,
        offset + index + 1
      ),
      checkinCount: item.checkinCount,
      activityCount: item.activityCount,
    }
  })

  return {
    type: 'active',
    period,
    total,
    page,
    pageSize,
    myRank: null,
    list,
  }
}
