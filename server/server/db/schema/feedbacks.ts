import { pgTable, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const feedbacks = pgTable('feedbacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  type: varchar('type', { length: 20 }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull(),
  images: varchar('images', { length: 500 }).array(),
  contactInfo: varchar('contact_info', { length: 100 }),
  status: varchar('status', { length: 20 }).default('pending'),
  priority: varchar('priority', { length: 10 }).default('normal'),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  response: text('response'),
  responseTime: timestamp('response_time', { withTimezone: true }),
  resolvedTime: timestamp('resolved_time', { withTimezone: true }),
  userRating: integer('user_rating'),
  userRatingNote: varchar('user_rating_note', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_feedbacks_user_id').on(table.userId),
  index('idx_feedbacks_status').on(table.status),
  index('idx_feedbacks_type').on(table.type),
  index('idx_feedbacks_assigned_to').on(table.assignedTo),
])

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [feedbacks.assignedTo],
    references: [users.id],
    relationName: 'feedback_assignee',
  }),
}))

export type Feedback = typeof feedbacks.$inferSelect
export type NewFeedback = typeof feedbacks.$inferInsert
