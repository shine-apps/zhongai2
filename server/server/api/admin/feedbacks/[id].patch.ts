import { z } from 'zod'
import { processFeedback } from '~/server/services/feedback.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }
}

const processSchema = z.object({
  response: z.string().min(1, '处理回复不能为空'),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const parsed = processSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const feedback = await processFeedback(id, event.context.auth.userId, parsed.data, event.context.auth.role)
  return success(feedback, '反馈已开始处理')
})
