import { getMyHonorRecords } from '~/server/services/honor.service'
import { paginated, createErrorResponse, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const query = getQuery(event)
  const result = await getMyHonorRecords(auth.userId, {
    page: query.page as string,
    pageSize: query.pageSize as string,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
