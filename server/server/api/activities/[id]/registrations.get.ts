import { getRegistrations, requireOrganizerOrAdmin } from '~/server/services/activity.service'
import { paginated } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await requireOrganizerOrAdmin(event, id)
  const query = getQuery(event)
  const result = await getRegistrations(id, query)
  return paginated(result.list, result.total, result.page, result.pageSize)
})
