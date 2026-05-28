import { getHonorItems, getUserStats } from '~/server/services/honor.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const userStats = await getUserStats(auth.userId)
  const items = await getHonorItems(auth.userId, userStats)
  return success(items)
})
