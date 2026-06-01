import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const pointTransactions = pgTable('point_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  pointType: varchar('point_type', { length: 20 }).notNull(),
  changeType: varchar('change_type', { length: 10 }).default('earn'),
  amount: integer('amount').notNull(),
  balanceAfter: integer('balance_after'),
  sourceType: varchar('source_type', { length: 30 }).notNull(),
  sourceId: uuid('source_id'),
  description: varchar('description', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_point_transactions_user_id').on(table.userId),
  pointTypeIdx: index('idx_point_transactions_point_type').on(table.pointType),
  sourceTypeIdx: index('idx_point_transactions_source_type').on(table.sourceType),
  createdAtIdx: index('idx_point_transactions_created_at').on(table.createdAt),
}))

export const pointTransactionsRelations = relations(pointTransactions, ({ one }) => ({
  user: one(users, {
    fields: [pointTransactions.userId],
    references: [users.id],
  }),
}))

export type PointTransaction = typeof pointTransactions.$inferSelect
export type NewPointTransaction = typeof pointTransactions.$inferInsert
