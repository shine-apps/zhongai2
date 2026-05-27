import { db } from '~/server/db'
import { users, activities, activityCheckins, donations, pointTransactions, statsSnapshots } from '~/server/db/schema'
import { eq, and, gte, desc, sql, count, sum } from 'drizzle-orm'
import { startOfDay, startOfWeek, startOfMonth, subDays, format } from 'date-fns'

export type SnapshotType = 'daily' | 'weekly' | 'monthly'

export interface UserStats {
  total: number
  newToday: number
  newWeek: number
  newMonth: number
  activeToday: number
  activeWeek: number
  activeMonth: number
}

export interface ActivityStats {
  total: number
  published: number
  ongoing: number
  completed: number
  avgParticipants: number
  avgCheckinRate: number
}

export interface CheckinStats {
  total: number
  today: number
  week: number
  month: number
  avgPerActivity: number
}

export interface DonationStats {
  totalAmount: number
  totalCount: number
  todayAmount: number
  todayCount: number
  avgAmount: number
}

export interface PointsStats {
  totalDistributed: number
  avgActivityPoints: number
  avgDonationPoints: number
  honorDistribution: Record<string, number>
}

export interface StatsOverview {
  users: UserStats
  activities: ActivityStats
  checkins: CheckinStats
  donations: DonationStats
  points: PointsStats
  updatedAt: string
}

export interface TrendData {
  date: string
  value: number
}

export interface TrendResponse {
  metric: string
  period: 'day' | 'week' | 'month'
  data: TrendData[]
}

export interface PublicStats {
  totalUsers: number
  totalActivities: number
  totalDonations: number
  totalCheckins: number
}

const now = new Date()
const todayStart = startOfDay(now)
const weekStart = startOfWeek(now)
const monthStart = startOfMonth(now)

export async function getPublicStats(): Promise<PublicStats> {
  const [totalUsersResult] = await db
    .select({ value: count() })
    .from(users)

  const [totalActivitiesResult] = await db
    .select({ value: count() })
    .from(activities)
    .where(eq(activities.status, 'published'))

  const [totalDonationsResult] = await db
    .select({ value: sum(donations.amount) })
    .from(donations)
    .where(eq(donations.status, 'approved'))

  const [totalCheckinsResult] = await db
    .select({ value: count() })
    .from(activityCheckins)
    .where(eq(activityCheckins.verified, true))

  return {
    totalUsers: Number(totalUsersResult.value) || 0,
    totalActivities: Number(totalActivitiesResult.value) || 0,
    totalDonations: Number(totalDonationsResult.value) || 0,
    totalCheckins: Number(totalCheckinsResult.value) || 0,
  }
}

export async function getStatsOverview(): Promise<StatsOverview> {
  const [totalUsers] = await db
    .select({ value: count() })
    .from(users)

  const [newTodayUsers] = await db
    .select({ value: count() })
    .from(users)
    .where(gte(users.createdAt, todayStart))

  const [newWeekUsers] = await db
    .select({ value: count() })
    .from(users)
    .where(gte(users.createdAt, weekStart))

  const [newMonthUsers] = await db
    .select({ value: count() })
    .from(users)
    .where(gte(users.createdAt, monthStart))

  const [totalActivities] = await db
    .select({ value: count() })
    .from(activities)

  const [publishedActivities] = await db
    .select({ value: count() })
    .from(activities)
    .where(eq(activities.status, 'published'))

  const [ongoingActivities] = await db
    .select({ value: count() })
    .from(activities)
    .where(eq(activities.status, 'ongoing'))

  const [completedActivities] = await db
    .select({ value: count() })
    .from(activities)
    .where(eq(activities.status, 'completed'))

  const [totalCheckins] = await db
    .select({ value: count() })
    .from(activityCheckins)

  const [todayCheckins] = await db
    .select({ value: count() })
    .from(activityCheckins)
    .where(gte(activityCheckins.checkinTime, todayStart))

  const [weekCheckins] = await db
    .select({ value: count() })
    .from(activityCheckins)
    .where(gte(activityCheckins.checkinTime, weekStart))

  const approvedDonations = await db
    .select()
    .from(donations)
    .where(eq(donations.status, 'approved'))

  const totalDonationsAmount = approvedDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0)
  const totalDonationsCount = approvedDonations.length
  const avgDonationAmount = totalDonationsCount > 0 ? totalDonationsAmount / totalDonationsCount : 0

  const todayDonations = approvedDonations.filter(d => d.createdAt && d.createdAt >= todayStart)
  const todayDonationsAmount = todayDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0)

  const [totalPoints] = await db
    .select({ value: sum(pointTransactions.amount) })
    .from(pointTransactions)
    .where(gte(pointTransactions.amount, 0))

  return {
    users: {
      total: Number(totalUsers.value) || 0,
      newToday: Number(newTodayUsers.value) || 0,
      newWeek: Number(newWeekUsers.value) || 0,
      newMonth: Number(newMonthUsers.value) || 0,
      activeToday: 0,
      activeWeek: 0,
      activeMonth: 0,
    },
    activities: {
      total: Number(totalActivities.value) || 0,
      published: Number(publishedActivities.value) || 0,
      ongoing: Number(ongoingActivities.value) || 0,
      completed: Number(completedActivities.value) || 0,
      avgParticipants: 0,
      avgCheckinRate: 0,
    },
    checkins: {
      total: Number(totalCheckins.value) || 0,
      today: Number(todayCheckins.value) || 0,
      week: Number(weekCheckins.value) || 0,
      month: 0,
      avgPerActivity: 0,
    },
    donations: {
      totalAmount: totalDonationsAmount,
      totalCount: totalDonationsCount,
      todayAmount: todayDonationsAmount,
      todayCount: todayDonations.length,
      avgAmount: avgDonationAmount,
    },
    points: {
      totalDistributed: Number(totalPoints.value) || 0,
      avgActivityPoints: 0,
      avgDonationPoints: 0,
      honorDistribution: {},
    },
    updatedAt: new Date().toISOString(),
  }
}

export async function getTrendData(
  metric: string,
  period: 'day' | 'week' | 'month',
  days: number = 30
): Promise<TrendResponse> {
  const startDate = subDays(now, days)

  const snapshots = await db
    .select()
    .from(statsSnapshots)
    .where(and(
      eq(statsSnapshots.snapshotType, 'daily'),
      gte(statsSnapshots.snapshotDate, format(startDate, 'yyyy-MM-dd'))
    ))
    .orderBy(statsSnapshots.snapshotDate)

  const data: TrendData[] = snapshots.map(snap => {
    let value = 0
    const metrics = snap.metrics as any

    switch (metric) {
      case 'users':
        value = metrics?.users?.newToday || 0
        break
      case 'donations':
        value = metrics?.donations?.todayAmount || 0
        break
      case 'activities':
        value = metrics?.activities?.published || 0
        break
    }

    return {
      date: typeof snap.snapshotDate === 'string' ? snap.snapshotDate : format(snap.snapshotDate, 'yyyy-MM-dd'),
      value,
    }
  })

  return {
    metric,
    period,
    data,
  }
}
