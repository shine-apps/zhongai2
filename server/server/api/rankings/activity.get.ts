import { getActivityRanking } from '~/server/services/ranking.service'
import { success } from '~/server/utils/response'
import type { RankingPeriod } from '~/server/services/ranking.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const period = (query.period as RankingPeriod) || 'all'
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20

  const ranking = await getActivityRanking(period, page, pageSize)
  return success(ranking)
})
