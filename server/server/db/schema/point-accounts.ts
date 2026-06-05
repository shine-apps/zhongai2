import { pgTable, uuid, integer, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const pointAccounts = pgTable('point_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }).unique(),
  activityPointsBalance: integer('activity_points_balance').default(0),
  activityPointsTotal: integer('activity_points_total').default(0),
  donationPointsBalance: integer('donation_points_balance').default(0),
  donationPointsTotal: integer('donation_points_total').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_point_accounts_user_id').on(table.userId),
])

export const pointAccountsRelations = relations(pointAccounts, ({ one }) => ({
  user: one(users, {
    fields: [pointAccounts.userId],
    references: [users.id],
  }),
}))

export type PointAccount = typeof pointAccounts.$inferSelect
export type NewPointAccount = typeof pointAccounts.$inferInsert
