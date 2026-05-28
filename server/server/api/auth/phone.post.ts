import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { success, createErrorResponse } from '#server/utils/response'
import * as authService from '#server/services/auth.service'

const schema = z.object({
  phoneCode: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth?.userId) {
    throw createErrorResponse(401, 'Unauthorized')
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }

  const { phoneCode } = parsed.data
  const result = await authService.bindPhone(auth.userId, phoneCode)

  return success(result)
})
