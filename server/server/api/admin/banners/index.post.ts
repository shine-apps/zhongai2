import { z } from 'zod'
import { createBanner, requireAdmin } from '~/server/services/banner.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const createBannerSchema = z.object({
  position: z.enum(['home_top', 'activity', 'launch'], { message: '无效的展示位置' }),
  title: z.string().min(2, '标题不能少于2个字符').max(100, '标题不能超过100个字符'),
  imageUrl: z.string().url('图片URL格式无效'),
  linkType: z.enum(['none', 'activity', 'url', 'miniapp']).default('none'),
  linkValue: z.string().optional(),
  sortOrder: z.number().int().min(0, '排序序号不能为负数').default(0),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
})

export default defineEventHandler(async (event) => {
  const auth = requireAdmin(event)
  const body = await readBody(event)

  const parsed = createBannerSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const banner = await createBanner(parsed.data, auth.userId)
  return success(banner)
})
