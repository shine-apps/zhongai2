import { a as defineEventHandler, v as readBody } from '../../../nitro/nitro.mjs';
import { z } from 'zod';
import { d as createErrorResponse, s as success } from '../../../_/response.mjs';
import { b as bindPhone } from '../../../_/auth.service.mjs';
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

const schema = z.object({
  phoneCode: z.string().min(1)
});
const phone_post = defineEventHandler(async (event) => {
  const auth = event.context.auth;
  if (!(auth == null ? void 0 : auth.userId)) {
    throw createErrorResponse(401, "Unauthorized");
  }
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "));
  }
  const { phoneCode } = parsed.data;
  const result = await bindPhone(auth.userId, phoneCode);
  return success(result);
});

export { phone_post as default };
//# sourceMappingURL=phone.post.mjs.map
