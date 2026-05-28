import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { verifyRealName } from '#server/services/user.service'
import { success, createErrorResponse } from '#server/utils/response'

const realNameSchema = z.object({
  realName: z.string().min(2).max(50),
  idCardNo: z.string().length(18),
})

function requireAuth(event: any) {
  if (!event.context.auth) {
    throw createErrorResponse(401, 'Authentication required')
  }
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody(event)
  const parsed = realNameSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }
  const userId = event.context.auth.userId
  const user = await verifyRealName(userId, parsed.data)
  return success(user)
})
