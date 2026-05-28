import { a as defineEventHandler, n as getRouterParam, v as readBody } from '../../../../nitro/nitro.mjs';
import { z } from 'zod';
import { r as registerActivity } from '../../../../_/activity.service.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const registerSchema = z.object({
  remark: z.string().max(200, "\u5907\u6CE8\u4E0D\u80FD\u8D85\u8FC7200\u4E2A\u5B57\u7B26").optional()
});
const register_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const auth = event.context.auth;
  const body = await readBody(event);
  const parsed = registerSchema.safeParse(body || {});
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const registration = await registerActivity(id, auth.userId, parsed.data.remark);
  return success(registration, "\u62A5\u540D\u6210\u529F");
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
