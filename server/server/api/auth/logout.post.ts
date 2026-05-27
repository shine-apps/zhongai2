import { defineEventHandler } from 'h3'
import { success, createErrorResponse } from '~/server/utils/response'
import { logout } from '~/server/services/auth.service'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth?.sub) {
    throw createErrorResponse(401, 'Unauthorized')
  }

  const result = await logout(auth.sub)
  return success(result)
})
