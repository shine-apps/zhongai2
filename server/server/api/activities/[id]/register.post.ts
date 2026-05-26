import { z } from 'zod'
import { registerActivity } from '~/server/services/activity.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const registerSchema = z.object({
  remark: z.string().max(200, '备注不能超过200个字符').optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = event.context.auth
  const body = await readBody(event)

  const parsed = registerSchema.safeParse(body || {})
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const registration = await registerActivity(id, auth.userId, parsed.data.remark)
  return success(registration, '报名成功')
})
