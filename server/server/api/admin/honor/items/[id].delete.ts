import { deleteHonorItem, requireAdmin } from '~/server/services/honor.service'
import { success, createErrorResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createErrorResponse(400, '荣誉物品ID不能为空')
  }

  await deleteHonorItem(id)
  return success(null)
})
