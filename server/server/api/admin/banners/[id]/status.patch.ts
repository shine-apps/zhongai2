import { z } from 'zod'
import { updateBannerStatus, requireAdmin } from '~/server/services/banner.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'offline'], { message: '无效的状态值' }),
})

export default defineEventHandler(async (event) => {
  const auth = requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createErrorResponse(400, '轮播图ID不能为空')
  }
  const body = await readBody(event)

  const parsed = updateStatusSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const banner = await updateBannerStatus(id, parsed.data.status, auth.userId)
  return success(banner)
})
