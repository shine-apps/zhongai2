import { getBalance } from '~/server/services/points.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, 'Unauthorized', ResponseCode.UNAUTHORIZED)
  }

  const balance = await getBalance(auth.userId)
  return success(balance)
})
