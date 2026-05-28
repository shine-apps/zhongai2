import { a as defineEventHandler, n as getRouterParam, v as readBody } from '../../../../nitro/nitro.mjs';
import { z } from 'zod';
import { c as completeActivity } from '../../../../_/checkin.service.mjs';
import { i as requireLeaderOrAdmin } from '../../../../_/activity.service.mjs';
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

const completeSchema = z.object({
  checkinIds: z.array(z.string().uuid("\u7B7E\u5230ID\u683C\u5F0F\u4E0D\u6B63\u786E")).min(1, "\u8BF7\u9009\u62E9\u81F3\u5C11\u4E00\u6761\u7B7E\u5230\u8BB0\u5F55")
});
const complete_patch = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const auth = requireLeaderOrAdmin(event);
  const body = await readBody(event);
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.issues.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const result = await completeActivity(id, parsed.data.checkinIds, auth.userId, auth.role);
  return success(result, "\u6D3B\u52A8\u5DF2\u5B8C\u6210\uFF0C\u79EF\u5206\u5DF2\u53D1\u653E");
});

export { complete_patch as default };
//# sourceMappingURL=complete.patch.mjs.map
