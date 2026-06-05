import { pgTable, uuid, varchar, numeric, boolean, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { activities } from './activities'

export const activityCheckins = pgTable('activity_checkins', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'restrict' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  checkinType: varchar('checkin_type', { length: 20 }).notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  checkinTime: timestamp('checkin_time', { withTimezone: true }).defaultNow(),
  verified: boolean('verified').default(false),
  verifiedBy: uuid('verified_by').references(() => users.id, { onDelete: 'set null' }),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  pointsGranted: boolean('points_granted').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  unique('uq_activity_checkins_activity_user').on(table.activityId, table.userId),
  index('idx_activity_checkins_activity_id').on(table.activityId),
  index('idx_activity_checkins_user_id').on(table.userId),
  index('idx_activity_checkins_checkin_time').on(table.checkinTime),
])

export const activityCheckinsRelations = relations(activityCheckins, ({ one }) => ({
  activity: one(activities, {
    fields: [activityCheckins.activityId],
    references: [activities.id],
  }),
  user: one(users, {
    fields: [activityCheckins.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [activityCheckins.verifiedBy],
    references: [users.id],
    relationName: 'verifier',
  }),
}))

export type ActivityCheckin = typeof activityCheckins.$inferSelect
export type NewActivityCheckin = typeof activityCheckins.$inferInsert
