import { claimHonorItem, getUserStats } from '~/server/services/honor.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createErrorResponse(400, '荣誉物品ID不能为空')
  }

  const userStats = await getUserStats(auth.userId)
  const record = await claimHonorItem(auth.userId, id, userStats)
  return success(record)
})
