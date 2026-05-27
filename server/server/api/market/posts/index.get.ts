import { defineEventHandler, getQuery } from 'h3'
import { getMarketPosts } from '~/server/services/market.service'
import { paginated } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = {
    page: query.page ? parseInt(query.page as string) : 1,
    pageSize: query.pageSize ? parseInt(query.pageSize as string) : 10,
    postType: query.postType as string | undefined,
    keyword: query.keyword as string | undefined,
  }
  const currentUserId = event.context.auth?.userId
  const result = await getMarketPosts(params, currentUserId)
  return paginated(result.list, result.total, result.page, result.pageSize)
})
