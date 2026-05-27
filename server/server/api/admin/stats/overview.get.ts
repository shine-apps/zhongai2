import { defineEventHandler } from 'h3'
import { getStatsOverview } from '~/server/services/stats.service'
import { success, createErrorResponse } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required')
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const stats = await getStatsOverview()
  return success(stats)
})
