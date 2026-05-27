import { pgTable, uuid, varchar, text, integer, decimal, timestamp, index, jsonb, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const marketPosts = pgTable('market_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postType: varchar('post_type', { length: 20 }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull(),
  images: jsonb('images').default([]),
  contactInfo: varchar('contact_info', { length: 200 }),
  location: varchar('location', { length: 100 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 20 }).default('pending'),
  viewCount: integer('view_count').default(0),
  favoriteCount: integer('favorite_count').default(0),
  reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
  reviewNote: varchar('review_note', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  postTypeIdx: index('idx_market_posts_post_type').on(table.postType),
  statusIdx: index('idx_market_posts_status').on(table.status),
  userIdIdx: index('idx_market_posts_user_id').on(table.userId),
  createdAtIdx: index('idx_market_posts_created_at').on(table.createdAt),
}))

export const marketFavorites = pgTable('market_favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => marketPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  postUserUnique: unique('idx_market_favorites_post_user').on(table.postId, table.userId),
  userIdIdx: index('idx_market_favorites_user_id').on(table.userId),
}))

export const marketPostsRelations = relations(marketPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [marketPosts.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [marketPosts.reviewerId],
    references: [users.id],
    relationName: 'market_post_reviewer',
  }),
  favorites: many(marketFavorites),
}))

export const marketFavoritesRelations = relations(marketFavorites, ({ one }) => ({
  post: one(marketPosts, {
    fields: [marketFavorites.postId],
    references: [marketPosts.id],
  }),
  user: one(users, {
    fields: [marketFavorites.userId],
    references: [users.id],
  }),
}))

export type MarketPost = typeof marketPosts.$inferSelect
export type NewMarketPost = typeof marketPosts.$inferInsert
export type MarketFavorite = typeof marketFavorites.$inferSelect
export type NewMarketFavorite = typeof marketFavorites.$inferInsert
