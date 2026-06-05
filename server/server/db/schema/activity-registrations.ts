import { pgTable, uuid, varchar, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { activities } from './activities'

export const activityRegistrations = pgTable('activity_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'restrict' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  status: varchar('status', { length: 20 }).default('pending'),
  remark: varchar('remark', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  unique('uq_activity_registrations_activity_user').on(table.activityId, table.userId),
  index('idx_activity_registrations_activity_id').on(table.activityId),
  index('idx_activity_registrations_user_id').on(table.userId),
  index('idx_activity_registrations_status').on(table.status),
])

export const activityRegistrationsRelations = relations(activityRegistrations, ({ one }) => ({
  activity: one(activities, {
    fields: [activityRegistrations.activityId],
    references: [activities.id],
  }),
  user: one(users, {
    fields: [activityRegistrations.userId],
    references: [users.id],
  }),
}))

export type ActivityRegistration = typeof activityRegistrations.$inferSelect
export type NewActivityRegistration = typeof activityRegistrations.$inferInsert
