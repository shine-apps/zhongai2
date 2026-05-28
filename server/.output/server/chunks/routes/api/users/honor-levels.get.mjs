import { a as defineEventHandler } from '../../../nitro/nitro.mjs';
import { d as getHonorLevels } from '../../../_/user.service.mjs';
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
import '../../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const honorLevels_get = defineEventHandler(async () => {
  const levels = getHonorLevels();
  return success(levels);
});

export { honorLevels_get as default };
//# sourceMappingURL=honor-levels.get.mjs.map
