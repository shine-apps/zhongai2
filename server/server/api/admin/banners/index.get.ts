import { z } from 'zod'
import { getBannerList, requireAdmin } from '~/server/services/banner.service'
import { paginated, createErrorResponse, ResponseCode } from '~/server/utils/response'

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  position: z.enum(['home_top', 'activity', 'launch']).optional(),
  status: z.enum(['draft', 'published', 'offline']).optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const result = await getBannerList(parsed.data)
  return paginated(result.list, result.total, result.page, result.pageSize)
})
