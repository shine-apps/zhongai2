import { z } from 'zod'
import { reserveReceive } from '~/server/services/honor-record.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const reserveSchema = z.object({
  receiveLocation: z.string().min(1, '领取地点不能为空'),
  receiveContact: z.string().min(1, '联系方式不能为空'),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const parsed = reserveSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const record = await reserveReceive(id, auth.userId, parsed.data)
  return success(record, '预约成功')
})
