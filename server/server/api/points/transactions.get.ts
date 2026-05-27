import { z } from 'zod'
import { getTransactions } from '~/server/services/points.service'
import { paginated, createErrorResponse, ResponseCode } from '~/server/utils/response'

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  pointType: z.enum(['activity', 'donation']).optional(),
  changeType: z.enum(['income', 'expense']).optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, 'Unauthorized', ResponseCode.UNAUTHORIZED)
  }

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const result = await getTransactions(auth.userId, {
    page: parsed.data.page?.toString(),
    pageSize: parsed.data.pageSize?.toString(),
    pointType: parsed.data.pointType,
    changeType: parsed.data.changeType,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
