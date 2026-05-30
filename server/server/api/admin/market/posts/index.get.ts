import { getAdminPosts } from '#server/services/market.service'
import { paginated, createErrorResponse, ResponseCode } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth || auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }

  const query = getQuery(event)
  const result = await getAdminPosts({
    page: query.page as string | undefined,
    pageSize: query.pageSize as string | undefined,
    status: query.status as string | undefined,
    type: query.type as string | undefined,
    keyword: query.keyword as string | undefined,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
