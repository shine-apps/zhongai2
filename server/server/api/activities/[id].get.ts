import { getActivityById } from '#server/services/activity.service'
import { success } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const currentUserId = event.context.auth?.userId
  const activity = await getActivityById(id, currentUserId)
  return success(activity)
})
