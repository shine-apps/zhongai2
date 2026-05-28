import { z } from 'zod'
import { updateRule } from '#server/services/points.service'
import { success, createErrorResponse, ResponseCode } from '#server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required', ResponseCode.FORBIDDEN)
  }
}

const updateRuleSchema = z.object({
  pointsPerUnit: z.number().int('Points per unit must be an integer').min(0, 'Points per unit must be non-negative').optional(),
  unitDesc: z.string().max(50).optional(),
  minAmount: z.string().optional(),
  isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = event.context.params?.id
  if (!id) {
    throw createErrorResponse(400, 'Rule ID is required', ResponseCode.BAD_REQUEST)
  }

  const body = await readBody(event)
  const parsed = updateRuleSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const rule = await updateRule(id, parsed.data)
  return success(rule)
})
