import { defineEventHandler, getRouterParams } from 'h3'
import { unfavoriteMarketPost } from '~/server/services/market.service'
import { success, createErrorResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.userId) {
    throw createErrorResponse(401, 'Authentication required')
  }
  const userId = event.context.auth.userId
  const { id } = getRouterParams(event)
  const post = await unfavoriteMarketPost(userId, id)
  return success(post)
})
