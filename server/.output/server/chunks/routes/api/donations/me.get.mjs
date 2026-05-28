import { a as defineEventHandler, j as getQuery } from '../../../nitro/nitro.mjs';
import { d as getMyDonations } from '../../../_/donation.service.mjs';
import { d as createErrorResponse, p as paginated, R as ResponseCode } from '../../../_/response.mjs';
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

const me_get = defineEventHandler(async (event) => {
  const auth = event.context.auth;
  if (!auth) {
    throw createErrorResponse(401, "\u672A\u767B\u5F55", ResponseCode.UNAUTHORIZED);
  }
  const query = getQuery(event);
  const result = await getMyDonations(auth.userId, {
    page: query.page,
    pageSize: query.pageSize,
    status: query.status
  });
  return paginated(result.list, result.total, result.page, result.pageSize);
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
