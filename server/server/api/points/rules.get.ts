import { z } from 'zod'
import { getRules } from '~/server/services/points.service'
import { success, createErrorResponse } from '~/server/utils/response'

const querySchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
})

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }

  const isActive = parsed.data.isActive !== undefined ? parsed.data.isActive === 'true' : undefined
  const rules = await getRules(isActive !== undefined ? { isActive } : undefined)
  return success(rules)
})
