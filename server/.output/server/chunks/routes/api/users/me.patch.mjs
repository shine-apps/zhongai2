import { a as defineEventHandler, v as readBody } from '../../../nitro/nitro.mjs';
import { z } from 'zod';
import { h as updateUser } from '../../../_/user.service.mjs';
import { d as createErrorResponse, s as success } from '../../../_/response.mjs';
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
import '../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const updateSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().max(500).optional()
});
function requireAuth(event) {
  if (!event.context.auth) {
    throw createErrorResponse(401, "Authentication required");
  }
}
const me_patch = defineEventHandler(async (event) => {
  requireAuth(event);
  const body = await readBody(event);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "));
  }
  const userId = event.context.auth.userId;
  const user = await updateUser(userId, parsed.data);
  return success(user);
});

export { me_patch as default };
//# sourceMappingURL=me.patch.mjs.map
