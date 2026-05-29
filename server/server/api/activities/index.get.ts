import { getActivityList } from '#server/services/activity.service'
import { paginated } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const result = await getActivityList(query)
  return paginated(result.list, result.total, result.page, result.pageSize)
})
