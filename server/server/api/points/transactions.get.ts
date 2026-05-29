import { getTransactions } from '#server/services/points.service'
import { paginated, createErrorResponse, ResponseCode } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, 'Unauthorized', ResponseCode.UNAUTHORIZED)
  }

  const query = getQuery(event)
  const result = await getTransactions(auth.userId, {
    page: query.page as string,
    pageSize: query.pageSize as string,
    pointType: query.pointType as string,
    changeType: query.changeType as string,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
