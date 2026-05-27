import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
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

vi.mock('~/server/utils/response', () => ({
  createErrorResponse: vi.fn((statusCode, message, code) => {
    const err = new Error(message)
    ;(err as any).statusCode = statusCode
    ;(err as any).data = { code: code || statusCode, message }
    throw err
  }),
}))

import {
  getActivityRanking,
  getDonationRanking,
  getActiveRanking,
  calculateActiveScore,
  getRankChange,
} from '~/server/services/ranking.service'

describe('ranking.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  describe('calculateActiveScore', () => {
    it('should_calculate_correct_score_for_given_counts', () => {
      const score = calculateActiveScore(5, 3, 2)
      expect(score).toBe(170)
    })

    it('should_handle_zero_values', () => {
      const score = calculateActiveScore(0, 0, 0)
      expect(score).toBe(0)
    })

    it('should_handle_individual_zero_values', () => {
      expect(calculateActiveScore(5, 0, 0)).toBe(50)
      expect(calculateActiveScore(0, 3, 0)).toBe(60)
      expect(calculateActiveScore(0, 0, 2)).toBe(60)
    })
  })

  describe('getRankChange', () => {
    it('should_return_zero_when_previous_rank_is_null', () => {
      expect(getRankChange(10, null)).toBe(0)
    })

    it('should_return_positive_when_rank_improved', () => {
      expect(getRankChange(5, 10)).toBe(5)
    })

    it('should_return_negative_when_rank_dropped', () => {
      expect(getRankChange(10, 5)).toBe(-5)
    })

    it('should_return_zero_when_rank_same', () => {
      expect(getRankChange(5, 5)).toBe(0)
    })
  })

  describe('getActivityRanking', () => {
    it('should_return_activity_ranking_with_users', async () => {
      const mockRankData = [
        { userId: 'user-1', totalPoints: 500, nickname: 'User 1', avatarUrl: 'avatar1.jpg' },
        { userId: 'user-2', totalPoints: 400, nickname: 'User 2', avatarUrl: 'avatar2.jpg' },
        { userId: 'user-3', totalPoints: 300, nickname: 'User 3', avatarUrl: 'avatar3.jpg' },
      ]
      const mockTotal = [{ count: 100 }]

      pushResolve(mockTotal)
      pushResolve(mockRankData)

      const result = await getActivityRanking('all', 1, 20)

      expect(result.type).toBe('activity')
      expect(result.period).toBe('all')
      expect(result.total).toBe(100)
      expect(result.list).toHaveLength(3)
      expect(result.list[0].rank).toBe(1)
      expect(result.list[0].score).toBe(500)
      expect(result.list[0].isTop3).toBe(true)
    })
  })

  describe('getDonationRanking', () => {
    it('should_return_donation_ranking_with_users', async () => {
      const mockRankData = [
        { userId: 'user-1', totalAmount: '10000', donationCount: 5, nickname: 'User 1', avatarUrl: 'avatar1.jpg' },
        { userId: 'user-2', totalAmount: '5000', donationCount: 3, nickname: 'User 2', avatarUrl: 'avatar2.jpg' },
      ]
      const mockTotal = [{ count: 50 }]

      pushResolve(mockTotal)
      pushResolve(mockRankData)

      const result = await getDonationRanking('all', 1, 20)

      expect(result.type).toBe('donation')
      expect(result.period).toBe('all')
      expect(result.total).toBe(50)
      expect(result.list).toHaveLength(2)
    })
  })

  describe('getActiveRanking', () => {
    it('should_return_active_ranking_with_users', async () => {
      const mockUsers = [
        { id: 'user-1' },
        { id: 'user-2' },
      ]

      const mockCheckinCount1 = [{ count: 20 }]
      const mockActivityCount1 = [{ count: 10 }]
      const mockDonationCount1 = [{ count: 5 }]
      const mockCheckinCount2 = [{ count: 10 }]
      const mockActivityCount2 = [{ count: 5 }]
      const mockDonationCount2 = [{ count: 2 }]
      
      const mockUserDetail1 = { id: 'user-1', nickname: 'User 1', avatarUrl: 'avatar1.jpg' }
      const mockUserDetail2 = { id: 'user-2', nickname: 'User 2', avatarUrl: 'avatar2.jpg' }

      pushResolve(mockUsers)
      pushResolve(mockCheckinCount1)
      pushResolve(mockActivityCount1)
      pushResolve(mockDonationCount1)
      pushResolve(mockCheckinCount2)
      pushResolve(mockActivityCount2)
      pushResolve(mockDonationCount2)
      pushResolve([mockUserDetail1]) // First user details query
      pushResolve([mockUserDetail1]) // First user in allUserDetails
      pushResolve([mockUserDetail2]) // Second user in allUserDetails

      const result = await getActiveRanking('week', 1, 20)

      expect(result.type).toBe('active')
      expect(result.period).toBe('week')
      expect(result.total).toBe(2)
      expect(result.list).toHaveLength(2)
    })
  })
})
