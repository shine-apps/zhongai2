import { a as defineEventHandler, n as getRouterParam } from '../../../../nitro/nitro.mjs';
import { j as requireOrganizerOrAdmin, p as publishActivity } from '../../../../_/activity.service.mjs';
import { s as success } from '../../../../_/response.mjs';
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

const publish_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const auth = await requireOrganizerOrAdmin(event, id);
  const activity = await publishActivity(id, auth.userId, auth.role);
  return success(activity, "\u6D3B\u52A8\u5DF2\u53D1\u5E03");
});

export { publish_post as default };
//# sourceMappingURL=publish.post.mjs.map
