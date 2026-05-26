import { getMyRegistration } from '~/server/services/activity.service'
import { success } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = event.context.auth
  const registration = await getMyRegistration(id, auth.userId)
  return success(registration)
})
