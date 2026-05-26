import { z } from 'zod'
import { gpsCheckin } from '~/server/services/checkin.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const checkinSchema = z.object({
  latitude: z.number({ message: '纬度不能为空' }),
  longitude: z.number({ message: '经度不能为空' }),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = event.context.auth
  const body = await readBody(event)

  const parsed = checkinSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const checkin = await gpsCheckin(id, auth.userId, parsed.data.latitude, parsed.data.longitude)
  return success(checkin, '签到成功')
})
