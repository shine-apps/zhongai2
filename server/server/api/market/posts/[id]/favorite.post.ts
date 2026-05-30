import { toggleFavorite } from '#server/services/market.service'
import { success, createErrorResponse, ResponseCode } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const postId = getRouterParam(event, 'id')!
  const isFavorited = await toggleFavorite(postId, auth.userId)
  return success({ isFavorited }, isFavorited ? '收藏成功' : '取消收藏成功')
})
