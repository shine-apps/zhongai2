import { defineEventHandler, getQuery } from 'h3'
import { getPendingMarketPosts } from '~/server/services/market.service'
import { paginated, createErrorResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.isAdmin) {
    throw createErrorResponse(403, 'Admin access required')
  }
  const query = getQuery(event)
  const params = {
    page: query.page ? parseInt(query.page as string) : 1,
    pageSize: query.pageSize ? parseInt(query.pageSize as string) : 10,
  }
  const result = await getPendingMarketPosts(params)
  return paginated(result.list, result.total, result.page, result.pageSize)
})
