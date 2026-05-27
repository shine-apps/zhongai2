import { defineEventHandler, getQuery } from 'h3'
import { getMyMarketPosts } from '~/server/services/market.service'
import { paginated, createErrorResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.userId) {
    throw createErrorResponse(401, 'Authentication required')
  }
  const userId = event.context.auth.userId
  const query = getQuery(event)
  const params = {
    page: query.page ? parseInt(query.page as string) : 1,
    pageSize: query.pageSize ? parseInt(query.pageSize as string) : 10,
    postType: query.postType as string | undefined,
  }
  const result = await getMyMarketPosts(userId, params)
  return paginated(result.list, result.total, result.page, result.pageSize)
})
