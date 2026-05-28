import { a as defineEventHandler, n as getRouterParam } from '../../../../../nitro/nitro.mjs';
import { f as getMyRegistration } from '../../../../../_/activity.service.mjs';
import { s as success } from '../../../../../_/response.mjs';
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
import '../../../../../_/pagination.mjs';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const me_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const auth = event.context.auth;
  const registration = await getMyRegistration(id, auth.userId);
  return success(registration);
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
