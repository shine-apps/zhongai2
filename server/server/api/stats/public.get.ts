import { getPublicStats } from '~/server/services/stats.service'
import { success } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const stats = await getPublicStats()
  return success(stats)
})
