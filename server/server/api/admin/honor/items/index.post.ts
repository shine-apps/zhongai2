import { z } from 'zod'
import { createHonorItem, requireAdmin } from '~/server/services/honor.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const createHonorItemSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100, '名称不能超过100个字符'),
  type: z.enum(['badge', 'certificate', 'gift', 'title'], { message: '无效的物品类型' }),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  imageUrl: z.string().url('图片URL格式无效').optional(),
  unlockType: z.enum(['level', 'activity_count', 'donation_amount'], { message: '无效的解锁类型' }),
  unlockValue: z.number().int().min(0, '解锁值不能为负数'),
  unlockLevel: z.number().int().min(0).optional(),
  unlockActivityCount: z.number().int().min(0).optional(),
  unlockDonationAmount: z.string().optional(),
  stock: z.number().int().min(-1, '库存不能小于-1').optional(),
  isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const auth = requireAdmin(event)
  const body = await readBody(event)

  const parsed = createHonorItemSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const item = await createHonorItem(parsed.data)
  return success(item)
})
