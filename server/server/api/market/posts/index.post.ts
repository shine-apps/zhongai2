import { defineEventHandler, readBody } from 'h3'
import { createMarketPost } from '~/server/services/market.service'
import { success, createErrorResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.userId) {
    throw createErrorResponse(401, 'Authentication required')
  }
  const userId = event.context.auth.userId
  const body = await readBody(event)
  const post = await createMarketPost(userId, body)
  return success(post)
})
