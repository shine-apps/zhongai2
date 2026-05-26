import { z } from 'zod'
import { updateActivity, requireOrganizerOrAdmin } from '~/server/services/activity.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const updateActivitySchema = z.object({
  title: z.string().min(1).max(100).optional(),
  category: z.enum(['education', 'environment', 'elderly', 'medical', 'poverty', 'other']).optional(),
  description: z.string().optional().nullable(),
  coverImage: z.string().max(500).optional().nullable(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  location: z.string().max(200).optional().nullable(),
  latitude: z.coerce.string().optional().nullable(),
  longitude: z.coerce.string().optional().nullable(),
  checkinRadius: z.number().int().min(0).optional(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  rewardPoints: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = await requireOrganizerOrAdmin(event, id)
  const body = await readBody(event)

  const parsed = updateActivitySchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const activity = await updateActivity(id, parsed.data, auth.userId, auth.role)
  return success(activity)
})
