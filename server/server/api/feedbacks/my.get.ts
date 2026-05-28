import { z } from 'zod'
import { getMyFeedbacks } from '~/server/services/feedback.service'
import { paginated, createErrorResponse, ResponseCode } from '~/server/utils/response'

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  status: z.enum(['pending', 'processing', 'resolved', 'closed']).optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const result = await getMyFeedbacks(auth.userId, {
    page: parsed.data.page?.toString(),
    pageSize: parsed.data.pageSize?.toString(),
    status: parsed.data.status,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
