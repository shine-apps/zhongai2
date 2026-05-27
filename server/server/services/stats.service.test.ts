import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
  },
}))

const resolveQueue: any[] = []
mockDb.then = (resolve: any, reject: any) => {
  const value = resolveQueue.length > 0 ? resolveQueue.shift() : undefined
  return Promise.resolve(value).then(resolve, reject)
}

function pushResolve(value: any) {
  resolveQueue.push(value)
}

vi.mock('~/server/db', () => ({ db: mockDb }))

import {
  getPublicStats,
  getStatsOverview,
  getTrendData,
} from '~/server/services/stats.service'

describe('Stats Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  describe('getPublicStats', () => {
    it('should return public statistics', async () => {
      pushResolve([{ value: 1000 }])
      pushResolve([{ value: 100 }])
      pushResolve([{ value: 50000 }])
      pushResolve([{ value: 500 }])

      const result = await getPublicStats()

      expect(result.totalUsers).toBe(1000)
      expect(result.totalActivities).toBe(100)
      expect(result.totalDonations).toBe(50000)
      expect(result.totalCheckins).toBe(500)
    })
  })

  describe('getStatsOverview', () => {
    it('should return comprehensive stats overview', async () => {
      pushResolve([{ value: 1000 }])
      pushResolve([{ value: 50 }])
      pushResolve([{ value: 100 }])
      pushResolve([{ value: 80 }])
      pushResolve([{ value: 100 }])
      pushResolve([{ value: 30 }])
      pushResolve([{ value: 50 }])
      pushResolve([{ value: 20 }])
      pushResolve([{ value: 500 }])
      pushResolve([{ value: 30 }])
      pushResolve([{ value: 150 }])
      // 模拟 donations 查询
      pushResolve([
        { amount: 1000, createdAt: new Date() },
        { amount: 2000, createdAt: new Date() },
        { amount: 47000, createdAt: new Date(Date.now() - 86400000) }
      ])
      pushResolve([{ value: 10000 }])

      const result = await getStatsOverview()

      expect(result.users.total).toBe(1000)
      expect(result.users.newToday).toBe(50)
      expect(result.users.newWeek).toBe(100)
      expect(result.users.newMonth).toBe(80)
      expect(result.activities.total).toBe(100)
      expect(result.activities.published).toBe(30)
      expect(result.activities.ongoing).toBe(50)
      expect(result.activities.completed).toBe(20)
      expect(result.checkins.total).toBe(500)
      expect(result.checkins.today).toBe(30)
      expect(result.checkins.week).toBe(150)
      expect(result.donations.totalAmount).toBe(50000)
      expect(result.donations.totalCount).toBe(3)
      expect(result.donations.todayAmount).toBe(3000)
      expect(result.donations.todayCount).toBe(2)
      expect(result.points.totalDistributed).toBe(10000)
      expect(result.updatedAt).toBeDefined()
    })
  })

  describe('getTrendData', () => {
    it('should return trend data for users', async () => {
      pushResolve([
        { snapshotDate: '2026-05-20', metrics: { users: { newToday: 30 } } },
        { snapshotDate: '2026-05-21', metrics: { users: { newToday: 45 } } },
        { snapshotDate: '2026-05-22', metrics: { users: { newToday: 50 } } },
      ])

      const result = await getTrendData('users', 'day', 30)

      expect(result.metric).toBe('users')
      expect(result.period).toBe('day')
      expect(result.data).toHaveLength(3)
      expect(result.data[0].date).toBe('2026-05-20')
      expect(result.data[0].value).toBe(30)
    })

    it('should return trend data for donations', async () => {
      pushResolve([
        { snapshotDate: '2026-05-20', metrics: { donations: { todayAmount: 1000 } } },
        { snapshotDate: '2026-05-21', metrics: { donations: { todayAmount: 2000 } } },
      ])

      const result = await getTrendData('donations', 'day', 30)

      expect(result.metric).toBe('donations')
      expect(result.data).toHaveLength(2)
      expect(result.data[0].value).toBe(1000)
    })

    it('should return trend data for activities', async () => {
      pushResolve([
        { snapshotDate: '2026-05-20', metrics: { activities: { published: 5 } } },
        { snapshotDate: '2026-05-21', metrics: { activities: { published: 8 } } },
      ])

      const result = await getTrendData('activities', 'day', 30)

      expect(result.metric).toBe('activities')
      expect(result.data).toHaveLength(2)
      expect(result.data[0].value).toBe(5)
    })
  })
})
