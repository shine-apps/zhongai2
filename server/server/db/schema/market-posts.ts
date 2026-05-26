import { pgTable, uuid, varchar, text, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const marketPosts = pgTable('market_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  postType: varchar('post_type', { length: 20 }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull(),
  images: jsonb('images').default([]),
  contactInfo: varchar('contact_info', { length: 200 }),
  pointsCost: integer('points_cost').notNull(),
  pointTypeUsed: varchar('point_type_used', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_market_posts_user_id').on(table.userId),
  statusIdx: index('idx_market_posts_status').on(table.status),
  postTypeIdx: index('idx_market_posts_post_type').on(table.postType),
  createdAtIdx: index('idx_market_posts_created_at').on(table.createdAt),
}))

export const marketPostsRelations = relations(marketPosts, ({ one }) => ({
  user: one(users, {
    fields: [marketPosts.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [marketPosts.reviewerId],
    references: [users.id],
    relationName: 'market_post_reviewer',
  }),
}))

export type MarketPost = typeof marketPosts.$inferSelect
export type NewMarketPost = typeof marketPosts.$inferInsert
