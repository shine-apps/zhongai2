import { z } from 'zod'
import { getCheckinList } from '~/server/services/checkin.service'
import { requireOrganizerOrAdmin } from '~/server/services/activity.service'
import { paginated, createErrorResponse } from '~/server/utils/response'

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await requireOrganizerOrAdmin(event, id)

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }

  const result = await getCheckinList(id, parsed.data)
  return paginated(result.list, result.total, result.page, result.pageSize)
})
