import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { adminUpdateUser } from '#server/services/user.service'
import { success, createErrorResponse } from '#server/utils/response'

const adminUpdateSchema = z.object({
  role: z.enum(['admin', 'volunteer', 'user']).optional(),
  status: z.enum(['active', 'inactive', 'frozen']).optional(),
  honorLevel: z.number().int().min(0).max(4).optional(),
})

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
  const body = await readBody(event)
  const parsed = adminUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '))
  }
  const user = await adminUpdateUser(id, parsed.data)
  return success(user)
})
