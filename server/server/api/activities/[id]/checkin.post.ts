import { z } from 'zod'
import { gpsCheckin } from '~/server/services/checkin.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const checkinSchema = z.discriminatedUnion('checkinType', [
  z.object({
    checkinType: z.literal('gps'),
    latitude: z.number().min(-90).max(90, '纬度范围 -90~90'),
    longitude: z.number().min(-180).max(180, '经度范围 -180~180'),
  }),
  z.object({
    checkinType: z.literal('qr_code'),
    qrToken: z.string().min(1, '二维码令牌不能为空'),
  }),
])

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = event.context.auth
  const body = await readBody(event)

  const parsed = checkinSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const data = parsed.data
  if (data.checkinType === 'gps') {
    const checkin = await gpsCheckin(id, auth.userId, data.latitude, data.longitude)
    return success(checkin, '签到成功')
  }

  throw createErrorResponse(501, '二维码签到暂未实现', ResponseCode.BAD_REQUEST)
})
