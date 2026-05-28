import { e as db, u as users, f as donations, d as createErrorResponse, R as ResponseCode, g as pointAccounts, i as pointTransactions } from './response.mjs';
import { eq, sql, gte, lte, and, count, desc } from 'drizzle-orm';
import { p as parsePaginationQuery } from './pagination.mjs';
import { a as maskPhone } from './encryption.mjs';

async function createDonation(userId, data) {
  var _a, _b;
  const [donation] = await db.insert(donations).values({
    userId,
    donationType: data.donationType,
    amount: (_a = data.amount) == null ? void 0 : _a.toString(),
    materialDesc: data.materialDesc,
    materialValue: (_b = data.materialValue) == null ? void 0 : _b.toString(),
    evidenceImages: data.evidenceImages,
    evidenceDesc: data.evidenceDesc,
    status: "pending",
    pointsGranted: false
  }).returning();
  return donation;
}
async function getMyDonations(userId, query) {
  const { page, pageSize, offset } = parsePaginationQuery(query);
  const conditions = [eq(donations.userId, userId)];
  if (query.status) conditions.push(eq(donations.status, query.status));
  const where = and(...conditions);
  const [{ value: total }] = await db.select({ value: count() }).from(donations).where(where);
  const list = await db.select().from(donations).where(where).orderBy(desc(donations.createdAt)).limit(pageSize).offset(offset);
  return { list, total, page, pageSize };
}
async function getDonationById(donationId, userId, role) {
  const [donation] = await db.select({
    id: donations.id,
    userId: donations.userId,
    donationType: donations.donationType,
    amount: donations.amount,
    materialDesc: donations.materialDesc,
    materialValue: donations.materialValue,
    evidenceImages: donations.evidenceImages,
    evidenceDesc: donations.evidenceDesc,
    status: donations.status,
    reviewerId: donations.reviewerId,
    reviewedAt: donations.reviewedAt,
    reviewRemark: donations.reviewRemark,
    pointsGranted: donations.pointsGranted,
    createdAt: donations.createdAt,
    updatedAt: donations.updatedAt,
    donorNickname: users.nickname,
    donorAvatar: users.avatarUrl,
    donorPhone: users.phone
  }).from(donations).leftJoin(users, eq(donations.userId, users.id)).where(eq(donations.id, donationId)).limit(1);
  if (!donation) {
    throw createErrorResponse(404, "\u6350\u52A9\u8BB0\u5F55\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (role !== "admin" && donation.userId !== userId) {
    throw createErrorResponse(403, "\u65E0\u6743\u67E5\u770B\u6B64\u6350\u52A9\u8BB0\u5F55", ResponseCode.FORBIDDEN);
  }
  return {
    ...donation,
    donorPhone: donation.donorPhone ? maskPhone(donation.donorPhone) : donation.donorPhone
  };
}
async function getDonationList(query) {
  const { page, pageSize, offset } = parsePaginationQuery(query);
  const conditions = [];
  if (query.status) conditions.push(eq(donations.status, query.status));
  if (query.donationType) conditions.push(eq(donations.donationType, query.donationType));
  if (query.startDate) conditions.push(gte(donations.createdAt, new Date(query.startDate)));
  if (query.endDate) conditions.push(lte(donations.createdAt, new Date(query.endDate)));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const [{ value: total }] = await db.select({ value: count() }).from(donations).where(where);
  const list = await db.select({
    id: donations.id,
    userId: donations.userId,
    donationType: donations.donationType,
    amount: donations.amount,
    materialDesc: donations.materialDesc,
    materialValue: donations.materialValue,
    evidenceImages: donations.evidenceImages,
    evidenceDesc: donations.evidenceDesc,
    status: donations.status,
    reviewerId: donations.reviewerId,
    reviewedAt: donations.reviewedAt,
    reviewRemark: donations.reviewRemark,
    pointsGranted: donations.pointsGranted,
    createdAt: donations.createdAt,
    updatedAt: donations.updatedAt,
    donorNickname: users.nickname,
    donorAvatar: users.avatarUrl,
    donorPhone: users.phone
  }).from(donations).leftJoin(users, eq(donations.userId, users.id)).where(where).orderBy(desc(donations.createdAt)).limit(pageSize).offset(offset);
  return {
    list: list.map((item) => ({
      ...item,
      donorPhone: item.donorPhone ? maskPhone(item.donorPhone) : item.donorPhone
    })),
    total,
    page,
    pageSize
  };
}
async function approveDonation(donationId, reviewerId, data) {
  var _a;
  const [existing] = await db.select().from(donations).where(eq(donations.id, donationId)).limit(1);
  if (!existing) {
    throw createErrorResponse(404, "\u6350\u52A9\u8BB0\u5F55\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (existing.status !== "pending") {
    throw createErrorResponse(400, "\u53EA\u6709\u5F85\u5BA1\u6838\u7684\u6350\u52A9\u8BB0\u5F55\u624D\u80FD\u5BA1\u6838\u901A\u8FC7", ResponseCode.BAD_REQUEST);
  }
  const pointsToGrant = (_a = data.pointsToGrant) != null ? _a : 0;
  if (pointsToGrant > 0) {
    await db.transaction(async (tx) => {
      await tx.update(donations).set({
        status: "approved",
        reviewerId,
        reviewedAt: /* @__PURE__ */ new Date(),
        reviewRemark: data.reviewRemark,
        pointsGranted: true,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(donations.id, donationId));
      await tx.update(pointAccounts).set({
        donationPointsBalance: sql`${pointAccounts.donationPointsBalance} + ${pointsToGrant}`,
        donationPointsTotal: sql`${pointAccounts.donationPointsTotal} + ${pointsToGrant}`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(pointAccounts.userId, existing.userId));
      await tx.insert(pointTransactions).values({
        userId: existing.userId,
        pointType: "donation",
        amount: pointsToGrant,
        sourceType: "donation",
        sourceId: donationId,
        description: "\u6350\u52A9\u5BA1\u6838\u901A\u8FC7\uFF0C\u83B7\u5F97\u79EF\u5206"
      });
    });
  } else {
    await db.update(donations).set({
      status: "approved",
      reviewerId,
      reviewedAt: /* @__PURE__ */ new Date(),
      reviewRemark: data.reviewRemark,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(donations.id, donationId));
  }
  const [updated] = await db.select().from(donations).where(eq(donations.id, donationId)).limit(1);
  return updated;
}
async function rejectDonation(donationId, reviewerId, data) {
  const [existing] = await db.select().from(donations).where(eq(donations.id, donationId)).limit(1);
  if (!existing) {
    throw createErrorResponse(404, "\u6350\u52A9\u8BB0\u5F55\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (existing.status !== "pending") {
    throw createErrorResponse(400, "\u53EA\u6709\u5F85\u5BA1\u6838\u7684\u6350\u52A9\u8BB0\u5F55\u624D\u80FD\u9A73\u56DE", ResponseCode.BAD_REQUEST);
  }
  const [updated] = await db.update(donations).set({
    status: "rejected",
    reviewerId,
    reviewedAt: /* @__PURE__ */ new Date(),
    reviewRemark: data.reviewRemark,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(donations.id, donationId)).returning();
  return updated;
}

export { approveDonation as a, getDonationList as b, createDonation as c, getMyDonations as d, getDonationById as g, rejectDonation as r };
//# sourceMappingURL=donation.service.mjs.map
