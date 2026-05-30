import { getPostById } from '#server/services/market.service'
import { success } from '#server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const userId = event.context.auth?.userId as string | undefined

  const post = await getPostById(id, userId)
  return success(post)
})
