import { a as defineEventHandler, n as getRouterParam, v as readBody } from '../../../../nitro/nitro.mjs';
import { z } from 'zod';
import { r as rejectDonation } from '../../../../_/donation.service.mjs';
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

const rejectSchema = z.object({
  reviewRemark: z.string().min(1)
});
function requireAdmin(event) {
  if (!event.context.auth || event.context.auth.role !== "admin") {
    throw createErrorResponse(403, "\u9700\u8981\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
}
const reject_patch = defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const parsed = rejectSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const donation = await rejectDonation(id, event.context.auth.userId, parsed.data);
  return success(donation, "\u6350\u52A9\u5DF2\u9A73\u56DE");
});

export { reject_patch as default };
//# sourceMappingURL=reject.patch.mjs.map
