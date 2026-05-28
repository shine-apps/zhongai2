import { a as defineEventHandler, v as readBody } from '../../../../nitro/nitro.mjs';
import { z } from 'zod';
import { v as verifyRealName } from '../../../../_/user.service.mjs';
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

const realNameSchema = z.object({
  realName: z.string().min(2).max(50),
  idCardNo: z.string().length(18)
});
function requireAuth(event) {
  if (!event.context.auth) {
    throw createErrorResponse(401, "Authentication required");
  }
}
const realname_post = defineEventHandler(async (event) => {
  requireAuth(event);
  const body = await readBody(event);
  const parsed = realNameSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "));
  }
  const userId = event.context.auth.userId;
  const user = await verifyRealName(userId, parsed.data);
  return success(user);
});

export { realname_post as default };
//# sourceMappingURL=realname.post.mjs.map
