import { pgTable, uuid, varchar, text, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core'

export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateCode: varchar('template_code', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 30 }).notNull(),
  titleTemplate: varchar('title_template', { length: 200 }).notNull(),
  contentTemplate: text('content_template').notNull(),
  wechatTemplateId: varchar('wechat_template_id', { length: 100 }),
  smsTemplateCode: varchar('sms_template_code', { length: 100 }),
  variables: jsonb('variables').default([]),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_notification_templates_type').on(table.type),
  index('idx_notification_templates_is_active').on(table.isActive),
])

export type NotificationTemplate = typeof notificationTemplates.$inferSelect
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert
