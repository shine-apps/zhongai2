import { a as defineEventHandler, v as readBody } from '../../../nitro/nitro.mjs';
import { z } from 'zod';
import { d as createErrorResponse, s as success } from '../../../_/response.mjs';
import { a as adminLogin } from '../../../_/auth.service.mjs';
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
  username: z.string().min(1),
  password: z.string().min(1)
});
const adminLogin_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "));
  }
  const { username, password } = parsed.data;
  const result = await adminLogin(username, password);
  return success(result);
});

export { adminLogin_post as default };
//# sourceMappingURL=admin-login.post.mjs.map
