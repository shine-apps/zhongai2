import { getRules } from '~/server/services/points.service'
import { success } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined

  const rules = await getRules(isActive !== undefined ? { isActive } : undefined)
  return success(rules)
})
