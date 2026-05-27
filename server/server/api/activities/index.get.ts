import { z } from 'zod'
import { getActivityList } from '~/server/services/activity.service'
import { paginated, createErrorResponse } from '~/server/utils/response'

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  category: z.enum(['elder_care', 'education', 'env', 'disaster', 'other']).optional(),
  status: z.enum(['draft', 'published', 'active', 'completed', 'cancelled']).optional(),
  keyword: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }

  const result = await getActivityList(parsed.data)
  return paginated(result.list, result.total, result.page, result.pageSize)
})
