import { d as createErrorResponse, e as db, a as activities, u as users, R as ResponseCode, c as activityRegistrations } from './response.mjs';
import { eq, and, sql, count, desc, ilike, gte, lte } from 'drizzle-orm';
import { p as parsePaginationQuery } from './pagination.mjs';

function requireLeaderOrAdmin(event) {
  const auth = event.context.auth;
  if (!auth || auth.role !== "leader" && auth.role !== "admin") {
    throw createErrorResponse(403, "\u9700\u8981\u56E2\u957F\u6216\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
  return auth;
}
async function requireOrganizerOrAdmin(event, activityId) {
  const auth = event.context.auth;
  if (!auth) {
    throw createErrorResponse(401, "\u672A\u767B\u5F55", ResponseCode.UNAUTHORIZED);
  }
  if (auth.role === "admin") return auth;
  const [activity] = await db.select({ organizerId: activities.organizerId }).from(activities).where(eq(activities.id, activityId)).limit(1);
  if (!activity) {
    throw createErrorResponse(404, "\u6D3B\u52A8\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (activity.organizerId !== auth.userId) {
    throw createErrorResponse(403, "\u9700\u8981\u6D3B\u52A8\u7EC4\u7EC7\u8005\u6216\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
  return auth;
}
async function getActivityList(query) {
  const { page, pageSize, offset } = parsePaginationQuery(query);
  const conditions = [];
  if (query.category) conditions.push(eq(activities.category, query.category));
  if (query.status) conditions.push(eq(activities.status, query.status));
  if (query.keyword) conditions.push(ilike(activities.title, `%${query.keyword}%`));
  if (query.startDate) conditions.push(gte(activities.startTime, new Date(query.startDate)));
  if (query.endDate) conditions.push(lte(activities.endTime, new Date(query.endDate)));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const [{ value: total }] = await db.select({ value: count() }).from(activities).where(where);
  const list = await db.select({
    id: activities.id,
    title: activities.title,
    category: activities.category,
    description: activities.description,
    coverImage: activities.coverImage,
    startTime: activities.startTime,
    endTime: activities.endTime,
    location: activities.location,
    latitude: activities.latitude,
    longitude: activities.longitude,
    checkinRadius: activities.checkinRadius,
    maxParticipants: activities.maxParticipants,
    currentParticipants: activities.currentParticipants,
    rewardPoints: activities.rewardPoints,
    status: activities.status,
    organizerId: activities.organizerId,
    publishedAt: activities.publishedAt,
    createdAt: activities.createdAt,
    updatedAt: activities.updatedAt,
    organizerName: users.nickname,
    organizerAvatar: users.avatarUrl
  }).from(activities).leftJoin(users, eq(activities.organizerId, users.id)).where(where).orderBy(desc(activities.createdAt)).limit(pageSize).offset(offset);
  return { list, total, page, pageSize };
}
async function getActivityById(activityId) {
  const [activity] = await db.select({
    id: activities.id,
    title: activities.title,
    category: activities.category,
    description: activities.description,
    coverImage: activities.coverImage,
    startTime: activities.startTime,
    endTime: activities.endTime,
    location: activities.location,
    latitude: activities.latitude,
    longitude: activities.longitude,
    checkinRadius: activities.checkinRadius,
    maxParticipants: activities.maxParticipants,
    currentParticipants: activities.currentParticipants,
    rewardPoints: activities.rewardPoints,
    status: activities.status,
    organizerId: activities.organizerId,
    publishedAt: activities.publishedAt,
    createdAt: activities.createdAt,
    updatedAt: activities.updatedAt,
    organizerName: users.nickname,
    organizerAvatar: users.avatarUrl
  }).from(activities).leftJoin(users, eq(activities.organizerId, users.id)).where(eq(activities.id, activityId)).limit(1);
  if (!activity) {
    throw createErrorResponse(404, "\u6D3B\u52A8\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  return activity;
}
async function createActivity(data, organizerId) {
  const [activity] = await db.insert(activities).values({
    title: data.title,
    category: data.category,
    description: data.description,
    coverImage: data.coverImage,
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location,
    latitude: data.latitude,
    longitude: data.longitude,
    checkinRadius: data.checkinRadius,
    maxParticipants: data.maxParticipants,
    rewardPoints: data.rewardPoints,
    organizerId,
    status: "draft"
  }).returning();
  return activity;
}
async function updateActivity(activityId, data, userId, role) {
  const [existing] = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);
  if (!existing) {
    throw createErrorResponse(404, "\u6D3B\u52A8\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (role !== "admin" && existing.organizerId !== userId) {
    throw createErrorResponse(403, "\u9700\u8981\u6D3B\u52A8\u7EC4\u7EC7\u8005\u6216\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
  const updateData = { updatedAt: /* @__PURE__ */ new Date() };
  const allowedFields = [
    "title",
    "category",
    "description",
    "coverImage",
    "startTime",
    "endTime",
    "location",
    "latitude",
    "longitude",
    "checkinRadius",
    "maxParticipants",
    "rewardPoints"
  ];
  for (const field of allowedFields) {
    if (data[field] !== void 0) {
      updateData[field] = data[field];
    }
  }
  const [updated] = await db.update(activities).set(updateData).where(eq(activities.id, activityId)).returning();
  return updated;
}
async function publishActivity(activityId, userId, role) {
  const [existing] = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);
  if (!existing) {
    throw createErrorResponse(404, "\u6D3B\u52A8\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (role !== "admin" && existing.organizerId !== userId) {
    throw createErrorResponse(403, "\u9700\u8981\u6D3B\u52A8\u7EC4\u7EC7\u8005\u6216\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
  if (existing.status !== "draft") {
    throw createErrorResponse(400, "\u53EA\u6709\u8349\u7A3F\u72B6\u6001\u7684\u6D3B\u52A8\u624D\u80FD\u53D1\u5E03", ResponseCode.BAD_REQUEST);
  }
  const [updated] = await db.update(activities).set({
    status: "published",
    publishedAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(activities.id, activityId)).returning();
  return updated;
}
async function cancelActivity(activityId, userId, role) {
  const [existing] = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);
  if (!existing) {
    throw createErrorResponse(404, "\u6D3B\u52A8\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (role !== "admin" && existing.organizerId !== userId) {
    throw createErrorResponse(403, "\u9700\u8981\u6D3B\u52A8\u7EC4\u7EC7\u8005\u6216\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
  if (existing.status === "cancelled") {
    throw createErrorResponse(400, "\u6D3B\u52A8\u5DF2\u53D6\u6D88", ResponseCode.BAD_REQUEST);
  }
  if (existing.status === "completed") {
    throw createErrorResponse(400, "\u5DF2\u5B8C\u6210\u7684\u6D3B\u52A8\u4E0D\u80FD\u53D6\u6D88", ResponseCode.BAD_REQUEST);
  }
  const [updated] = await db.update(activities).set({
    status: "cancelled",
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(activities.id, activityId)).returning();
  return updated;
}
async function deleteActivity(activityId, userId, role) {
  const [existing] = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);
  if (!existing) {
    throw createErrorResponse(404, "\u6D3B\u52A8\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (role !== "admin" && existing.organizerId !== userId) {
    throw createErrorResponse(403, "\u9700\u8981\u6D3B\u52A8\u7EC4\u7EC7\u8005\u6216\u7BA1\u7406\u5458\u6743\u9650", ResponseCode.FORBIDDEN);
  }
  if (existing.status !== "draft") {
    throw createErrorResponse(400, "\u53EA\u6709\u8349\u7A3F\u72B6\u6001\u7684\u6D3B\u52A8\u624D\u80FD\u5220\u9664", ResponseCode.BAD_REQUEST);
  }
  await db.delete(activities).where(eq(activities.id, activityId));
}
async function registerActivity(activityId, userId, remark) {
  const [activity] = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);
  if (!activity) {
    throw createErrorResponse(404, "\u6D3B\u52A8\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (activity.status !== "published" && activity.status !== "ongoing") {
    throw createErrorResponse(400, "\u6D3B\u52A8\u672A\u5F00\u653E\u62A5\u540D", ResponseCode.BAD_REQUEST);
  }
  if (activity.maxParticipants !== null && activity.currentParticipants >= activity.maxParticipants) {
    throw createErrorResponse(400, "\u6D3B\u52A8\u4EBA\u6570\u5DF2\u6EE1", ResponseCode.BAD_REQUEST);
  }
  if (activity.organizerId === userId) {
    throw createErrorResponse(400, "\u7EC4\u7EC7\u8005\u4E0D\u80FD\u62A5\u540D\u81EA\u5DF1\u7684\u6D3B\u52A8", ResponseCode.BAD_REQUEST);
  }
  const [existingReg] = await db.select().from(activityRegistrations).where(and(
    eq(activityRegistrations.activityId, activityId),
    eq(activityRegistrations.userId, userId)
  )).limit(1);
  if (existingReg && existingReg.status !== "cancelled") {
    throw createErrorResponse(409, "\u5DF2\u7ECF\u62A5\u540D\u8BE5\u6D3B\u52A8", ResponseCode.CONFLICT);
  }
  let registration;
  await db.transaction(async (tx) => {
    if (existingReg) {
      const [updated] = await tx.update(activityRegistrations).set({ status: "pending", remark: remark != null ? remark : existingReg.remark, updatedAt: /* @__PURE__ */ new Date() }).where(eq(activityRegistrations.id, existingReg.id)).returning();
      registration = updated;
    } else {
      const [inserted] = await tx.insert(activityRegistrations).values({ activityId, userId, remark, status: "pending" }).returning();
      registration = inserted;
    }
    await tx.update(activities).set({ currentParticipants: sql`${activities.currentParticipants} + 1` }).where(eq(activities.id, activityId));
  });
  return registration;
}
async function cancelRegistration(activityId, userId) {
  const [registration] = await db.select().from(activityRegistrations).where(and(
    eq(activityRegistrations.activityId, activityId),
    eq(activityRegistrations.userId, userId)
  )).limit(1);
  if (!registration) {
    throw createErrorResponse(404, "\u62A5\u540D\u8BB0\u5F55\u4E0D\u5B58\u5728", ResponseCode.NOT_FOUND);
  }
  if (registration.status === "cancelled") {
    throw createErrorResponse(400, "\u62A5\u540D\u5DF2\u53D6\u6D88", ResponseCode.BAD_REQUEST);
  }
  await db.transaction(async (tx) => {
    await tx.update(activityRegistrations).set({ status: "cancelled", updatedAt: /* @__PURE__ */ new Date() }).where(eq(activityRegistrations.id, registration.id));
    await tx.update(activities).set({ currentParticipants: sql`GREATEST(${activities.currentParticipants} - 1, 0)` }).where(eq(activities.id, activityId));
  });
}
async function getRegistrations(activityId, query) {
  const { page, pageSize, offset } = parsePaginationQuery(query);
  const [{ value: total }] = await db.select({ value: count() }).from(activityRegistrations).where(eq(activityRegistrations.activityId, activityId));
  const list = await db.select({
    id: activityRegistrations.id,
    activityId: activityRegistrations.activityId,
    userId: activityRegistrations.userId,
    status: activityRegistrations.status,
    remark: activityRegistrations.remark,
    createdAt: activityRegistrations.createdAt,
    updatedAt: activityRegistrations.updatedAt,
    userName: users.nickname,
    userAvatar: users.avatarUrl
  }).from(activityRegistrations).leftJoin(users, eq(activityRegistrations.userId, users.id)).where(eq(activityRegistrations.activityId, activityId)).orderBy(desc(activityRegistrations.createdAt)).limit(pageSize).offset(offset);
  return { list, total, page, pageSize };
}
async function getMyRegistration(activityId, userId) {
  const [registration] = await db.select().from(activityRegistrations).where(and(
    eq(activityRegistrations.activityId, activityId),
    eq(activityRegistrations.userId, userId)
  )).limit(1);
  return registration || null;
}

export { cancelRegistration as a, createActivity as b, cancelActivity as c, deleteActivity as d, getActivityList as e, getMyRegistration as f, getActivityById as g, getRegistrations as h, requireLeaderOrAdmin as i, requireOrganizerOrAdmin as j, publishActivity as p, registerActivity as r, updateActivity as u };
//# sourceMappingURL=activity.service.mjs.map
