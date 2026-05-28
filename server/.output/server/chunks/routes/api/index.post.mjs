import { a as defineEventHandler, v as readBody } from '../../nitro/nitro.mjs';
import { z } from 'zod';
import { i as requireLeaderOrAdmin, b as createActivity } from '../../_/activity.service.mjs';
import { d as createErrorResponse, s as success, R as ResponseCode } from '../../_/response.mjs';
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
import '../../_/pagination.mjs';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const createActivitySchema = z.object({
  title: z.string().min(1, "\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A").max(100, "\u6807\u9898\u4E0D\u80FD\u8D85\u8FC7100\u4E2A\u5B57\u7B26"),
  category: z.enum(["education", "environment", "elderly", "medical", "poverty", "other"], { message: "\u65E0\u6548\u7684\u6D3B\u52A8\u7C7B\u522B" }),
  description: z.string().optional(),
  coverImage: z.string().max(500).optional(),
  startTime: z.coerce.date({ message: "\u65E0\u6548\u7684\u5F00\u59CB\u65F6\u95F4" }),
  endTime: z.coerce.date({ message: "\u65E0\u6548\u7684\u7ED3\u675F\u65F6\u95F4" }),
  location: z.string().max(200).optional(),
  latitude: z.coerce.string().optional(),
  longitude: z.coerce.string().optional(),
  checkinRadius: z.number().int().min(0).default(200),
  maxParticipants: z.number().int().positive().optional(),
  rewardPoints: z.number().int().min(0, "\u79EF\u5206\u4E0D\u80FD\u4E3A\u8D1F\u6570")
});
const index_post = defineEventHandler(async (event) => {
  const auth = requireLeaderOrAdmin(event);
  const body = await readBody(event);
  const parsed = createActivitySchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const activity = await createActivity(parsed.data, auth.userId);
  return success(activity);
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
