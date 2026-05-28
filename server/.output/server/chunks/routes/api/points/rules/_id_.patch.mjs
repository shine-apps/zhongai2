import { a as defineEventHandler, v as readBody } from '../../../../nitro/nitro.mjs';
import { z } from 'zod';
import { u as updateRule } from '../../../../_/points.service.mjs';
import { d as createErrorResponse, s as success, R as ResponseCode } from '../../../../_/response.mjs';
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
import '../../../../_/pagination.mjs';
import '../../../../_/user.service.mjs';
import '../../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

function requireAdmin(event) {
  if (!event.context.auth || event.context.auth.role !== "admin") {
    throw createErrorResponse(403, "Admin access required", ResponseCode.FORBIDDEN);
  }
}
const updateRuleSchema = z.object({
  pointsPerUnit: z.number().int("Points per unit must be an integer").min(0, "Points per unit must be non-negative").optional(),
  unitDesc: z.string().max(50).optional(),
  minAmount: z.string().optional(),
  isActive: z.boolean().optional()
});
const _id__patch = defineEventHandler(async (event) => {
  var _a;
  requireAdmin(event);
  const id = (_a = event.context.params) == null ? void 0 : _a.id;
  if (!id) {
    throw createErrorResponse(400, "Rule ID is required", ResponseCode.BAD_REQUEST);
  }
  const body = await readBody(event);
  const parsed = updateRuleSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const rule = await updateRule(id, parsed.data);
  return success(rule);
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
