import { z } from 'zod'
import { createFeedback } from '~/server/services/feedback.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const createFeedbackSchema = z.object({
  type: z.enum(['suggestion', 'bug', 'complaint', 'question', 'other']),
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100字'),
  content: z.string().min(1, '内容不能为空'),
  images: z.array(z.string()).optional(),
  contactInfo: z.string().max(100).optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const body = await readBody(event)

  const parsed = createFeedbackSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const feedback = await createFeedback(auth.userId, parsed.data)
  return success(feedback)
})
