import { defineEventHandler } from 'h3'
import { success, createErrorResponse } from '~/server/utils/response'
import * as authService from '~/server/services/auth.service'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth?.userId) {
    throw createErrorResponse(401, 'Unauthorized')
  }

  const result = await authService.getCurrentUser(auth.userId)

  return success(result)
})
