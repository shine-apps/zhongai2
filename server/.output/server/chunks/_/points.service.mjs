import { eq, sql, and, desc, count } from 'drizzle-orm';
import { e as db, u as users, d as createErrorResponse, R as ResponseCode, g as pointAccounts, i as pointTransactions, h as pointRules } from './response.mjs';
import { p as parsePaginationQuery } from './pagination.mjs';
import { c as calculateHonorLevel } from './user.service.mjs';

async function getBalance(userId) {
  var _a, _b, _c, _d;
  const [account] = await db.select().from(pointAccounts).where(eq(pointAccounts.userId, userId)).limit(1);
  if (!account) {
    return {
      activityBalance: 0,
      activityTotal: 0,
      donationBalance: 0,
      donationTotal: 0
    };
  }
  return {
    activityBalance: (_a = account.activityPointsBalance) != null ? _a : 0,
    activityTotal: (_b = account.activityPointsTotal) != null ? _b : 0,
    donationBalance: (_c = account.donationPointsBalance) != null ? _c : 0,
    donationTotal: (_d = account.donationPointsTotal) != null ? _d : 0
  };
}
async function getTransactions(userId, query) {
  const { page, pageSize, offset } = parsePaginationQuery(query);
  const conditions = [eq(pointTransactions.userId, userId)];
  if (query.pointType) {
    conditions.push(eq(pointTransactions.pointType, query.pointType));
  }
  if (query.changeType) {
    if (query.changeType === "earn") {
      conditions.push(sql`${pointTransactions.amount} > 0`);
    } else if (query.changeType === "spend") {
      conditions.push(sql`${pointTransactions.amount} < 0`);
    } else if (query.changeType === "revert") {
      conditions.push(eq(pointTransactions.sourceType, "revert"));
    }
  }
  const where = and(...conditions);
  const [{ value: total }] = await db.select({ value: count() }).from(pointTransactions).where(where);
  const list = await db.select().from(pointTransactions).where(where).orderBy(desc(pointTransactions.createdAt)).limit(pageSize).offset(offset);
  return { list, total, page, pageSize };
}
async function getRules(query) {
  const conditions = [];
  if ((query == null ? void 0 : query.isActive) !== void 0) {
    conditions.push(eq(pointRules.isActive, query.isActive));
  }
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const list = await db.select().from(pointRules).where(where).orderBy(desc(pointRules.createdAt));
  return list;
}
async function createRule(data) {
  var _a;
  const [rule] = await db.insert(pointRules).values({
    ruleType: data.ruleType,
    pointType: data.pointType,
    pointsPerUnit: data.pointsPerUnit,
    unitDesc: data.unitDesc,
    minAmount: data.minAmount,
    isActive: (_a = data.isActive) != null ? _a : true
  }).returning();
  return rule;
}
async function updateRule(ruleId, data) {
  const [existing] = await db.select().from(pointRules).where(eq(pointRules.id, ruleId)).limit(1);
  if (!existing) {
    throw createErrorResponse(404, "Rule not found", ResponseCode.NOT_FOUND);
  }
  const updateData = { updatedAt: /* @__PURE__ */ new Date() };
  if (data.pointsPerUnit !== void 0) updateData.pointsPerUnit = data.pointsPerUnit;
  if (data.unitDesc !== void 0) updateData.unitDesc = data.unitDesc;
  if (data.minAmount !== void 0) updateData.minAmount = data.minAmount;
  if (data.isActive !== void 0) updateData.isActive = data.isActive;
  const [updated] = await db.update(pointRules).set(updateData).where(eq(pointRules.id, ruleId)).returning();
  return updated;
}
async function adjustPoints(adminId, data) {
  const [targetUser] = await db.select().from(users).where(eq(users.id, data.userId)).limit(1);
  if (!targetUser) {
    throw createErrorResponse(404, "User not found", ResponseCode.NOT_FOUND);
  }
  let transaction;
  await db.transaction(async (tx) => {
    const [account] = await tx.select().from(pointAccounts).where(eq(pointAccounts.userId, data.userId)).limit(1);
    if (!account) {
      await tx.insert(pointAccounts).values({
        userId: data.userId,
        activityPointsBalance: data.pointType === "activity" ? data.amount : 0,
        activityPointsTotal: data.pointType === "activity" && data.amount > 0 ? data.amount : 0,
        donationPointsBalance: data.pointType === "donation" ? data.amount : 0,
        donationPointsTotal: data.pointType === "donation" && data.amount > 0 ? data.amount : 0
      });
    } else {
      const isActivity = data.pointType === "activity";
      const balanceField = isActivity ? pointAccounts.activityPointsBalance : pointAccounts.donationPointsBalance;
      const totalField = isActivity ? pointAccounts.activityPointsTotal : pointAccounts.donationPointsTotal;
      const updateSet = { updatedAt: /* @__PURE__ */ new Date() };
      updateSet[balanceField.name] = sql`${balanceField} + ${data.amount}`;
      if (data.amount > 0) {
        updateSet[totalField.name] = sql`${totalField} + ${data.amount}`;
      }
      await tx.update(pointAccounts).set(updateSet).where(eq(pointAccounts.userId, data.userId));
    }
    const [inserted] = await tx.insert(pointTransactions).values({
      userId: data.userId,
      pointType: data.pointType,
      amount: data.amount,
      sourceType: "admin_adjust",
      sourceId: adminId,
      description: data.description
    }).returning();
    transaction = inserted;
  });
  await updateHonorLevel(data.userId);
  return transaction;
}
async function updateHonorLevel(userId) {
  var _a, _b;
  const [account] = await db.select().from(pointAccounts).where(eq(pointAccounts.userId, userId)).limit(1);
  if (!account) return;
  const totalPoints = ((_a = account.activityPointsTotal) != null ? _a : 0) + ((_b = account.donationPointsTotal) != null ? _b : 0);
  const newLevel = calculateHonorLevel(totalPoints);
  const [user] = await db.select({ honorLevel: users.honorLevel }).from(users).where(eq(users.id, userId)).limit(1);
  if (user && user.honorLevel !== newLevel) {
    await db.update(users).set({ honorLevel: newLevel, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
  }
}

export { adjustPoints as a, getRules as b, createRule as c, getTransactions as d, getBalance as g, updateRule as u };
//# sourceMappingURL=points.service.mjs.map
