import { e as db, a as activities, d as createErrorResponse, R as ResponseCode, c as activityRegistrations, b as activityCheckins, u as users, g as pointAccounts, i as pointTransactions } from './response.mjs';
import { eq, and, count, desc, inArray, sql } from 'drizzle-orm';
import { p as parsePaginationQuery } from './pagination.mjs';
import { a as maskPhone } from './encryption.mjs';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => deg * Math.PI / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
async function gpsCheckin(activityId, userId, latitude, longitude) {
  var _a;
  const [activity] = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);
  if (!activity) {
    throw createErrorResponse(404, "\u6D3B\u52A8\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (activity.status !== "ongoing") {
    throw createErrorResponse(400, "\u6D3B\u52A8\u672A\u5728\u8FDB\u884C\u4E2D", ResponseCode.BAD_REQUEST);
  }
  const now = /* @__PURE__ */ new Date();
  if (now < activity.startTime) {
    throw createErrorResponse(400, "\u6D3B\u52A8\u5C1A\u672A\u5F00\u59CB", ResponseCode.BAD_REQUEST);
  }
  if (now > activity.endTime) {
    throw createErrorResponse(400, "\u6D3B\u52A8\u5DF2\u7ED3\u675F", ResponseCode.BAD_REQUEST);
  }
  const [registration] = await db.select().from(activityRegistrations).where(and(
    eq(activityRegistrations.activityId, activityId),
    eq(activityRegistrations.userId, userId)
  )).limit(1);
  if (!registration || registration.status !== "approved") {
    throw createErrorResponse(403, "\u60A8\u672A\u83B7\u5F97\u8BE5\u6D3B\u52A8\u7684\u62A5\u540D\u6279\u51C6", ResponseCode.FORBIDDEN);
  }
  const [existingCheckin] = await db.select().from(activityCheckins).where(and(
    eq(activityCheckins.activityId, activityId),
    eq(activityCheckins.userId, userId)
  )).limit(1);
  if (existingCheckin) {
    throw createErrorResponse(409, "\u60A8\u5DF2\u7B7E\u5230\u8BE5\u6D3B\u52A8", ResponseCode.CONFLICT);
  }
  if (activity.latitude && activity.longitude) {
    const activityLat = parseFloat(activity.latitude);
    const activityLon = parseFloat(activity.longitude);
    const distance = calculateDistance(latitude, longitude, activityLat, activityLon);
    const radius = (_a = activity.checkinRadius) != null ? _a : 200;
    if (distance > radius) {
      throw createErrorResponse(400, `\u60A8\u8DDD\u79BB\u6D3B\u52A8\u5730\u70B9${Math.round(distance)}\u7C73\uFF0C\u8D85\u51FA\u7B7E\u5230\u8303\u56F4${radius}\u7C73`, ResponseCode.BAD_REQUEST);
    }
  }
  const [checkin] = await db.insert(activityCheckins).values({
    activityId,
    userId,
    checkinType: "gps",
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    verified: false,
    pointsGranted: false
  }).returning();
  return checkin;
}
async function verifyCheckin(checkinId, verifierId, verifierRole) {
  if (verifierRole !== "leader" && verifierRole !== "admin") {
    throw createErrorResponse(403, "\u9700\u8981\u56E2\u957F\u6216\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
  const [checkin] = await db.select().from(activityCheckins).where(eq(activityCheckins.id, checkinId)).limit(1);
  if (!checkin) {
    throw createErrorResponse(404, "\u7B7E\u5230\u8BB0\u5F55\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (checkin.verified) {
    throw createErrorResponse(400, "\u8BE5\u7B7E\u5230\u5DF2\u9A8C\u8BC1", ResponseCode.BAD_REQUEST);
  }
  const [updated] = await db.update(activityCheckins).set({
    verified: true,
    verifiedBy: verifierId,
    verifiedAt: /* @__PURE__ */ new Date()
  }).where(eq(activityCheckins.id, checkinId)).returning();
  return updated;
}
async function getCheckinList(activityId, query) {
  const { page, pageSize, offset } = parsePaginationQuery(query);
  const [{ value: total }] = await db.select({ value: count() }).from(activityCheckins).where(eq(activityCheckins.activityId, activityId));
  const list = await db.select({
    id: activityCheckins.id,
    activityId: activityCheckins.activityId,
    userId: activityCheckins.userId,
    checkinType: activityCheckins.checkinType,
    latitude: activityCheckins.latitude,
    longitude: activityCheckins.longitude,
    checkinTime: activityCheckins.checkinTime,
    verified: activityCheckins.verified,
    verifiedBy: activityCheckins.verifiedBy,
    verifiedAt: activityCheckins.verifiedAt,
    pointsGranted: activityCheckins.pointsGranted,
    createdAt: activityCheckins.createdAt,
    userName: users.nickname,
    userAvatar: users.avatarUrl,
    userPhone: users.phone
  }).from(activityCheckins).leftJoin(users, eq(activityCheckins.userId, users.id)).where(eq(activityCheckins.activityId, activityId)).orderBy(desc(activityCheckins.checkinTime)).limit(pageSize).offset(offset);
  const maskedList = list.map((item) => ({
    ...item,
    userPhone: item.userPhone ? maskPhone(item.userPhone) : null
  }));
  return { list: maskedList, total, page, pageSize };
}
async function completeActivity(activityId, checkinIds, operatorId, operatorRole) {
  if (operatorRole !== "leader" && operatorRole !== "admin") {
    throw createErrorResponse(403, "\u9700\u8981\u56E2\u957F\u6216\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
  const [activity] = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);
  if (!activity) {
    throw createErrorResponse(404, "\u6D3B\u52A8\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (activity.status !== "ongoing") {
    throw createErrorResponse(400, "\u6D3B\u52A8\u672A\u5728\u8FDB\u884C\u4E2D", ResponseCode.BAD_REQUEST);
  }
  const checkinRecords = await db.select().from(activityCheckins).where(and(
    eq(activityCheckins.activityId, activityId),
    inArray(activityCheckins.id, checkinIds)
  ));
  if (checkinRecords.length !== checkinIds.length) {
    const foundIds = new Set(checkinRecords.map((c) => c.id));
    const missing = checkinIds.filter((id) => !foundIds.has(id));
    throw createErrorResponse(404, `\u7B7E\u5230\u8BB0\u5F55\u4E0D\u5B58\u5728: ${missing.join(", ")}`, ResponseCode.NOT_FOUND);
  }
  const unverified = checkinRecords.filter((c) => !c.verified);
  if (unverified.length > 0) {
    throw createErrorResponse(400, "\u5B58\u5728\u672A\u9A8C\u8BC1\u7684\u7B7E\u5230\u8BB0\u5F55\uFF0C\u8BF7\u5148\u9A8C\u8BC1", ResponseCode.BAD_REQUEST);
  }
  const alreadyGranted = checkinRecords.filter((c) => c.pointsGranted);
  if (alreadyGranted.length > 0) {
    throw createErrorResponse(400, "\u5B58\u5728\u5DF2\u53D1\u653E\u79EF\u5206\u7684\u7B7E\u5230\u8BB0\u5F55", ResponseCode.BAD_REQUEST);
  }
  const rewardPoints = activity.rewardPoints;
  let totalPointsGranted = 0;
  await db.transaction(async (tx) => {
    for (const checkin of checkinRecords) {
      await tx.insert(pointAccounts).values({
        userId: checkin.userId,
        activityPointsBalance: rewardPoints,
        activityPointsTotal: rewardPoints
      }).onConflictDoUpdate({
        target: pointAccounts.userId,
        set: {
          activityPointsBalance: sql`${pointAccounts.activityPointsBalance} + ${rewardPoints}`,
          activityPointsTotal: sql`${pointAccounts.activityPointsTotal} + ${rewardPoints}`,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      await tx.insert(pointTransactions).values({
        userId: checkin.userId,
        pointType: "activity",
        amount: rewardPoints,
        sourceType: "activity_complete",
        sourceId: activityId,
        description: `\u5B8C\u6210\u6D3B\u52A8\u300C${activity.title}\u300D\u83B7\u5F97\u79EF\u5206`
      });
      await tx.update(activityCheckins).set({ pointsGranted: true }).where(eq(activityCheckins.id, checkin.id));
      totalPointsGranted += rewardPoints;
    }
    await tx.update(activities).set({
      status: "completed",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(activities.id, activityId));
  });
  return {
    activityId,
    checkinCount: checkinRecords.length,
    pointsPerUser: rewardPoints,
    totalPointsGranted
  };
}

export { gpsCheckin as a, completeActivity as c, getCheckinList as g, verifyCheckin as v };
//# sourceMappingURL=checkin.service.mjs.map
