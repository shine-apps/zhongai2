import { z } from 'zod'
import { createDonation } from '~/server/services/donation.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const createDonationSchema = z.object({
  donationType: z.enum(['money', 'material']),
  amount: z.number().positive().optional(),
  materialDesc: z.string().optional(),
  materialValue: z.number().positive().optional(),
  evidenceImages: z.array(z.string().url()).min(1).max(5),
  evidenceDesc: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const body = await readBody(event)

  const parsed = createDonationSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const donation = await createDonation(auth.userId, parsed.data)
  return success(donation)
})
