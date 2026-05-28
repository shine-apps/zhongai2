import { a as defineEventHandler, j as getQuery } from '../../nitro/nitro.mjs';
import { b as getDonationList } from '../../_/donation.service.mjs';
import { p as paginated, d as createErrorResponse, R as ResponseCode } from '../../_/response.mjs';
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
import '../../_/pagination.mjs';
import '../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

function requireAdmin(event) {
  if (!event.context.auth || event.context.auth.role !== "admin") {
    throw createErrorResponse(403, "\u9700\u8981\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
}
const index_get = defineEventHandler(async (event) => {
  requireAdmin(event);
  const query = getQuery(event);
  const result = await getDonationList({
    page: query.page,
    pageSize: query.pageSize,
    status: query.status,
    donationType: query.donationType,
    startDate: query.startDate,
    endDate: query.endDate
  });
  return paginated(result.list, result.total, result.page, result.pageSize);
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
