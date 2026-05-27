import { describe, it, expect, vi, beforeEach } from 'vitest'

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaPhi = toRad(lat2 - lat1)
  const deltaLambda = toRad(lon2 - lon1)
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

describe('Haversine distance calculation', () => {
  it('should_return_0_when_same_coordinates', () => {
    expect(calculateDistance(39.9042, 116.4074, 39.9042, 116.4074)).toBeCloseTo(0, 0)
  })

  it('should_calculate_distance_correctly_when_beijing_to_shanghai', () => {
    const distance = calculateDistance(39.9042, 116.4074, 31.2304, 121.4737)
    expect(distance).toBeGreaterThan(1_000_000)
    expect(distance).toBeLessThan(1_200_000)
  })

  it('should_calculate_short_distance_correctly_when_nearby', () => {
    const distance = calculateDistance(39.9042, 116.4074, 39.9072, 116.4074)
    expect(distance).toBeGreaterThan(200)
    expect(distance).toBeLessThan(400)
  })

  it('should_be_symmetric_when_reversed', () => {
    const d1 = calculateDistance(39.9042, 116.4074, 31.2304, 121.4737)
    const d2 = calculateDistance(31.2304, 121.4737, 39.9042, 116.4074)
    expect(d1).toBeCloseTo(d2, 0)
  })

  it('should_handle_equator_crossing_when_crossing', () => {
    const distance = calculateDistance(1, 0, -1, 0)
    expect(distance).toBeGreaterThan(200_000)
    expect(distance).toBeLessThan(230_000)
  })

  it('should_handle_antipodal_points_when_approximately', () => {
    const distance = calculateDistance(0, 0, 0, 180)
    expect(distance).toBeGreaterThan(19_000_000)
    expect(distance).toBeLessThan(21_000_000)
  })
})

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    count: vi.fn(),
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
  ResponseCode: { NOT_FOUND: 404, BAD_REQUEST: 400, FORBIDDEN: 403, CONFLICT: 409 },
}))

vi.mock('~/server/utils/pagination', () => ({
  parsePaginationQuery: vi.fn((q) => ({ page: 1, pageSize: 10, offset: 0 })),
}))

vi.mock('~/server/utils/encryption', () => ({
  maskPhone: vi.fn((p) => p.length === 11 ? p.slice(0, 3) + '****' + p.slice(-4) : p),
}))

import { getMyCheckins } from '~/server/services/checkin.service'

describe('getMyCheckins', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_return_empty_list_when_no_checkins', async () => {
    pushResolve([{ value: 0 }])
    pushResolve([])

    const result = await getMyCheckins('user-1', {})
    expect(result.list).toEqual([])
    expect(result.total).toBe(0)
  })

  it('should_return_checkin_list_with_activity_title_when_checkins_exist', async () => {
    pushResolve([{ value: 2 }])
    pushResolve([
      {
        id: 'checkin-1',
        activityId: 'activity-1',
        checkinType: 'gps',
        checkinTime: new Date(),
        pointsGranted: true,
        createdAt: new Date(),
        activityTitle: '养老院慰问',
      },
      {
        id: 'checkin-2',
        activityId: 'activity-2',
        checkinType: 'qr_code',
        checkinTime: new Date(),
        pointsGranted: false,
        createdAt: new Date(),
        activityTitle: '环保活动',
      },
    ])

    const result = await getMyCheckins('user-1', {})
    expect(result.list).toHaveLength(2)
    expect(result.total).toBe(2)
    expect(result.list[0].activityTitle).toBe('养老院慰问')
  })

  it('should_return_paginated_result_when_query_params_provided', async () => {
    pushResolve([{ value: 25 }])
    pushResolve([
      { id: 'checkin-1', activityId: 'activity-1', checkinType: 'gps', checkinTime: new Date(), pointsGranted: true, createdAt: new Date(), activityTitle: '测试活动' },
    ])

    const result = await getMyCheckins('user-1', { page: 2, pageSize: 10 })
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
    expect(result.total).toBe(25)
  })
})
