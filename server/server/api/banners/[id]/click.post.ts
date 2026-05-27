import { recordBannerClick } from '~/server/services/banner.service'
import { success } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createErrorResponse(400, '轮播图ID不能为空')
  }

  await recordBannerClick(id)
  return success(null)
})
