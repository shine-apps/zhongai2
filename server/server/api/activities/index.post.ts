import { z } from 'zod'
import { createActivity, requireLeaderOrAdmin } from '~/server/services/activity.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const createActivitySchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  category: z.enum(['education', 'environment', 'elderly', 'medical', 'poverty', 'other'], { message: '无效的活动类别' }),
  description: z.string().optional(),
  coverImage: z.string().max(500).optional(),
  startTime: z.coerce.date({ message: '无效的开始时间' }),
  endTime: z.coerce.date({ message: '无效的结束时间' }),
  location: z.string().max(200).optional(),
  latitude: z.coerce.string().optional(),
  longitude: z.coerce.string().optional(),
  checkinRadius: z.number().int().min(0).default(200),
  maxParticipants: z.number().int().positive().optional(),
  rewardPoints: z.number().int().min(0, '积分不能为负数'),
})

export default defineEventHandler(async (event) => {
  const auth = requireLeaderOrAdmin(event)
  const body = await readBody(event)

  const parsed = createActivitySchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const activity = await createActivity(parsed.data, auth.userId)
  return success(activity)
})
