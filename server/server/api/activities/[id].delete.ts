import { deleteActivity, requireOrganizerOrAdmin } from '~/server/services/activity.service'
import { success } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = await requireOrganizerOrAdmin(event, id)
  await deleteActivity(id, auth.userId, auth.role)
  return success(null, '活动已删除')
})
