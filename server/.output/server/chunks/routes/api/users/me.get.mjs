import { a as defineEventHandler } from '../../../nitro/nitro.mjs';
import { g as getCurrentUser } from '../../../_/user.service.mjs';
import { s as success, d as createErrorResponse } from '../../../_/response.mjs';
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

function requireAuth(event) {
  if (!event.context.auth) {
    throw createErrorResponse(401, "Authentication required");
  }
}
const me_get = defineEventHandler(async (event) => {
  requireAuth(event);
  const userId = event.context.auth.userId;
  const user = await getCurrentUser(userId);
  return success(user);
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
