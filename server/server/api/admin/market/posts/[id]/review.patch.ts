import { z } from 'zod'
import { reviewPost } from '#server/services/market.service'
import { success, createErrorResponse, ResponseCode } from '#server/utils/response'

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNote: z.string().max(200).optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth || auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }

  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: any) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const post = await reviewPost(id, auth.userId, parsed.data)
  return success(post)
})
