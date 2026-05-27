import { defineEventHandler, getRouterParams, readBody } from 'h3'
import { reviewMarketPost } from '~/server/services/market.service'
import { success, createErrorResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.isAdmin) {
    throw createErrorResponse(403, 'Admin access required')
  }
  const reviewerId = event.context.auth.userId
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const post = await reviewMarketPost(reviewerId, id, body.status, body.reviewNote)
  return success(post)
})
