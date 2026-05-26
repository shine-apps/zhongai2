import { cancelRegistration } from '~/server/services/activity.service'
import { success } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = event.context.auth
  await cancelRegistration(id, auth.userId)
  return success(null, '取消报名成功')
})
