import { getRanking } from '#server/services/ranking.service'
import { success, createErrorResponse, ResponseCode } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const type = event.context.params?.type as string

  if (type !== 'activity' && type !== 'donation') {
    throw createErrorResponse(400, 'Invalid ranking type. Must be "activity" or "donation".', ResponseCode.BAD_REQUEST)
  }

  const query = getQuery(event)
  const userId = event.context.auth?.userId

  const result = await getRanking(
    type,
    {
      page: query.page as string,
      pageSize: query.pageSize as string,
    },
    userId
  )

  return success(result)
})
