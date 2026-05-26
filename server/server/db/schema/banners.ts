import { pgTable, uuid, varchar, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core'

export const banners = pgTable('banners', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 100 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  linkType: varchar('link_type', { length: 20 }),
  linkValue: varchar('link_value', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  startAt: timestamp('start_at', { withTimezone: true }),
  endAt: timestamp('end_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  isActiveIdx: index('idx_banners_is_active').on(table.isActive),
  sortOrderIdx: index('idx_banners_sort_order').on(table.sortOrder),
}))

export type Banner = typeof banners.$inferSelect
export type NewBanner = typeof banners.$inferInsert
