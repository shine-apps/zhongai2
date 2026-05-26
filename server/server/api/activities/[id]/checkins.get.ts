import { getCheckinList } from '~/server/services/checkin.service'
import { requireOrganizerOrAdmin } from '~/server/services/activity.service'
import { paginated } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await requireOrganizerOrAdmin(event, id)
  const query = getQuery(event)
  const result = await getCheckinList(id, query)
  return paginated(result.list, result.total, result.page, result.pageSize)
})
