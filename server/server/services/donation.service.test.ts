import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
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

vi.mock('~/server/utils/encryption', () => ({
  maskPhone: vi.fn((p) => p.length === 11 ? p.slice(0, 3) + '****' + p.slice(-4) : p),
}))

vi.mock('~/server/utils/response', () => ({
  createErrorResponse: vi.fn((statusCode, message, code) => {
    const err = new Error(message)
    ;(err as any).statusCode = statusCode
    ;(err as any).data = { code: code || statusCode, message }
    throw err
  }),
  ResponseCode: { NOT_FOUND: 404, BAD_REQUEST: 400, FORBIDDEN: 403 },
}))

vi.mock('~/server/utils/pagination', () => ({
  parsePaginationQuery: vi.fn((q) => ({ page: 1, pageSize: 10, offset: 0 })),
}))

import { createDonation, getDonationById, approveDonation, rejectDonation } from '~/server/services/donation.service'

describe('createDonation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should create a money donation', async () => {
    const mockDonation = {
      id: 'donation-1',
      userId: 'user-1',
      donationType: 'money',
      amount: '100',
      materialDesc: null,
      materialValue: null,
      evidenceImages: ['http://img1.jpg'],
      evidenceDesc: 'test',
      status: 'pending',
      pointsGranted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    pushResolve([mockDonation])

    const result = await createDonation('user-1', {
      donationType: 'money',
      amount: 100,
      evidenceImages: ['http://img1.jpg'],
      evidenceDesc: 'test',
    })

    expect(result).toEqual(mockDonation)
    expect(mockDb.insert).toHaveBeenCalled()
    expect(mockDb.values).toHaveBeenCalled()
  })

  it('should create a material donation', async () => {
    const mockDonation = {
      id: 'donation-2',
      userId: 'user-1',
      donationType: 'material',
      amount: null,
      materialDesc: 'Books',
      materialValue: '50',
      evidenceImages: ['http://img2.jpg'],
      evidenceDesc: null,
      status: 'pending',
      pointsGranted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    pushResolve([mockDonation])

    const result = await createDonation('user-1', {
      donationType: 'material',
      materialDesc: 'Books',
      materialValue: 50,
      evidenceImages: ['http://img2.jpg'],
    })

    expect(result).toEqual(mockDonation)
    expect(result.donationType).toBe('material')
  })
})

describe('getDonationById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when donation not found', async () => {
    pushResolve([])

    await expect(
      getDonationById('nonexistent', 'user-1', 'volunteer')
    ).rejects.toThrow('捐助记录不存在')
  })

  it('should throw 403 when volunteer tries to access another user donation', async () => {
    const mockDonation = {
      id: 'donation-1',
      userId: 'other-user',
      donationType: 'money',
      donorPhone: '13812345678',
    }
    pushResolve([mockDonation])

    await expect(
      getDonationById('donation-1', 'user-1', 'volunteer')
    ).rejects.toThrow('无权查看此捐助记录')
  })

  it('should return donation for owner', async () => {
    const mockDonation = {
      id: 'donation-1',
      userId: 'user-1',
      donationType: 'money',
      donorPhone: '13812345678',
    }
    pushResolve([mockDonation])

    const result = await getDonationById('donation-1', 'user-1', 'volunteer')
    expect(result.id).toBe('donation-1')
  })

  it('should return donation for admin even if not owner', async () => {
    const mockDonation = {
      id: 'donation-1',
      userId: 'other-user',
      donationType: 'money',
      donorPhone: '13812345678',
    }
    pushResolve([mockDonation])

    const result = await getDonationById('donation-1', 'admin-1', 'admin')
    expect(result.id).toBe('donation-1')
  })

  it('should mask donor phone in result', async () => {
    const mockDonation = {
      id: 'donation-1',
      userId: 'user-1',
      donationType: 'money',
      donorPhone: '13812345678',
    }
    pushResolve([mockDonation])

    const result = await getDonationById('donation-1', 'user-1', 'volunteer')
    expect(result.donorPhone).toBe('138****5678')
  })
})

describe('approveDonation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when donation not found', async () => {
    pushResolve([])

    await expect(
      approveDonation('nonexistent', 'reviewer-1', { pointsToGrant: 10 })
    ).rejects.toThrow('捐助记录不存在')
  })

  it('should throw 400 when donation is not pending', async () => {
    pushResolve([{
      id: 'donation-1',
      status: 'approved',
      userId: 'user-1',
    }])

    await expect(
      approveDonation('donation-1', 'reviewer-1', { pointsToGrant: 10 })
    ).rejects.toThrow('只有待审核的捐助记录才能审核通过')
  })

  it('should approve donation without points', async () => {
    pushResolve([{
      id: 'donation-1',
      status: 'pending',
      userId: 'user-1',
    }])
    pushResolve([])
    const mockApproved = {
      id: 'donation-1',
      status: 'approved',
      reviewerId: 'reviewer-1',
    }
    pushResolve([mockApproved])

    const result = await approveDonation('donation-1', 'reviewer-1', {})
    expect(result.status).toBe('approved')
  })

  it('should approve donation with points using transaction', async () => {
    pushResolve([{
      id: 'donation-1',
      status: 'pending',
      userId: 'user-1',
    }])

    mockDb.transaction.mockImplementationOnce(async (fn) => {
      const mockTx = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(undefined),
      }
      await fn(mockTx)
    })

    const mockApproved = {
      id: 'donation-1',
      status: 'approved',
      pointsGranted: true,
    }
    pushResolve([mockApproved])

    const result = await approveDonation('donation-1', 'reviewer-1', { pointsToGrant: 50 })
    expect(result).toBeDefined()
    expect(mockDb.transaction).toHaveBeenCalled()
  })
})

describe('rejectDonation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when donation not found', async () => {
    pushResolve([])

    await expect(
      rejectDonation('nonexistent', 'reviewer-1', { reviewRemark: 'invalid' })
    ).rejects.toThrow('捐助记录不存在')
  })

  it('should throw 400 when donation is not pending', async () => {
    pushResolve([{
      id: 'donation-1',
      status: 'rejected',
      userId: 'user-1',
    }])

    await expect(
      rejectDonation('donation-1', 'reviewer-1', { reviewRemark: 'invalid' })
    ).rejects.toThrow('只有待审核的捐助记录才能驳回')
  })

  it('should reject donation successfully', async () => {
    pushResolve([{
      id: 'donation-1',
      status: 'pending',
      userId: 'user-1',
    }])
    const mockRejected = {
      id: 'donation-1',
      status: 'rejected',
      reviewerId: 'reviewer-1',
      reviewRemark: '不合规',
    }
    pushResolve([mockRejected])

    const result = await rejectDonation('donation-1', 'reviewer-1', { reviewRemark: '不合规' })
    expect(result.status).toBe('rejected')
    expect(result.reviewRemark).toBe('不合规')
  })
})
