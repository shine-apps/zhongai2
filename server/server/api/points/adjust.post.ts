import { z } from 'zod'
import { adjustPoints } from '~/server/services/points.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required', ResponseCode.FORBIDDEN)
  }
}

const adjustPointsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  pointType: z.enum(['activity', 'donation'], { message: 'Invalid point type' }),
  amount: z.number().int('Amount must be an integer').refine((val) => val !== 0, 'Amount cannot be zero'),
  description: z.string().min(1, 'Description is required').max(200, 'Description cannot exceed 200 characters'),
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
