import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { success, createErrorResponse } from '#server/utils/response'
import * as authService from '#server/services/auth.service'

const schema = z.object({
  refreshToken: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }

  const { refreshToken } = parsed.data
  const result = await authService.refreshToken(refreshToken)

  return success(result)
})
