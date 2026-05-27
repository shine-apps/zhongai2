import { z } from 'zod'
import { updateBanner, requireAdmin } from '~/server/services/banner.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const updateBannerSchema = z.object({
  position: z.enum(['home_top', 'activity', 'launch']).optional(),
  title: z.string().min(2).max(100).optional(),
  imageUrl: z.string().url().optional(),
  linkType: z.enum(['none', 'activity', 'url', 'miniapp']).optional(),
  linkValue: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
  startTime: z.coerce.date().nullable().optional(),
  endTime: z.coerce.date().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const auth = requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createErrorResponse(400, '轮播图ID不能为空')
  }
  const body = await readBody(event)

  const parsed = updateBannerSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const banner = await updateBanner(id, parsed.data, auth.userId)
  return success(banner)
})
