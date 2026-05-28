import { z } from 'zod'
import { rateFeedback } from '~/server/services/feedback.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const rateSchema = z.object({
  rating: z.number().int().min(1, '评分必须在1-5之间').max(5, '评分必须在1-5之间'),
  ratingNote: z.string().max(200).optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const parsed = rateSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const feedback = await rateFeedback(id, auth.userId, parsed.data)
  return success(feedback, '评分成功')
})
