import { z } from 'zod'
import { updateHonorItem, requireAdmin } from '~/server/services/honor.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const updateHonorItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['badge', 'certificate', 'gift', 'title']).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  unlockType: z.enum(['level', 'activity_count', 'donation_amount']).optional(),
  unlockValue: z.number().int().min(0).optional(),
  unlockLevel: z.number().int().min(0).optional(),
  unlockActivityCount: z.number().int().min(0).optional(),
  unlockDonationAmount: z.string().optional(),
  stock: z.number().int().min(-1).optional(),
  isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const auth = requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createErrorResponse(400, '荣誉物品ID不能为空')
  }

  const body = await readBody(event)
  const parsed = updateHonorItemSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const item = await updateHonorItem(id, parsed.data)
  return success(item)
})
