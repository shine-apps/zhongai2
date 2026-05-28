import { a as defineEventHandler, n as getRouterParam, v as readBody } from '../../../../nitro/nitro.mjs';
import { z } from 'zod';
import { a as gpsCheckin } from '../../../../_/checkin.service.mjs';
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
import '../../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const checkinSchema = z.object({
  latitude: z.number({ message: "\u7EAC\u5EA6\u4E0D\u80FD\u4E3A\u7A7A" }),
  longitude: z.number({ message: "\u7ECF\u5EA6\u4E0D\u80FD\u4E3A\u7A7A" })
});
const checkin_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const auth = event.context.auth;
  const body = await readBody(event);
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const checkin = await gpsCheckin(id, auth.userId, parsed.data.latitude, parsed.data.longitude);
  return success(checkin, "\u7B7E\u5230\u6210\u529F");
});

export { checkin_post as default };
//# sourceMappingURL=checkin.post.mjs.map
