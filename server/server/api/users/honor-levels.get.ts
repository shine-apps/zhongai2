import { defineEventHandler } from 'h3'
import { getHonorLevels } from '#server/services/user.service'
import { success } from '#server/utils/response'

export default defineEventHandler(async () => {
  const levels = getHonorLevels()
  return success(levels)
})
