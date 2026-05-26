import { defineEventHandler, getQuery } from 'h3'
import { getUserList } from '~/server/services/user.service'
import { paginated, createErrorResponse } from '~/server/utils/response'
import { parsePaginationQuery } from '~/server/utils/pagination'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required')
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const query = getQuery(event)
  const { page, pageSize } = parsePaginationQuery(query)

  const result = await getUserList({
    page,
    pageSize,
    role: query.role as string | undefined,
    status: query.status as string | undefined,
    keyword: query.keyword as string | undefined,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
