import { e as db, u as users, d as createErrorResponse, g as pointAccounts } from './response.mjs';
import { and, eq, sql } from 'drizzle-orm';
import { A as useRuntimeConfig, c as createError, x as signAccessToken, y as signRefreshToken, B as verifyToken } from '../nitro/nitro.mjs';
import { a as maskPhone } from './encryption.mjs';
import bcrypt from 'bcryptjs';

async function code2Session(code) {
  const config = useRuntimeConfig();
  const appId = config.wechatAppId;
  const appSecret = config.wechatAppSecret;
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
  const response = await $fetch(url);
  if (response.errcode) {
    throw createError({
      statusCode: 400,
      statusMessage: response.errmsg || "WeChat code2Session failed"
    });
  }
  return {
    openid: response.openid,
    session_key: response.session_key,
    unionid: response.unionid
  };
}
async function getPhoneNumber(phoneCode) {
  const config = useRuntimeConfig();
  const appId = config.wechatAppId;
  const appSecret = config.wechatAppSecret;
  const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const tokenResponse = await $fetch(tokenUrl);
  if (!tokenResponse.access_token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Failed to get WeChat access token"
    });
  }
  const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${tokenResponse.access_token}`;
  const phoneResponse = await $fetch(phoneUrl, {
    method: "POST",
    body: { code: phoneCode }
  });
  if (phoneResponse.errcode !== 0) {
    throw createError({
      statusCode: 400,
      statusMessage: phoneResponse.errmsg || "Failed to get phone number"
    });
  }
  return {
    phoneNumber: phoneResponse.phone_info.phoneNumber
  };
}

function generateMemberNo() {
  const num = Math.floor(1e4 + Math.random() * 9e4);
  return `ZA-${num}`;
}
async function ensureUniqueMemberNo() {
  let memberNo = generateMemberNo();
  let existing = await db.select({ id: users.id }).from(users).where(eq(users.memberNo, memberNo)).limit(1);
  while (existing.length > 0) {
    memberNo = generateMemberNo();
    existing = await db.select({ id: users.id }).from(users).where(eq(users.memberNo, memberNo)).limit(1);
  }
  return memberNo;
}
async function buildUserInfo(user) {
  var _a, _b, _c, _d, _e, _f;
  const account = await db.select().from(pointAccounts).where(eq(pointAccounts.userId, user.id)).limit(1);
  const pa = account[0];
  return {
    id: user.id,
    username: user.username || void 0,
    openid: user.openid || void 0,
    nickname: user.nickname || "",
    avatar: user.avatarUrl || void 0,
    phone: user.phone ? maskPhone(user.phone) : void 0,
    idCardEncrypted: user.idCardNo || void 0,
    role: user.role,
    status: user.status,
    points: ((_a = pa == null ? void 0 : pa.activityPointsBalance) != null ? _a : 0) + ((_b = pa == null ? void 0 : pa.donationPointsBalance) != null ? _b : 0),
    createdAt: (_d = (_c = user.createdAt) == null ? void 0 : _c.toISOString()) != null ? _d : "",
    updatedAt: (_f = (_e = user.updatedAt) == null ? void 0 : _e.toISOString()) != null ? _f : ""
  };
}
async function login(code, phoneCode, nickname, avatarUrl) {
  const session = await code2Session(code);
  const phoneResult = await getPhoneNumber(phoneCode);
  const existing = await db.select().from(users).where(eq(users.openid, session.openid)).limit(1);
  let user;
  if (existing.length > 0) {
    user = existing[0];
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    if (nickname) updateData.nickname = nickname;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (phoneResult.phoneNumber && !user.phone) {
      updateData.phone = phoneResult.phoneNumber;
    }
    if (session.unionid && !user.unionId) {
      updateData.unionId = session.unionid;
    }
    await db.update(users).set(updateData).where(eq(users.id, user.id));
    user = { ...user, ...updateData };
  } else {
    const memberNo = await ensureUniqueMemberNo();
    const [inserted] = await db.insert(users).values({
      openid: session.openid,
      unionId: session.unionid || null,
      phone: phoneResult.phoneNumber || null,
      nickname: nickname || null,
      avatarUrl: avatarUrl || null,
      memberNo,
      role: "volunteer",
      status: "active"
    }).returning();
    user = inserted;
    await db.insert(pointAccounts).values({
      userId: user.id,
      activityPointsBalance: 0,
      activityPointsTotal: 0,
      donationPointsBalance: 0,
      donationPointsTotal: 0
    });
  }
  const accessToken = await signAccessToken(user.id, user.role);
  const refreshToken2 = await signRefreshToken(user.id, user.role);
  const userInfo = await buildUserInfo(user);
  return { accessToken, refreshToken: refreshToken2, userInfo };
}
async function adminLogin(username, password) {
  const result = await db.select().from(users).where(
    and(eq(users.username, username), sql`${users.role} IN ('admin', 'leader')`)
  ).limit(1);
  if (result.length === 0) {
    throw createErrorResponse(401, "Invalid username or password");
  }
  const user = result[0];
  if (!user.passwordHash) {
    throw createErrorResponse(401, "Invalid username or password");
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw createErrorResponse(401, "Invalid username or password");
  }
  const accessToken = await signAccessToken(user.id, user.role);
  const refreshToken2 = await signRefreshToken(user.id, user.role);
  const userInfo = await buildUserInfo(user);
  return { accessToken, refreshToken: refreshToken2, userInfo };
}
async function refreshToken(refreshTokenStr) {
  let payload;
  try {
    payload = await verifyToken(refreshTokenStr);
  } catch {
    throw createErrorResponse(401, "Invalid or expired refresh token");
  }
  if (payload.type !== "refresh") {
    throw createErrorResponse(401, "Invalid token type");
  }
  const user = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  if (user.length === 0) {
    throw createErrorResponse(401, "User not found");
  }
  const accessToken = await signAccessToken(payload.sub, payload.role);
  const newRefreshToken = await signRefreshToken(payload.sub, payload.role);
  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: 7 * 24 * 3600
  };
}
async function bindPhone(userId, phoneCode) {
  const phoneResult = await getPhoneNumber(phoneCode);
  await db.update(users).set({ phone: phoneResult.phoneNumber, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
  return { phone: maskPhone(phoneResult.phoneNumber) };
}
async function getCurrentUser(userId) {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (result.length === 0) {
    throw createErrorResponse(404, "User not found");
  }
  return buildUserInfo(result[0]);
}

export { adminLogin as a, bindPhone as b, getCurrentUser as g, login as l, refreshToken as r };
//# sourceMappingURL=auth.service.mjs.map
