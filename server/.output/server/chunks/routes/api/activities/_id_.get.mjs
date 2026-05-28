import { a as defineEventHandler, n as getRouterParam } from '../../../nitro/nitro.mjs';
import { g as getActivityById } from '../../../_/activity.service.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const activity = await getActivityById(id);
  return success(activity);
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
