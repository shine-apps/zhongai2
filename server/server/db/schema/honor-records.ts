import { pgTable, uuid, varchar, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { honorItems } from './honor-items'

export const honorRecords = pgTable('honor_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  itemId: uuid('item_id').notNull().references(() => honorItems.id, { onDelete: 'restrict' }),
  itemName: varchar('item_name', { length: 100 }).notNull(),
  itemType: varchar('item_type', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  certificateNo: varchar('certificate_no', { length: 50 }),
  certificateUrl: varchar('certificate_url', { length: 500 }),
  issueTime: timestamp('issue_time', { withTimezone: true }),
  receiveTime: timestamp('receive_time', { withTimezone: true }),
  receiveLocation: varchar('receive_location', { length: 200 }),
  receiveContact: varchar('receive_contact', { length: 100 }),
  issuedBy: uuid('issued_by').references(() => users.id, { onDelete: 'set null' }),
  note: varchar('note', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userItemUnique: unique('uq_honor_records_user_item').on(table.userId, table.itemId),
  userIdIdx: index('idx_honor_records_user_id').on(table.userId),
  itemIdIdx: index('idx_honor_records_item_id').on(table.itemId),
  statusIdx: index('idx_honor_records_status').on(table.status),
}))

export const honorRecordsRelations = relations(honorRecords, ({ one }) => ({
  user: one(users, {
    fields: [honorRecords.userId],
    references: [users.id],
  }),
  item: one(honorItems, {
    fields: [honorRecords.itemId],
    references: [honorItems.id],
  }),
  issuer: one(users, {
    fields: [honorRecords.issuedBy],
    references: [users.id],
    relationName: 'honor_issuer',
  }),
}))

export type HonorRecord = typeof honorRecords.$inferSelect
export type NewHonorRecord = typeof honorRecords.$inferInsert
