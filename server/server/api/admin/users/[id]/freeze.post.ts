import { defineEventHandler } from 'h3'
import { freezeUser } from '~/server/services/user.service'
import { success, createErrorResponse } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required')
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = event.context.params?.id
  if (!id) {
    throw createErrorResponse(400, 'User ID is required')
  }
  const user = await freezeUser(id)
  return success(user)
})
