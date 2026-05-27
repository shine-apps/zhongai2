import { z } from 'zod'
import { createDonation } from '~/server/services/donation.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const createDonationSchema = z.object({
  type: z.enum(['money', 'goods']),
  amount: z.number().positive(),
  description: z.string().optional(),
  voucherImages: z.array(z.string().url()).min(1).max(5),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const body = await readBody(event)

  const parsed = createDonationSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const donation = await createDonation(auth.userId, parsed.data)
  return success(donation)
})
