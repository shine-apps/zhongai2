import { confirmReceive } from '~/server/services/honor-record.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const record = await confirmReceive(id, event.context.auth.userId, event.context.auth.role)
  return success(record, '确认领取成功')
})
