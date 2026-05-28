import { a as defineEventHandler } from '../../../nitro/nitro.mjs';
import { d as createErrorResponse, s as success } from '../../../_/response.mjs';
import { g as getCurrentUser } from '../../../_/auth.service.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'jose';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '../../../_/encryption.mjs';
import 'crypto';
import 'bcryptjs';

const me_get = defineEventHandler(async (event) => {
  const auth = event.context.auth;
  if (!(auth == null ? void 0 : auth.userId)) {
    throw createErrorResponse(401, "Unauthorized");
  }
  const result = await getCurrentUser(auth.userId);
  return success(result);
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
