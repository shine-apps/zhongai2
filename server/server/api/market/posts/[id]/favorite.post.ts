import { defineEventHandler, getRouterParams } from 'h3'
import { favoriteMarketPost } from '~/server/services/market.service'
import { success, createErrorResponse } from '~/server/utils/response'
import { rateLimit } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  rateLimit(event, { max: 20, window: 60 })

  if (!event.context.auth?.userId) {
    throw createErrorResponse(401, 'Authentication required')
  }
  const userId = event.context.auth.userId
  const { id } = getRouterParams(event)
  const post = await favoriteMarketPost(userId, id)
  return success(post)
})
