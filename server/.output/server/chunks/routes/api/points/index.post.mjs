import { a as defineEventHandler, v as readBody } from '../../../nitro/nitro.mjs';
import { z } from 'zod';
import { c as createRule } from '../../../_/points.service.mjs';
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
const createRuleSchema = z.object({
  ruleType: z.string().min(1, "Rule type is required").max(30),
  pointType: z.enum(["activity", "donation"], { message: "Invalid point type" }),
  pointsPerUnit: z.number().int("Points per unit must be an integer").min(0, "Points per unit must be non-negative"),
  unitDesc: z.string().max(50).optional(),
  minAmount: z.string().optional(),
  isActive: z.boolean().optional()
});
const index_post = defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readBody(event);
  const parsed = createRuleSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const rule = await createRule(parsed.data);
  return success(rule);
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
