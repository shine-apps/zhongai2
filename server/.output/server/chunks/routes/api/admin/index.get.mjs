import { a as defineEventHandler, j as getQuery } from '../../../nitro/nitro.mjs';
import { e as getUserList } from '../../../_/user.service.mjs';
import { p as paginated, d as createErrorResponse } from '../../../_/response.mjs';
import { p as parsePaginationQuery } from '../../../_/pagination.mjs';
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
import '../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

function requireAdmin(event) {
  if (!event.context.auth || event.context.auth.role !== "admin") {
    throw createErrorResponse(403, "Admin access required");
  }
}
const index_get = defineEventHandler(async (event) => {
  requireAdmin(event);
  const query = getQuery(event);
  const { page, pageSize } = parsePaginationQuery(query);
  const result = await getUserList({
    page,
    pageSize,
    role: query.role,
    status: query.status,
    keyword: query.keyword
  });
  return paginated(result.list, result.total, result.page, result.pageSize);
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
