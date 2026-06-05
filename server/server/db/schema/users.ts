import { pgTable, uuid, varchar, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { pointAccounts } from './point-accounts'
import { pointTransactions } from './point-transactions'
import { activities } from './activities'
import { activityRegistrations } from './activity-registrations'
import { activityCheckins } from './activity-checkins'
import { donations } from './donations'
import { marketPosts } from './market-posts'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  openid: varchar('openid', { length: 64 }).unique().notNull(),
  unionId: varchar('union_id', { length: 64 }).unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  nickname: varchar('nickname', { length: 50 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  username: varchar('username', { length: 50 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  realName: varchar('real_name', { length: 50 }),
  idCardNo: varchar('id_card_no', { length: 18 }),
  realNameVerified: boolean('real_name_verified').default(false),
  memberNo: varchar('member_no', { length: 20 }).unique(),
  role: varchar('role', { length: 20 }).default('volunteer'),
  status: varchar('status', { length: 20 }).default('active'),
  honorLevel: integer('honor_level').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_users_openid').on(table.openid),
  index('idx_users_phone').on(table.phone),
  index('idx_users_role').on(table.role),
  index('idx_users_status').on(table.status),
  index('idx_users_member_no').on(table.memberNo),
])

export const usersRelations = relations(users, ({ many, one }) => ({
  pointAccount: one(pointAccounts, {
    fields: [users.id],
    references: [pointAccounts.userId],
  }),
  pointTransactions: many(pointTransactions),
  organizedActivities: many(activities, {
    relationName: 'organizer',
  }),
  activityRegistrations: many(activityRegistrations),
  activityCheckins: many(activityCheckins),
  donations: many(donations),
  marketPosts: many(marketPosts),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
