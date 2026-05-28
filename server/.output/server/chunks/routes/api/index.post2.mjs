import { a as defineEventHandler, v as readBody } from '../../nitro/nitro.mjs';
import { z } from 'zod';
import { c as createDonation } from '../../_/donation.service.mjs';
import { d as createErrorResponse, s as success, R as ResponseCode } from '../../_/response.mjs';
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
import '../../_/encryption.mjs';
import 'crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const createDonationSchema = z.object({
  donationType: z.enum(["money", "material"]),
  amount: z.number().positive().optional(),
  materialDesc: z.string().optional(),
  materialValue: z.number().positive().optional(),
  evidenceImages: z.array(z.string().url()).min(1).max(5),
  evidenceDesc: z.string().optional()
});
const index_post = defineEventHandler(async (event) => {
  const auth = event.context.auth;
  if (!auth) {
    throw createErrorResponse(401, "\u672A\u767B\u5F55", ResponseCode.UNAUTHORIZED);
  }
  const body = await readBody(event);
  const parsed = createDonationSchema.safeParse(body);
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(", "), ResponseCode.VALIDATION_ERROR);
  }
  const donation = await createDonation(auth.userId, parsed.data);
  return success(donation);
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
