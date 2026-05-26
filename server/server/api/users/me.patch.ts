import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { updateUser } from '~/server/services/user.service'
import { success, createErrorResponse } from '~/server/utils/response'

const updateSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().max(500).optional(),
})

function requireAuth(event: any) {
  if (!event.context.auth) {
    throw createErrorResponse(401, 'Authentication required')
  }
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody(event)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }
  const userId = event.context.auth.userId
  const user = await updateUser(userId, parsed.data)
  return success(user)
})
