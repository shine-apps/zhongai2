import { pgTable, uuid, varchar, text, numeric, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const donations = pgTable('donations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  donationType: varchar('donation_type', { length: 20 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }),
  materialDesc: text('material_desc'),
  materialValue: numeric('material_value', { precision: 12, scale: 2 }),
  evidenceImages: jsonb('evidence_images').default([]),
  evidenceDesc: text('evidence_desc'),
  status: varchar('status', { length: 20 }).default('pending'),
  reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewRemark: varchar('review_remark', { length: 200 }),
  pointsGranted: boolean('points_granted').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_donations_user_id').on(table.userId),
  statusIdx: index('idx_donations_status').on(table.status),
  donationTypeIdx: index('idx_donations_donation_type').on(table.donationType),
  createdAtIdx: index('idx_donations_created_at').on(table.createdAt),
}))

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [donations.reviewerId],
    references: [users.id],
    relationName: 'donation_reviewer',
  }),
}))

export type Donation = typeof donations.$inferSelect
export type NewDonation = typeof donations.$inferInsert
