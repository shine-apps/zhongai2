import { z } from 'zod'
import { createRule } from '~/server/services/points.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required', ResponseCode.FORBIDDEN)
  }
}

const createRuleSchema = z.object({
  ruleType: z.string().min(1, 'Rule type is required'),
  pointType: z.enum(['activity', 'donation'], { message: 'Invalid point type' }),
  pointsPerUnit: z.number().int('Points per unit must be an integer').positive('Points per unit must be positive'),
  unitDesc: z.string().optional(),
  minAmount: z.number().default(0).optional(),
  maxAmount: z.number().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody(event)
  const parsed = createRuleSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const rule = await createRule(parsed.data)
  return success(rule)
})
