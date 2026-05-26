import { z } from 'zod'
import { completeActivity } from '~/server/services/checkin.service'
import { requireLeaderOrAdmin } from '~/server/services/activity.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const completeSchema = z.object({
  checkinIds: z.array(z.string().uuid('签到ID格式不正确')).min(1, '请选择至少一条签到记录'),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = requireLeaderOrAdmin(event)
  const body = await readBody(event)

  const parsed = completeSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const result = await completeActivity(id, parsed.data.checkinIds, auth.userId, auth.role)
  return success(result, '活动已完成，积分已发放')
})
