import { z } from 'zod'
import { verifyCheckin } from '~/server/services/checkin.service'
import { requireLeaderOrAdmin } from '~/server/services/activity.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const verifySchema = z.object({
  checkinId: z.string().uuid('签到ID格式不正确'),
})

export default defineEventHandler(async (event) => {
  const auth = requireLeaderOrAdmin(event)
  const body = await readBody(event)

  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const checkin = await verifyCheckin(parsed.data.checkinId, auth.userId, auth.role)
  return success(checkin, '签到验证成功')
})
