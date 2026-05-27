import { z } from 'zod'
import { defineEventHandler, getQuery } from 'h3'
import { getUserList } from '~/server/services/user.service'
import { paginated, createErrorResponse } from '~/server/utils/response'
import { parsePaginationQuery } from '~/server/utils/pagination'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required')
  }
}

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  role: z.enum(['admin', 'volunteer', 'user']).optional(),
  status: z.enum(['active', 'inactive', 'frozen']).optional(),
  keyword: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }

  const { page, pageSize } = parsePaginationQuery(parsed.data)

  const result = await getUserList({
    page,
    pageSize,
    role: parsed.data.role,
    status: parsed.data.status,
    keyword: parsed.data.keyword,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
