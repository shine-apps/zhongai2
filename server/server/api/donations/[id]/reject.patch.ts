import { z } from 'zod'
import { rejectDonation } from '~/server/services/donation.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const rejectSchema = z.object({
  reviewRemark: z.string().min(1),
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

  const parsed = rejectSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const donation = await rejectDonation(id, event.context.auth.userId, parsed.data)
  return success(donation, '捐助已驳回')
})
