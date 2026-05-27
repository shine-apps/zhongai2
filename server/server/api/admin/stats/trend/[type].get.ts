import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import { getTrendData } from '~/server/services/stats.service'
import { success, createErrorResponse } from '~/server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required')
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const type = getRouterParam(event, 'type')
  const query = getQuery(event)
  
  if (!type || !['users', 'donations', 'activities'].includes(type)) {
    throw createErrorResponse(400, 'Invalid trend type')
  }
  
  const period = (query.period as 'day' | 'week' | 'month') || 'day'
  const days = query.days ? Number(query.days) : 30
  
  const result = await getTrendData(type, period, days)
  return success(result)
})
