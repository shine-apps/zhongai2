import { a as defineEventHandler, n as getRouterParam } from '../../../../nitro/nitro.mjs';
import { a as cancelRegistration } from '../../../../_/activity.service.mjs';
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

const register_delete = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const auth = event.context.auth;
  await cancelRegistration(id, auth.userId);
  return success(null, "\u53D6\u6D88\u62A5\u540D\u6210\u529F");
});

export { register_delete as default };
//# sourceMappingURL=register.delete.mjs.map
