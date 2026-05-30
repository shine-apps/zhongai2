import { getPublicPosts } from '#server/services/market.service'
import { paginated } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = event.context.auth?.userId as string | undefined

  const result = await getPublicPosts(
    {
      page: query.page as string | undefined,
      pageSize: query.pageSize as string | undefined,
      type: query.type as string | undefined,
      keyword: query.keyword as string | undefined,
    },
    userId
  )

  return paginated(result.list, result.total, result.page, result.pageSize)
})
