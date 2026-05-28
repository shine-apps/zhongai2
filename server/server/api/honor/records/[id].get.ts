import { getRecordById } from '~/server/services/honor-record.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const id = getRouterParam(event, 'id')!
  const record = await getRecordById(id, auth.userId, auth.role)
  return success(record)
})
