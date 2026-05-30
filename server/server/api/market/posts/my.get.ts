import { getMyPosts } from '#server/services/market.service'
import { paginated, createErrorResponse, ResponseCode } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const query = getQuery(event)
  const result = await getMyPosts(auth.userId, {
    page: query.page as string | undefined,
    pageSize: query.pageSize as string | undefined,
    status: query.status as string | undefined,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
