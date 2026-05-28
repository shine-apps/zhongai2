import { eq, or, like, and, count, desc, sql } from 'drizzle-orm';
import { e as db, g as pointAccounts, u as users, d as createErrorResponse } from './response.mjs';
import { m as maskIdCard, d as decryptIdCard, e as encryptIdCard, a as maskPhone } from './encryption.mjs';

const HONOR_LEVELS = [
  { level: 0, name: "\u666E\u901A\u5FD7\u613F\u8005", minPoints: 0, icon: "" },
  { level: 1, name: "\u94DC\u724C\u5FD7\u613F\u8005", minPoints: 100, icon: "\u{1F949}" },
  { level: 2, name: "\u94F6\u724C\u5FD7\u613F\u8005", minPoints: 500, icon: "\u{1F948}" },
  { level: 3, name: "\u91D1\u724C\u5FD7\u613F\u8005", minPoints: 2e3, icon: "\u{1F947}" },
  { level: 4, name: "\u94BB\u77F3\u5FD7\u613F\u8005", minPoints: 5e3, icon: "\u{1F48E}" }
];
function maskUser(user) {
  return {
    ...user,
    phone: user.phone ? maskPhone(user.phone) : user.phone,
    idCardNo: user.idCardNo ? maskIdCard(decryptIdCard(user.idCardNo)) : user.idCardNo
  };
}
async function getCurrentUser(userId) {
  const result = await db.select({
    user: users,
    pointAccount: pointAccounts
  }).from(users).leftJoin(pointAccounts, eq(users.id, pointAccounts.userId)).where(eq(users.id, userId)).limit(1);
  if (!result.length) {
    throw createErrorResponse(404, "User not found");
  }
  const { user, pointAccount } = result[0];
  const maskedUser = maskUser(user);
  return {
    ...maskedUser,
    points: pointAccount ? {
      activityPointsBalance: pointAccount.activityPointsBalance,
      activityPointsTotal: pointAccount.activityPointsTotal,
      donationPointsBalance: pointAccount.donationPointsBalance,
      donationPointsTotal: pointAccount.donationPointsTotal
    } : null
  };
}
async function updateUser(userId, data) {
  const updateData = { updatedAt: /* @__PURE__ */ new Date() };
  if (data.nickname !== void 0) updateData.nickname = data.nickname;
  if (data.avatarUrl !== void 0) updateData.avatarUrl = data.avatarUrl;
  const result = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
  if (!result.length) {
    throw createErrorResponse(404, "User not found");
  }
  return maskUser(result[0]);
}
function validateIdCard(idCard) {
  if (idCard.length !== 18) return false;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkChars = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const charCode = idCard.charCodeAt(i);
    if (charCode < 48 || charCode > 57) return false;
    sum += (charCode - 48) * weights[i];
  }
  const checkDigit = checkChars[sum % 11];
  return idCard[17].toUpperCase() === checkDigit;
}
async function verifyRealName(userId, data) {
  if (!validateIdCard(data.idCardNo)) {
    throw createErrorResponse(422, "Invalid ID card number format");
  }
  const encryptedIdCard = encryptIdCard(data.idCardNo);
  const existing = await db.select({ id: users.id }).from(users).where(and(eq(users.idCardNo, encryptedIdCard), sql`${users.id} != ${userId}`)).limit(1);
  if (existing.length) {
    throw createErrorResponse(409, "ID card number already registered by another user");
  }
  const result = await db.update(users).set({
    realName: data.realName,
    idCardNo: encryptedIdCard,
    realNameVerified: true,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(users.id, userId)).returning();
  if (!result.length) {
    throw createErrorResponse(404, "User not found");
  }
  return maskUser(result[0]);
}
async function getUserList(query) {
  const conditions = [];
  if (query.role) {
    conditions.push(eq(users.role, query.role));
  }
  if (query.status) {
    conditions.push(eq(users.status, query.status));
  }
  if (query.keyword) {
    conditions.push(
      or(
        like(users.nickname, `%${query.keyword}%`),
        like(users.username, `%${query.keyword}%`),
        like(users.phone, `%${query.keyword}%`),
        like(users.memberNo, `%${query.keyword}%`)
      )
    );
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  const totalResult = await db.select({ count: count() }).from(users).where(whereClause);
  const total = totalResult[0].count;
  const offset = (query.page - 1) * query.pageSize;
  const list = await db.select().from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(query.pageSize).offset(offset);
  return {
    list: list.map(maskUser),
    total,
    page: query.page,
    pageSize: query.pageSize
  };
}
async function adminGetUserById(userId) {
  const result = await db.select({
    user: users,
    pointAccount: pointAccounts
  }).from(users).leftJoin(pointAccounts, eq(users.id, pointAccounts.userId)).where(eq(users.id, userId)).limit(1);
  if (!result.length) {
    throw createErrorResponse(404, "User not found");
  }
  const { user, pointAccount } = result[0];
  return {
    ...user,
    idCardNo: user.idCardNo ? maskIdCard(decryptIdCard(user.idCardNo)) : user.idCardNo,
    points: pointAccount ? {
      activityPointsBalance: pointAccount.activityPointsBalance,
      activityPointsTotal: pointAccount.activityPointsTotal,
      donationPointsBalance: pointAccount.donationPointsBalance,
      donationPointsTotal: pointAccount.donationPointsTotal
    } : null
  };
}
async function adminUpdateUser(userId, data) {
  const updateData = { updatedAt: /* @__PURE__ */ new Date() };
  if (data.role !== void 0) updateData.role = data.role;
  if (data.status !== void 0) updateData.status = data.status;
  if (data.honorLevel !== void 0) updateData.honorLevel = data.honorLevel;
  const result = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
  if (!result.length) {
    throw createErrorResponse(404, "User not found");
  }
  return result[0];
}
async function freezeUser(userId) {
  const result = await db.update(users).set({ status: "frozen", updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
  if (!result.length) {
    throw createErrorResponse(404, "User not found");
  }
  return result[0];
}
async function unfreezeUser(userId) {
  const result = await db.update(users).set({ status: "active", updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
  if (!result.length) {
    throw createErrorResponse(404, "User not found");
  }
  return result[0];
}
function getHonorLevels() {
  return HONOR_LEVELS;
}
function calculateHonorLevel(totalPoints) {
  if (totalPoints >= 5e3) return 4;
  if (totalPoints >= 2e3) return 3;
  if (totalPoints >= 500) return 2;
  if (totalPoints >= 100) return 1;
  return 0;
}

export { adminGetUserById as a, adminUpdateUser as b, calculateHonorLevel as c, getHonorLevels as d, getUserList as e, freezeUser as f, getCurrentUser as g, updateUser as h, unfreezeUser as u, verifyRealName as v };
//# sourceMappingURL=user.service.mjs.map
