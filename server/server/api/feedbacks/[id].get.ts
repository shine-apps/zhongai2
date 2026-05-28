import { getFeedbackById } from '~/server/services/feedback.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const id = getRouterParam(event, 'id')!
  const feedback = await getFeedbackById(id, auth.userId, auth.role)
  return success(feedback)
})
