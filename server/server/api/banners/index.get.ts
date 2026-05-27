import { z } from 'zod'
import { getActiveBanners } from '~/server/services/banner.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const querySchema = z.object({
  position: z.enum(['home_top', 'activity', 'launch'], { 
    required_error: 'position是必填参数',
    invalid_type_error: '无效的position值'
  }),
})

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const banners = await getActiveBanners(parsed.data.position)
  return success(banners)
})
