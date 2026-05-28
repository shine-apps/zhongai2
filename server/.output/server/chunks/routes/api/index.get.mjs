import { a as defineEventHandler, j as getQuery } from '../../nitro/nitro.mjs';
import { e as getActivityList } from '../../_/activity.service.mjs';
import { p as paginated } from '../../_/response.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const result = await getActivityList(query);
  return paginated(result.list, result.total, result.page, result.pageSize);
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
