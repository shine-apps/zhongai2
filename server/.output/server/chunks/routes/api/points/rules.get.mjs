import { a as defineEventHandler, j as getQuery } from '../../../nitro/nitro.mjs';
import { b as getRules } from '../../../_/points.service.mjs';
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
import '../../../_/user.service.mjs';
import '../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const rules_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const isActive = query.isActive !== void 0 ? query.isActive === "true" : void 0;
  const rules = await getRules(isActive !== void 0 ? { isActive } : void 0);
  return success(rules);
});

export { rules_get as default };
//# sourceMappingURL=rules.get.mjs.map
