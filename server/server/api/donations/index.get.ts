import { getDonationList } from '~/server/services/donation.service'
import { paginated, createErrorResponse, ResponseCode } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, '需要管理员权限', ResponseCode.FORBIDDEN)
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const query = getQuery(event)
  const result = await getDonationList({
    page: query.page as string | undefined,
    pageSize: query.pageSize as string | undefined,
    status: query.status as string | undefined,
    donationType: query.donationType as string | undefined,
    startDate: query.startDate as string | undefined,
    endDate: query.endDate as string | undefined,
  })

  return paginated(result.list, result.total, result.page, result.pageSize)
})
