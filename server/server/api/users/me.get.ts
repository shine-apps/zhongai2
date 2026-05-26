import { defineEventHandler } from 'h3'
import { getCurrentUser } from '~/server/services/user.service'
import { success, createErrorResponse } from '~/server/utils/response'

function requireAuth(event: any) {
  if (!event.context.auth) {
    throw createErrorResponse(401, 'Authentication required')
  }
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const userId = event.context.auth.userId
  const user = await getCurrentUser(userId)
  return success(user)
})
