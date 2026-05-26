import { z } from 'zod'
import { approveDonation } from '~/server/services/donation.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const approveSchema = z.object({
  pointsToGrant: z.number().int().min(0).optional(),
  reviewRemark: z.string().optional(),
})

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const parsed = approveSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const donation = await approveDonation(id, event.context.auth.userId, parsed.data)
  return success(donation, '捐助已审核通过')
})
