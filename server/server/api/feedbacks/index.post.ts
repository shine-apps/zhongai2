import { z } from 'zod'
import { createFeedback } from '~/server/services/feedback.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const createFeedbackSchema = z.object({
  type: z.enum(['suggestion', 'bug', 'complaint', 'question', 'other']),
  title: z.string().min(5, '标题长度需在5-100字符之间').max(100, '标题长度需在5-100字符之间'),
  content: z.string().min(20, '内容长度需在20-2000字符之间').max(2000, '内容长度需在20-2000字符之间'),
  images: z.array(z.string()).max(5, '最多上传5张图片').optional(),
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
