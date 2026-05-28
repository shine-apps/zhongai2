import { a as defineEventHandler, v as readBody } from '../../../nitro/nitro.mjs';
import { z } from 'zod';
import { d as createErrorResponse, s as success } from '../../../_/response.mjs';
import { l as login } from '../../../_/auth.service.mjs';
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
  code: z.string().min(1),
  phoneCode: z.string().min(1),
  nickname: z.string().optional(),
  avatarUrl: z.string().optional()
});
const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "));
  }
  const { code, phoneCode, nickname, avatarUrl } = parsed.data;
  const result = await login(code, phoneCode, nickname, avatarUrl);
  return success(result);
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
