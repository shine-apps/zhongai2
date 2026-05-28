import { z } from 'zod'
import { getFeedbackList } from '~/server/services/feedback.service'
import { paginated, createErrorResponse, ResponseCode } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }
}

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  status: z.enum(['pending', 'processing', 'resolved', 'closed']).optional(),
  type: z.enum(['suggestion', 'bug', 'complaint', 'question', 'other']).optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const result = await getFeedbackList({
    page: parsed.data.page?.toString(),
    pageSize: parsed.data.pageSize?.toString(),
    status: parsed.data.status,
    type: parsed.data.type,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
