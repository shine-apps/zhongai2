import { deletePost } from '#server/services/market.service'
import { success, createErrorResponse, ResponseCode } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const id = getRouterParam(event, 'id')!
  await deletePost(id, auth.userId)
  return success(null, '删除成功')
})
