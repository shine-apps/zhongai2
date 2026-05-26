import { pgTable, uuid, boolean, time, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const notificationSettings = pgTable('notification_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
  activityRemind: boolean('activity_remind').default(true),
  activityResult: boolean('activity_result').default(true),
  donationResult: boolean('donation_result').default(true),
  pointsChange: boolean('points_change').default(true),
  orderUpdate: boolean('order_update').default(true),
  marketInteraction: boolean('market_interaction').default(true),
  systemNotice: boolean('system_notice').default(true),
  wechatEnabled: boolean('wechat_enabled').default(true),
  smsEnabled: boolean('sms_enabled').default(false),
  quietHoursStart: time('quiet_hours_start'),
  quietHoursEnd: time('quiet_hours_end'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_notification_settings_user_id').on(table.userId),
}))

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id],
  }),
}))

export type NotificationSetting = typeof notificationSettings.$inferSelect
export type NewNotificationSetting = typeof notificationSettings.$inferInsert
