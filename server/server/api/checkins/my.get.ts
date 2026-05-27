import { z } from 'zod'
import { defineEventHandler, getQuery } from 'h3'
import { success, createErrorResponse } from '~/server/utils/response'
import { getMyCheckins } from '~/server/services/checkin.service'

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  activityId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth?.sub) {
    throw createErrorResponse(401, 'Unauthorized')
  }

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }

  const result = await getMyCheckins(auth.sub, parsed.data as Record<string, string | undefined>)

  return success(result)
})
