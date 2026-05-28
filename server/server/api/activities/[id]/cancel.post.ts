import { cancelActivity, requireOrganizerOrAdmin } from '#server/services/activity.service'
import { success } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = await requireOrganizerOrAdmin(event, id)
  const activity = await cancelActivity(id, auth.userId, auth.role)
  return success(activity, '活动已取消')
})
