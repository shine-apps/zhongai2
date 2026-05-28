import { a as defineEventHandler, v as readBody } from '../../../../../nitro/nitro.mjs';
import { z } from 'zod';
import { v as verifyCheckin } from '../../../../../_/checkin.service.mjs';
import { i as requireLeaderOrAdmin } from '../../../../../_/activity.service.mjs';
import { d as createErrorResponse, s as success, R as ResponseCode } from '../../../../../_/response.mjs';
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
import '../../../../../_/pagination.mjs';
import '../../../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const verifySchema = z.object({
  checkinId: z.string().uuid("\u7B7E\u5230ID\u683C\u5F0F\u4E0D\u6B63\u786E")
});
const verify_post = defineEventHandler(async (event) => {
  const auth = requireLeaderOrAdmin(event);
  const body = await readBody(event);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const checkin = await verifyCheckin(parsed.data.checkinId, auth.userId, auth.role);
  return success(checkin, "\u7B7E\u5230\u9A8C\u8BC1\u6210\u529F");
});

export { verify_post as default };
//# sourceMappingURL=verify.post.mjs.map
