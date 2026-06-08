import { eq, desc, sql, and } from 'drizzle-orm'
import { db } from '#server/db'
import { pointAccounts, users } from '#server/db/schema'
import { parsePaginationQuery } from '#server/utils/pagination'

type RankingType = 'activity' | 'donation'

interface RankingItem {
  rank: number
  userId: string
  nickname: string
  avatarUrl: string | null
  score: number
}

export async function getRanking(
  type: RankingType,
  query: { page?: number | string; pageSize?: number | string },
  userId?: string
) {
  const { page, pageSize, offset } = parsePaginationQuery(query)

  const scoreField =
    type === 'activity'
      ? pointAccounts.activityPointsTotal
      : pointAccounts.donationPointsTotal

  // Only include users with points > 0
  const baseCondition = sql`${scoreField} > 0`

  // Count total users with points
  const [{ value: total }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(pointAccounts)
    .innerJoin(users, eq(pointAccounts.userId, users.id))
    .where(and(baseCondition, eq(users.role, 'volunteer')))

  // Fetch paginated ranking list
  const list = await db
    .select({
      userId: users.id,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
      score: scoreField,
    })
    .from(pointAccounts)
    .innerJoin(users, eq(pointAccounts.userId, users.id))
    .where(and(baseCondition, eq(users.role, 'volunteer')))
    .orderBy(desc(scoreField))
    .limit(pageSize)
    .offset(offset)

  const rankingList: RankingItem[] = list.map((item: { userId: string; nickname: string | null; avatarUrl: string | null; score: number | null }, index: number) => ({
    rank: offset + index + 1,
    userId: item.userId,
    nickname: item.nickname || '匿名用户',
    avatarUrl: item.avatarUrl,
    score: item.score ?? 0,
  }))

  // Get current user's rank if userId is provided
  let myRank: RankingItem | null = null
  if (userId) {
    // Count users with more points than the current user
    const [userAccount] = await db
      .select({ score: scoreField })
      .from(pointAccounts)
      .where(eq(pointAccounts.userId, userId))
      .limit(1)

    if (userAccount && (userAccount.score ?? 0) > 0) {
      const [{ value: rank }] = await db
        .select({ value: sql<number>`count(*)::int` })
        .from(pointAccounts)
        .innerJoin(users, eq(pointAccounts.userId, users.id))
        .where(
          and(
            sql`${scoreField} > ${userAccount.score ?? 0}`,
            eq(users.role, 'volunteer')
          )
        )

      myRank = {
        rank: (rank ?? 0) + 1,
        userId,
        nickname: '', // Not displayed in the bottom bar
        avatarUrl: null,
        score: userAccount.score ?? 0,
      }
    }
  }

  return {
    type,
    list: rankingList,
    myRank,
    total: total ?? 0,
    page,
    pageSize,
  }
}
