import { z } from 'zod'
import { gpsCheckin } from '~/server/services/checkin.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const checkinSchema = z.object({
  checkinType: z.enum(['gps', 'qr_code']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  qrToken: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = event.context.auth
  const body = await readBody(event)

  const parsed = checkinSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const { latitude, longitude } = parsed.data
  const checkin = await gpsCheckin(id, auth.userId, latitude!, longitude!)
  return success(checkin, '签到成功')
})
