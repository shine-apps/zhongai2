import { pgTable, uuid, varchar, date, jsonb, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'

export const statsSnapshots = pgTable('stats_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  snapshotType: varchar('snapshot_type', { length: 30 }).notNull(),
  snapshotDate: date('snapshot_date').notNull(),
  metrics: jsonb('metrics').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueSnapshot: uniqueIndex('idx_stats_snapshots_unique').on(table.snapshotType, table.snapshotDate),
  snapshotTypeIdx: index('idx_stats_snapshots_type').on(table.snapshotType),
  snapshotDateIdx: index('idx_stats_snapshots_date').on(table.snapshotDate),
}))

export type StatsSnapshot = typeof statsSnapshots.$inferSelect
export type NewStatsSnapshot = typeof statsSnapshots.$inferInsert
