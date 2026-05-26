import { pgTable, uuid, varchar, text, integer, numeric, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { activityRegistrations } from './activity-registrations'
import { activityCheckins } from './activity-checkins'
import { activityGalleries } from './activity-galleries'

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 100 }).notNull(),
  category: varchar('category', { length: 30 }).notNull(),
  description: text('description'),
  coverImage: varchar('cover_image', { length: 500 }),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  location: varchar('location', { length: 200 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  checkinRadius: integer('checkin_radius').default(200),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),
  rewardPoints: integer('reward_points').notNull(),
  status: varchar('status', { length: 20 }).default('draft'),
  organizerId: uuid('organizer_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  organizerIdIdx: index('idx_activities_organizer_id').on(table.organizerId),
  statusIdx: index('idx_activities_status').on(table.status),
  categoryIdx: index('idx_activities_category').on(table.category),
  startTimeIdx: index('idx_activities_start_time').on(table.startTime),
  createdAtIdx: index('idx_activities_created_at').on(table.createdAt),
}))

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  organizer: one(users, {
    fields: [activities.organizerId],
    references: [users.id],
    relationName: 'organizer',
  }),
  registrations: many(activityRegistrations),
  checkins: many(activityCheckins),
  galleries: many(activityGalleries),
}))

export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert
