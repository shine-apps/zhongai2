import { a as defineEventHandler } from '../../../nitro/nitro.mjs';
import { g as getBalance } from '../../../_/points.service.mjs';
import { d as createErrorResponse, s as success, R as ResponseCode } from '../../../_/response.mjs';
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
import '../../../_/pagination.mjs';
import '../../../_/user.service.mjs';
import '../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const balance_get = defineEventHandler(async (event) => {
  const auth = event.context.auth;
  if (!auth) {
    throw createErrorResponse(401, "Unauthorized", ResponseCode.UNAUTHORIZED);
  }
  const balance = await getBalance(auth.userId);
  return success(balance);
});

export { balance_get as default };
//# sourceMappingURL=balance.get.mjs.map
