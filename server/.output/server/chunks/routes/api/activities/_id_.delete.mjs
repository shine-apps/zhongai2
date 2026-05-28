import { a as defineEventHandler, n as getRouterParam } from '../../../nitro/nitro.mjs';
import { j as requireOrganizerOrAdmin, d as deleteActivity } from '../../../_/activity.service.mjs';
import { s as success } from '../../../_/response.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const _id__delete = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const auth = await requireOrganizerOrAdmin(event, id);
  await deleteActivity(id, auth.userId, auth.role);
  return success(null, "\u6D3B\u52A8\u5DF2\u5220\u9664");
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
