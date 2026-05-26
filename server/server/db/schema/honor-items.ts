import { pgTable, uuid, varchar, integer, numeric, boolean, timestamp, index } from 'drizzle-orm/pg-core'

export const honorItems = pgTable('honor_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  description: varchar('description', { length: 500 }),
  imageUrl: varchar('image_url', { length: 500 }),
  unlockType: varchar('unlock_type', { length: 20 }).notNull(),
  unlockValue: integer('unlock_value').notNull(),
  unlockLevel: integer('unlock_level').default(0),
  unlockActivityCount: integer('unlock_activity_count').default(0),
  unlockDonationAmount: numeric('unlock_donation_amount', { precision: 10, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true),
  stock: integer('stock').default(-1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  typeIdx: index('idx_honor_items_type').on(table.type),
  isActiveIdx: index('idx_honor_items_is_active').on(table.isActive),
}))

export type HonorItem = typeof honorItems.$inferSelect
export type NewHonorItem = typeof honorItems.$inferInsert
