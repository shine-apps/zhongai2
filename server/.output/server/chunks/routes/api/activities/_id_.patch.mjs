import { a as defineEventHandler, n as getRouterParam, v as readBody } from '../../../nitro/nitro.mjs';
import { z } from 'zod';
import { j as requireOrganizerOrAdmin, u as updateActivity } from '../../../_/activity.service.mjs';
import { d as createErrorResponse, s as success, R as ResponseCode } from '../../../_/response.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'jose';
import 'drizzle-orm';
import '../../../_/pagination.mjs';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const updateActivitySchema = z.object({
  title: z.string().min(1).max(100).optional(),
  category: z.enum(["education", "environment", "elderly", "medical", "poverty", "other"]).optional(),
  description: z.string().optional().nullable(),
  coverImage: z.string().max(500).optional().nullable(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  location: z.string().max(200).optional().nullable(),
  latitude: z.coerce.string().optional().nullable(),
  longitude: z.coerce.string().optional().nullable(),
  checkinRadius: z.number().int().min(0).optional(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  rewardPoints: z.number().int().min(0).optional()
});
const _id__patch = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const auth = await requireOrganizerOrAdmin(event, id);
  const body = await readBody(event);
  const parsed = updateActivitySchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const activity = await updateActivity(id, parsed.data, auth.userId, auth.role);
  return success(activity);
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
