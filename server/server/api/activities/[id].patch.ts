import { z } from 'zod'
import { updateActivity, requireOrganizerOrAdmin } from '~/server/services/activity.service'
import { success, createErrorResponse, ResponseCode } from '~/server/utils/response'

const updateActivitySchema = z.object({
  title: z.string().min(1).max(100).optional(),
  category: z.enum(['elder_care', 'education', 'env', 'disaster', 'other']).optional(),
  description: z.string().max(20000).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  location: z.string().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  checkinRadius: z.number().int().min(10).max(1000).optional(),
  maxParticipants: z.number().int().positive().nullable().optional(),
  rewardPoints: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const auth = await requireOrganizerOrAdmin(event, id)
  const body = await readBody(event)

  const parsed = updateActivitySchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const activity = await updateActivity(id, parsed.data, auth.userId, auth.role)
  return success(activity)
})
