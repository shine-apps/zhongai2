import { deleteBanner, requireAdmin } from '~/server/services/banner.service'
import { success, createErrorResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createErrorResponse(400, '轮播图ID不能为空')
  }

  await deleteBanner(id)
  return success(null)
})
