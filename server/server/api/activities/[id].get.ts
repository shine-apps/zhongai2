import { getActivityById } from '#server/services/activity.service'
import { success } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const activity = await getActivityById(id)
  return success(activity)
})
