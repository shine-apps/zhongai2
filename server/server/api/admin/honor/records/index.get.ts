import { z } from 'zod'
import { getMyRecords } from '~/server/services/honor-record.service'
import { paginated, createErrorResponse, ResponseCode } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }
}

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  itemType: z.enum(['badge', 'certificate', 'title', 'gift']).optional(),
  status: z.enum(['pending', 'issued', 'received']).optional(),
  userId: z.string().uuid().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const targetUserId = parsed.data.userId || event.context.auth.userId

  const result = await getMyRecords(targetUserId, {
    page: parsed.data.page?.toString(),
    pageSize: parsed.data.pageSize?.toString(),
    itemType: parsed.data.itemType,
    status: parsed.data.status,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
