import { z } from 'zod'
import { adjustPoints } from '~/server/services/points.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required', ResponseCode.FORBIDDEN)
  }
}

const adjustPointsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  pointType: z.enum(['activity', 'donation'], { message: 'Invalid point type' }),
  amount: z.number().int('Amount must be an integer').min(-100, 'Amount must be at least -100').max(100, 'Amount must be at most 100'),
  description: z.string().min(1, 'Description is required'),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody(event)
  const parsed = adjustPointsSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const transaction = await adjustPoints(event.context.auth.userId, parsed.data)
  return success(transaction)
})
