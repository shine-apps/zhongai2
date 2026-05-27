import { defineEventHandler, getRouterParams } from 'h3'
import { getMarketPostById } from '~/server/services/market.service'
import { success } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const currentUserId = event.context.auth?.userId
  const post = await getMarketPostById(id, currentUserId)
  return success(post)
})
