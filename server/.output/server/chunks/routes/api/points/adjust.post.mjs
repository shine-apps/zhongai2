import { a as defineEventHandler, v as readBody } from '../../../nitro/nitro.mjs';
import { z } from 'zod';
import { a as adjustPoints } from '../../../_/points.service.mjs';
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
import '../../../_/user.service.mjs';
import '../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

function requireAdmin(event) {
  if (!event.context.auth || event.context.auth.role !== "admin") {
    throw createErrorResponse(403, "Admin access required", ResponseCode.FORBIDDEN);
  }
}
const adjustPointsSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  pointType: z.enum(["activity", "donation"], { message: "Invalid point type" }),
  amount: z.number().int("Amount must be an integer").refine((val) => val !== 0, "Amount cannot be zero"),
  description: z.string().min(1, "Description is required").max(200, "Description cannot exceed 200 characters")
});
const adjust_post = defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readBody(event);
  const parsed = adjustPointsSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const transaction = await adjustPoints(event.context.auth.userId, parsed.data);
  return success(transaction);
});

export { adjust_post as default };
//# sourceMappingURL=adjust.post.mjs.map
