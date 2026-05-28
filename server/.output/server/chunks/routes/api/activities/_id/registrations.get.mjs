import { a as defineEventHandler, n as getRouterParam, j as getQuery } from '../../../../nitro/nitro.mjs';
import { j as requireOrganizerOrAdmin, h as getRegistrations } from '../../../../_/activity.service.mjs';
import { p as paginated } from '../../../../_/response.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const registrations_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  await requireOrganizerOrAdmin(event, id);
  const query = getQuery(event);
  const result = await getRegistrations(id, query);
  return paginated(result.list, result.total, result.page, result.pageSize);
});

export { registrations_get as default };
//# sourceMappingURL=registrations.get.mjs.map
