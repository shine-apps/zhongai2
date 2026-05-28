import { a as defineEventHandler } from '../../../../../nitro/nitro.mjs';
import { f as freezeUser } from '../../../../../_/user.service.mjs';
import { d as createErrorResponse, s as success } from '../../../../../_/response.mjs';
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
import '../../../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

function requireAdmin(event) {
  if (!event.context.auth || event.context.auth.role !== "admin") {
    throw createErrorResponse(403, "Admin access required");
  }
}
const freeze_post = defineEventHandler(async (event) => {
  var _a;
  requireAdmin(event);
  const id = (_a = event.context.params) == null ? void 0 : _a.id;
  if (!id) {
    throw createErrorResponse(400, "User ID is required");
  }
  const user = await freezeUser(id);
  return success(user);
});

export { freeze_post as default };
//# sourceMappingURL=freeze.post.mjs.map
