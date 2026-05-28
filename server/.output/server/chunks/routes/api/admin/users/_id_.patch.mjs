import { a as defineEventHandler, v as readBody } from '../../../../nitro/nitro.mjs';
import { z } from 'zod';
import { b as adminUpdateUser } from '../../../../_/user.service.mjs';
import { d as createErrorResponse, s as success } from '../../../../_/response.mjs';
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
import '../../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const adminUpdateSchema = z.object({
  role: z.enum(["admin", "volunteer", "user"]).optional(),
  status: z.enum(["active", "inactive", "frozen"]).optional(),
  honorLevel: z.number().int().min(0).max(4).optional()
});
function requireAdmin(event) {
  if (!event.context.auth || event.context.auth.role !== "admin") {
    throw createErrorResponse(403, "Admin access required");
  }
}
const _id__patch = defineEventHandler(async (event) => {
  var _a;
  requireAdmin(event);
  const id = (_a = event.context.params) == null ? void 0 : _a.id;
  if (!id) {
    throw createErrorResponse(400, "User ID is required");
  }
  const body = await readBody(event);
  const parsed = adminUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "));
  }
  const user = await adminUpdateUser(id, parsed.data);
  return success(user);
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
