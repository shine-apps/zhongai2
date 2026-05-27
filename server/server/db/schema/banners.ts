import { pgTable, uuid, varchar, integer, text, timestamp, index } from 'drizzle-orm/pg-core'

export const banners = pgTable('banners', {
  id: uuid('id').primaryKey().defaultRandom(),
  position: varchar('position', { length: 30 }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  linkType: varchar('link_type', { length: 20 }).default('none'),
  linkValue: varchar('link_value', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
  status: varchar('status', { length: 20 }).default('draft'),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  viewCount: integer('view_count').default(0),
  clickCount: integer('click_count').default(0),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  positionIdx: index('idx_banners_position').on(table.position),
  statusIdx: index('idx_banners_status').on(table.status),
  sortOrderIdx: index('idx_banners_sort_order').on(table.position, table.sortOrder),
  timeRangeIdx: index('idx_banners_time_range').on(table.startTime, table.endTime),
}))

export type Banner = typeof banners.$inferSelect
export type NewBanner = typeof banners.$inferInsert
