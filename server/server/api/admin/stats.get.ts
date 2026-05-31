import { defineEventHandler } from 'h3'
import { sql } from 'drizzle-orm'
import { db } from '#server/db'
import { success, createErrorResponse } from '#server/utils/response'

function requireAdmin(event: any) {
  if (!event.context.auth || event.context.auth.role !== 'admin') {
    throw createErrorResponse(403, 'Admin access required')
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const [userResult, activityResult, donationResult, pointsResult] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS count FROM users WHERE role != 'admin'`),
    db.execute(sql`SELECT COUNT(*)::int AS count FROM activities`),
    db.execute(sql`SELECT COUNT(*)::int AS count FROM donations WHERE status = 'pending'`),
    db.execute(sql`
      SELECT COALESCE(SUM(amount), 0)::int AS total
      FROM point_transactions
      WHERE amount > 0
        AND created_at >= date_trunc('month', CURRENT_DATE)
    `),
  ])

  return success({
    totalUsers: userResult.rows[0]?.count ?? 0,
    totalActivities: activityResult.rows[0]?.count ?? 0,
    pendingDonations: donationResult.rows[0]?.count ?? 0,
    monthlyPointsIssued: pointsResult.rows[0]?.total ?? 0,
  })
})
