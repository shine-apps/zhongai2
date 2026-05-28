import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { pgTable, timestamp, integer, uuid, index, varchar, unique, boolean, numeric, bigint, text, jsonb, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { c as createError } from '../nitro/nitro.mjs';

const pointAccounts = pgTable("point_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }).unique(),
  activityPointsBalance: integer("activity_points_balance").default(0),
  activityPointsTotal: integer("activity_points_total").default(0),
  donationPointsBalance: integer("donation_points_balance").default(0),
  donationPointsTotal: integer("donation_points_total").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  userIdIdx: index("idx_point_accounts_user_id").on(table.userId)
}));
const pointAccountsRelations = relations(pointAccounts, ({ one }) => ({
  user: one(users, {
    fields: [pointAccounts.userId],
    references: [users.id]
  })
}));

const pointTransactions = pgTable("point_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  pointType: varchar("point_type", { length: 20 }).notNull(),
  amount: integer("amount").notNull(),
  sourceType: varchar("source_type", { length: 30 }).notNull(),
  sourceId: uuid("source_id"),
  description: varchar("description", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  userIdIdx: index("idx_point_transactions_user_id").on(table.userId),
  pointTypeIdx: index("idx_point_transactions_point_type").on(table.pointType),
  sourceTypeIdx: index("idx_point_transactions_source_type").on(table.sourceType),
  createdAtIdx: index("idx_point_transactions_created_at").on(table.createdAt)
}));
const pointTransactionsRelations = relations(pointTransactions, ({ one }) => ({
  user: one(users, {
    fields: [pointTransactions.userId],
    references: [users.id]
  })
}));

const activityRegistrations = pgTable("activity_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id").notNull().references(() => activities.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  status: varchar("status", { length: 20 }).default("pending"),
  remark: varchar("remark", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  activityUserUnique: unique("uq_activity_registrations_activity_user").on(table.activityId, table.userId),
  activityIdIdx: index("idx_activity_registrations_activity_id").on(table.activityId),
  userIdIdx: index("idx_activity_registrations_user_id").on(table.userId),
  statusIdx: index("idx_activity_registrations_status").on(table.status)
}));
const activityRegistrationsRelations = relations(activityRegistrations, ({ one }) => ({
  activity: one(activities, {
    fields: [activityRegistrations.activityId],
    references: [activities.id]
  }),
  user: one(users, {
    fields: [activityRegistrations.userId],
    references: [users.id]
  })
}));

const activityCheckins = pgTable("activity_checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id").notNull().references(() => activities.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  checkinType: varchar("checkin_type", { length: 20 }).notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  checkinTime: timestamp("checkin_time", { withTimezone: true }).defaultNow(),
  verified: boolean("verified").default(false),
  verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  pointsGranted: boolean("points_granted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  activityUserUnique: unique("uq_activity_checkins_activity_user").on(table.activityId, table.userId),
  activityIdIdx: index("idx_activity_checkins_activity_id").on(table.activityId),
  userIdIdx: index("idx_activity_checkins_user_id").on(table.userId),
  checkinTimeIdx: index("idx_activity_checkins_checkin_time").on(table.checkinTime)
}));
const activityCheckinsRelations = relations(activityCheckins, ({ one }) => ({
  activity: one(activities, {
    fields: [activityCheckins.activityId],
    references: [activities.id]
  }),
  user: one(users, {
    fields: [activityCheckins.userId],
    references: [users.id]
  }),
  verifier: one(users, {
    fields: [activityCheckins.verifiedBy],
    references: [users.id],
    relationName: "verifier"
  })
}));

const activityGalleries = pgTable("activity_galleries", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  mediaType: varchar("media_type", { length: 10 }).notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  fileSize: bigint("file_size", { mode: "number" }),
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  activityIdIdx: index("idx_activity_galleries_activity_id").on(table.activityId)
}));
const activityGalleriesRelations = relations(activityGalleries, ({ one }) => ({
  activity: one(activities, {
    fields: [activityGalleries.activityId],
    references: [activities.id]
  })
}));

const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 100 }).notNull(),
  category: varchar("category", { length: 30 }).notNull(),
  description: text("description"),
  coverImage: varchar("cover_image", { length: 500 }),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  location: varchar("location", { length: 200 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  checkinRadius: integer("checkin_radius").default(200),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  rewardPoints: integer("reward_points").notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  organizerId: uuid("organizer_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  organizerIdIdx: index("idx_activities_organizer_id").on(table.organizerId),
  statusIdx: index("idx_activities_status").on(table.status),
  categoryIdx: index("idx_activities_category").on(table.category),
  startTimeIdx: index("idx_activities_start_time").on(table.startTime),
  createdAtIdx: index("idx_activities_created_at").on(table.createdAt)
}));
const activitiesRelations = relations(activities, ({ one, many }) => ({
  organizer: one(users, {
    fields: [activities.organizerId],
    references: [users.id],
    relationName: "organizer"
  }),
  registrations: many(activityRegistrations),
  checkins: many(activityCheckins),
  galleries: many(activityGalleries)
}));

const donations = pgTable("donations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  donationType: varchar("donation_type", { length: 20 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  materialDesc: text("material_desc"),
  materialValue: numeric("material_value", { precision: 12, scale: 2 }),
  evidenceImages: jsonb("evidence_images").default([]),
  evidenceDesc: text("evidence_desc"),
  status: varchar("status", { length: 20 }).default("pending"),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewRemark: varchar("review_remark", { length: 200 }),
  pointsGranted: boolean("points_granted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  userIdIdx: index("idx_donations_user_id").on(table.userId),
  statusIdx: index("idx_donations_status").on(table.status),
  donationTypeIdx: index("idx_donations_donation_type").on(table.donationType),
  createdAtIdx: index("idx_donations_created_at").on(table.createdAt)
}));
const donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id]
  }),
  reviewer: one(users, {
    fields: [donations.reviewerId],
    references: [users.id],
    relationName: "donation_reviewer"
  })
}));

const marketPosts = pgTable("market_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  postType: varchar("post_type", { length: 20 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  images: jsonb("images").default([]),
  contactInfo: varchar("contact_info", { length: 200 }),
  pointsCost: integer("points_cost").notNull(),
  pointTypeUsed: varchar("point_type_used", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  userIdIdx: index("idx_market_posts_user_id").on(table.userId),
  statusIdx: index("idx_market_posts_status").on(table.status),
  postTypeIdx: index("idx_market_posts_post_type").on(table.postType),
  createdAtIdx: index("idx_market_posts_created_at").on(table.createdAt)
}));
const marketPostsRelations = relations(marketPosts, ({ one }) => ({
  user: one(users, {
    fields: [marketPosts.userId],
    references: [users.id]
  }),
  reviewer: one(users, {
    fields: [marketPosts.reviewerId],
    references: [users.id],
    relationName: "market_post_reviewer"
  })
}));

const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  openid: varchar("openid", { length: 64 }).unique().notNull(),
  unionId: varchar("union_id", { length: 64 }).unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  nickname: varchar("nickname", { length: 50 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  username: varchar("username", { length: 50 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  realName: varchar("real_name", { length: 50 }),
  idCardNo: varchar("id_card_no", { length: 18 }),
  realNameVerified: boolean("real_name_verified").default(false),
  memberNo: varchar("member_no", { length: 20 }).unique(),
  role: varchar("role", { length: 20 }).default("volunteer"),
  status: varchar("status", { length: 20 }).default("active"),
  honorLevel: integer("honor_level").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  openidIdx: index("idx_users_openid").on(table.openid),
  phoneIdx: index("idx_users_phone").on(table.phone),
  roleIdx: index("idx_users_role").on(table.role),
  statusIdx: index("idx_users_status").on(table.status),
  memberNoIdx: index("idx_users_member_no").on(table.memberNo)
}));
const usersRelations = relations(users, ({ many, one }) => ({
  pointAccount: one(pointAccounts, {
    fields: [users.id],
    references: [pointAccounts.userId]
  }),
  pointTransactions: many(pointTransactions),
  organizedActivities: many(activities, {
    relationName: "organizer"
  }),
  activityRegistrations: many(activityRegistrations),
  activityCheckins: many(activityCheckins),
  donations: many(donations),
  marketPosts: many(marketPosts)
}));

const pointRules = pgTable("point_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  ruleType: varchar("rule_type", { length: 30 }).notNull(),
  pointType: varchar("point_type", { length: 20 }).notNull(),
  pointsPerUnit: integer("points_per_unit").notNull(),
  unitDesc: varchar("unit_desc", { length: 50 }),
  minAmount: numeric("min_amount", { precision: 12, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  ruleTypeIdx: index("idx_point_rules_rule_type").on(table.ruleType),
  isActiveIdx: index("idx_point_rules_is_active").on(table.isActive)
}));

const banners = pgTable("banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 100 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  linkType: varchar("link_type", { length: 20 }),
  linkValue: varchar("link_value", { length: 500 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  startAt: timestamp("start_at", { withTimezone: true }),
  endAt: timestamp("end_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  isActiveIdx: index("idx_banners_is_active").on(table.isActive),
  sortOrderIdx: index("idx_banners_sort_order").on(table.sortOrder)
}));

const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 30 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  data: jsonb("data").default({}),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true })
}, (table) => ({
  userIdIdx: index("idx_notifications_user_id").on(table.userId),
  typeIdx: index("idx_notifications_type").on(table.type),
  isReadIdx: index("idx_notifications_is_read").on(table.isRead),
  createdAtIdx: index("idx_notifications_created_at").on(table.createdAt)
}));
const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateCode: varchar("template_code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  titleTemplate: varchar("title_template", { length: 200 }).notNull(),
  contentTemplate: text("content_template").notNull(),
  wechatTemplateId: varchar("wechat_template_id", { length: 100 }),
  smsTemplateCode: varchar("sms_template_code", { length: 100 }),
  variables: jsonb("variables").default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  typeIdx: index("idx_notification_templates_type").on(table.type),
  isActiveIdx: index("idx_notification_templates_is_active").on(table.isActive)
}));

const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  activityRemind: boolean("activity_remind").default(true),
  activityResult: boolean("activity_result").default(true),
  donationResult: boolean("donation_result").default(true),
  pointsChange: boolean("points_change").default(true),
  orderUpdate: boolean("order_update").default(true),
  marketInteraction: boolean("market_interaction").default(true),
  systemNotice: boolean("system_notice").default(true),
  wechatEnabled: boolean("wechat_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  quietHoursStart: time("quiet_hours_start"),
  quietHoursEnd: time("quiet_hours_end"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  userIdIdx: index("idx_notification_settings_user_id").on(table.userId)
}));
const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id]
  })
}));

const honorItems = pgTable("honor_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  description: varchar("description", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  unlockType: varchar("unlock_type", { length: 20 }).notNull(),
  unlockValue: integer("unlock_value").notNull(),
  unlockLevel: integer("unlock_level").default(0),
  unlockActivityCount: integer("unlock_activity_count").default(0),
  unlockDonationAmount: numeric("unlock_donation_amount", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  stock: integer("stock").default(-1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  typeIdx: index("idx_honor_items_type").on(table.type),
  isActiveIdx: index("idx_honor_items_is_active").on(table.isActive)
}));

const honorRecords = pgTable("honor_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  itemId: uuid("item_id").notNull().references(() => honorItems.id, { onDelete: "restrict" }),
  itemName: varchar("item_name", { length: 100 }).notNull(),
  itemType: varchar("item_type", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  certificateNo: varchar("certificate_no", { length: 50 }),
  certificateUrl: varchar("certificate_url", { length: 500 }),
  issueTime: timestamp("issue_time", { withTimezone: true }),
  receiveTime: timestamp("receive_time", { withTimezone: true }),
  receiveLocation: varchar("receive_location", { length: 200 }),
  receiveContact: varchar("receive_contact", { length: 100 }),
  issuedBy: uuid("issued_by").references(() => users.id, { onDelete: "set null" }),
  note: varchar("note", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  userItemUnique: unique("uq_honor_records_user_item").on(table.userId, table.itemId),
  userIdIdx: index("idx_honor_records_user_id").on(table.userId),
  itemIdIdx: index("idx_honor_records_item_id").on(table.itemId),
  statusIdx: index("idx_honor_records_status").on(table.status)
}));
const honorRecordsRelations = relations(honorRecords, ({ one }) => ({
  user: one(users, {
    fields: [honorRecords.userId],
    references: [users.id]
  }),
  item: one(honorItems, {
    fields: [honorRecords.itemId],
    references: [honorItems.id]
  }),
  issuer: one(users, {
    fields: [honorRecords.issuedBy],
    references: [users.id],
    relationName: "honor_issuer"
  })
}));

const feedbacks = pgTable("feedbacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  type: varchar("type", { length: 20 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  images: varchar("images", { length: 500 }).array(),
  contactInfo: varchar("contact_info", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"),
  priority: varchar("priority", { length: 10 }).default("normal"),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  response: text("response"),
  responseTime: timestamp("response_time", { withTimezone: true }),
  resolvedTime: timestamp("resolved_time", { withTimezone: true }),
  userRating: integer("user_rating"),
  userRatingNote: varchar("user_rating_note", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  userIdIdx: index("idx_feedbacks_user_id").on(table.userId),
  statusIdx: index("idx_feedbacks_status").on(table.status),
  typeIdx: index("idx_feedbacks_type").on(table.type),
  assignedToIdx: index("idx_feedbacks_assigned_to").on(table.assignedTo)
}));
const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id]
  }),
  assignee: one(users, {
    fields: [feedbacks.assignedTo],
    references: [users.id],
    relationName: "feedback_assignee"
  })
}));

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  activities: activities,
  activitiesRelations: activitiesRelations,
  activityCheckins: activityCheckins,
  activityCheckinsRelations: activityCheckinsRelations,
  activityGalleries: activityGalleries,
  activityGalleriesRelations: activityGalleriesRelations,
  activityRegistrations: activityRegistrations,
  activityRegistrationsRelations: activityRegistrationsRelations,
  banners: banners,
  donations: donations,
  donationsRelations: donationsRelations,
  feedbacks: feedbacks,
  feedbacksRelations: feedbacksRelations,
  honorItems: honorItems,
  honorRecords: honorRecords,
  honorRecordsRelations: honorRecordsRelations,
  marketPosts: marketPosts,
  marketPostsRelations: marketPostsRelations,
  notificationSettings: notificationSettings,
  notificationSettingsRelations: notificationSettingsRelations,
  notificationTemplates: notificationTemplates,
  notifications: notifications,
  notificationsRelations: notificationsRelations,
  pointAccounts: pointAccounts,
  pointAccountsRelations: pointAccountsRelations,
  pointRules: pointRules,
  pointTransactions: pointTransactions,
  pointTransactionsRelations: pointTransactionsRelations,
  users: users,
  usersRelations: usersRelations
}, Symbol.toStringTag, { value: 'Module' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/zhongai_alliance"
});
const db = drizzle(pool, { schema });

const ResponseCode = {
  SUCCESS: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422};
function success(data, message = "success") {
  return { code: ResponseCode.SUCCESS, message, data };
}
function paginated(list, total, page, pageSize, message = "success") {
  return {
    code: ResponseCode.SUCCESS,
    message,
    data: {
      list,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  };
}
function createErrorResponse(statusCode, message, code) {
  throw createError({
    statusCode,
    statusMessage: message,
    data: { code: code || statusCode, message }
  });
}

export { ResponseCode as R, activities as a, activityCheckins as b, activityRegistrations as c, createErrorResponse as d, db as e, donations as f, pointAccounts as g, pointRules as h, pointTransactions as i, paginated as p, success as s, users as u };
//# sourceMappingURL=response.mjs.map
