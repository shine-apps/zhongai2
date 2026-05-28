import { z } from 'zod'
import { issueHonor } from '~/server/services/honor-record.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }
}

const issueSchema = z.object({
  certificateNo: z.string().optional(),
  certificateUrl: z.string().optional(),
  note: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const parsed = issueSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const record = await issueHonor(id, event.context.auth.userId, event.context.auth.role, parsed.data)
  return success(record, '发放成功')
})
