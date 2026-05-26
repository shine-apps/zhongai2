import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    transaction: vi.fn(),
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
  ResponseCode: { NOT_FOUND: 404, BAD_REQUEST: 400 },
}))

vi.mock('~/server/utils/pagination', () => ({
  parsePaginationQuery: vi.fn((q) => ({ page: 1, pageSize: 10, offset: 0 })),
}))

vi.mock('~/server/services/user.service', () => ({
  calculateHonorLevel: vi.fn((pts) => {
    if (pts >= 5000) return 4
    if (pts >= 2000) return 3
    if (pts >= 500) return 2
    if (pts >= 100) return 1
    return 0
  }),
}))

import { getBalance, getTransactions, updateRule, adjustPoints } from '~/server/services/points.service'

describe('getBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should return zeros when no account exists', async () => {
    pushResolve([])
    const result = await getBalance('user-no-account')
    expect(result).toEqual({
      activityBalance: 0,
      activityTotal: 0,
      donationBalance: 0,
      donationTotal: 0,
    })
  })

  it('should return balance when account exists', async () => {
    pushResolve([{
      activityPointsBalance: 100,
      activityPointsTotal: 200,
      donationPointsBalance: 50,
      donationPointsTotal: 80,
    }])
    const result = await getBalance('user-with-account')
    expect(result).toEqual({
      activityBalance: 100,
      activityTotal: 200,
      donationBalance: 50,
      donationTotal: 80,
    })
  })

  it('should handle null values in account', async () => {
    pushResolve([{
      activityPointsBalance: null,
      activityPointsTotal: null,
      donationPointsBalance: null,
      donationPointsTotal: null,
    }])
    const result = await getBalance('user-null-values')
    expect(result).toEqual({
      activityBalance: 0,
      activityTotal: 0,
      donationBalance: 0,
      donationTotal: 0,
    })
  })

  it('should handle partial null values', async () => {
    pushResolve([{
      activityPointsBalance: 50,
      activityPointsTotal: null,
      donationPointsBalance: null,
      donationPointsTotal: 30,
    }])
    const result = await getBalance('user-partial-nulls')
    expect(result).toEqual({
      activityBalance: 50,
      activityTotal: 0,
      donationBalance: 0,
      donationTotal: 30,
    })
  })
})

describe('getTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should return paginated transactions', async () => {
    pushResolve([{ value: 1 }])
    pushResolve([{ id: 'tx-1', amount: 10 }])

    const result = await getTransactions('user-1', {})
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
    expect(result.total).toBe(1)
  })
})

describe('updateRule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when rule not found', async () => {
    pushResolve([])

    await expect(
      updateRule('nonexistent', { pointsPerUnit: 10 })
    ).rejects.toThrow('Rule not found')
  })

  it('should update rule when found', async () => {
    pushResolve([{ id: 'rule-1', pointsPerUnit: 5 }])
    const mockUpdated = { id: 'rule-1', pointsPerUnit: 10 }
    pushResolve([mockUpdated])

    const result = await updateRule('rule-1', { pointsPerUnit: 10 })
    expect(result.pointsPerUnit).toBe(10)
  })
})

describe('adjustPoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when target user not found', async () => {
    pushResolve([])

    await expect(
      adjustPoints('admin-1', {
        userId: 'nonexistent',
        pointType: 'activity',
        amount: 100,
        description: 'test',
      })
    ).rejects.toThrow('User not found')
  })

  it('should adjust points for existing user with account', async () => {
    pushResolve([{ id: 'user-1' }])

    mockDb.transaction.mockImplementationOnce(async (fn) => {
      const mockTx = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{
          activityPointsBalance: 100,
          activityPointsTotal: 200,
        }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
          id: 'tx-1',
          userId: 'user-1',
          amount: 50,
        }]),
      }
      await fn(mockTx)
    })

    pushResolve([{ activityPointsTotal: 250, donationPointsTotal: 0 }])
    pushResolve([{ honorLevel: 0 }])

    await adjustPoints('admin-1', {
      userId: 'user-1',
      pointType: 'activity',
      amount: 50,
      description: 'admin adjustment',
    })

    expect(mockDb.transaction).toHaveBeenCalled()
  })

  it('should adjust points for user without account (create new)', async () => {
    pushResolve([{ id: 'user-1' }])

    mockDb.transaction.mockImplementationOnce(async (fn) => {
      const mockTx = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
          id: 'tx-1',
          userId: 'user-1',
          amount: 100,
        }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      }
      await fn(mockTx)
    })

    pushResolve([{ activityPointsTotal: 100, donationPointsTotal: 0 }])
    pushResolve([{ honorLevel: 0 }])

    await adjustPoints('admin-1', {
      userId: 'user-1',
      pointType: 'activity',
      amount: 100,
      description: 'initial points',
    })

    expect(mockDb.transaction).toHaveBeenCalled()
  })
})
