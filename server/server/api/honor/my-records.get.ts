import { getMyRecords } from '~/server/services/honor-record.service'
import { paginated, createErrorResponse, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const query = getQuery(event)
  const result = await getMyRecords(auth.userId, {
    page: query.page as string,
    pageSize: query.pageSize as string,
    itemType: query.type as string,
    status: query.status as string,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
