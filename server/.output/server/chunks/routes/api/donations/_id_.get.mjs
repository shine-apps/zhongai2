import { a as defineEventHandler, n as getRouterParam } from '../../../nitro/nitro.mjs';
import { g as getDonationById } from '../../../_/donation.service.mjs';
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
import '../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const _id__get = defineEventHandler(async (event) => {
  const auth = event.context.auth;
  if (!auth) {
    throw createErrorResponse(401, "\u672A\u767B\u5F55", ResponseCode.UNAUTHORIZED);
  }
  const id = getRouterParam(event, "id");
  const donation = await getDonationById(id, auth.userId, auth.role);
  return success(donation);
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
