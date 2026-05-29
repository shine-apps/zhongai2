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
    delete: vi.fn().mockReturnThis(),
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

vi.mock('#server/db', () => ({ db: mockDb }))

vi.mock('#server/utils/response', () => ({
  createErrorResponse: vi.fn((statusCode, message, code) => {
    const err = new Error(message)
    ;(err as any).statusCode = statusCode
    ;(err as any).data = { code: code || statusCode, message }
    throw err
  }),
  ResponseCode: {
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    CONFLICT: 409,
    UNAUTHORIZED: 401,
  },
}))

vi.mock('#server/utils/pagination', () => ({
  parsePaginationQuery: vi.fn((q) => ({ page: 1, pageSize: 10, offset: 0 })),
}))

import {
  requireLeaderOrAdmin,
  getActivityById,
  createActivity,
  publishActivity,
  cancelActivity,
  deleteActivity,
  registerActivity,
} from '#server/services/activity.service'

describe('requireLeaderOrAdmin', () => {
  it('should throw for volunteer role', () => {
    const event = { context: { auth: { userId: '1', role: 'volunteer' } } }
    expect(() => requireLeaderOrAdmin(event)).toThrow('需要团长或管理员权限')
  })

  it('should throw for no auth', () => {
    const event = { context: {} }
    expect(() => requireLeaderOrAdmin(event)).toThrow()
  })

  it('should return auth for leader role', () => {
    const event = { context: { auth: { userId: '1', role: 'leader' } } }
    const result = requireLeaderOrAdmin(event)
    expect(result.role).toBe('leader')
  })

  it('should return auth for admin role', () => {
    const event = { context: { auth: { userId: '1', role: 'admin' } } }
    const result = requireLeaderOrAdmin(event)
    expect(result.role).toBe('admin')
  })
})

describe('getActivityById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when activity not found', async () => {
    pushResolve([])

    await expect(getActivityById('nonexistent')).rejects.toThrow('活动不存在')
  })

  it('should return activity when found', async () => {
    const mockActivity = {
      id: 'activity-1',
      title: 'Test Activity',
      category: 'volunteer',
      organizerName: 'Admin',
    }
    pushResolve([mockActivity])

    const result = await getActivityById('activity-1')
    expect(result.id).toBe('activity-1')
    expect(result.title).toBe('Test Activity')
  })
})

describe('createActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should create activity with draft status', async () => {
    const mockActivity = {
      id: 'activity-1',
      title: 'New Activity',
      status: 'draft',
      organizerId: 'leader-1',
    }
    pushResolve([mockActivity])

    const result = await createActivity(
      {
        title: 'New Activity',
        category: 'volunteer',
        description: 'desc',
        coverImage: null,
        startTime: new Date(),
        endTime: new Date(),
        location: 'Beijing',
        latitude: '39.9',
        longitude: '116.4',
        checkinRadius: 200,
        maxParticipants: 50,
        rewardPoints: 10,
      },
      'leader-1'
    )

    expect(result.status).toBe('draft')
    expect(result.organizerId).toBe('leader-1')
  })
})

describe('publishActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when activity not found', async () => {
    pushResolve([])

    await expect(
      publishActivity('nonexistent', 'leader-1', 'leader')
    ).rejects.toThrow('活动不存在')
  })

  it('should throw 400 when activity is not in draft status', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'published',
      organizerId: 'leader-1',
    }])

    await expect(
      publishActivity('activity-1', 'leader-1', 'leader')
    ).rejects.toThrow('只有草稿状态的活动才能发布')
  })

  it('should throw 403 when non-admin non-organizer tries to publish', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'draft',
      organizerId: 'leader-1',
    }])

    await expect(
      publishActivity('activity-1', 'other-user', 'volunteer')
    ).rejects.toThrow('需要活动组织者或管理员权限')
  })

  it('should publish draft activity', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'draft',
      organizerId: 'leader-1',
    }])
    const mockPublished = {
      id: 'activity-1',
      status: 'published',
      publishedAt: new Date(),
    }
    pushResolve([mockPublished])

    const result = await publishActivity('activity-1', 'leader-1', 'leader')
    expect(result.status).toBe('published')
  })

  it('should allow admin to publish any activity', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'draft',
      organizerId: 'leader-1',
    }])
    const mockPublished = {
      id: 'activity-1',
      status: 'published',
    }
    pushResolve([mockPublished])

    const result = await publishActivity('activity-1', 'admin-1', 'admin')
    expect(result.status).toBe('published')
  })
})

describe('cancelActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when activity not found', async () => {
    pushResolve([])

    await expect(
      cancelActivity('nonexistent', 'leader-1', 'leader')
    ).rejects.toThrow('活动不存在')
  })

  it('should throw 400 when activity is already cancelled', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'cancelled',
      organizerId: 'leader-1',
    }])

    await expect(
      cancelActivity('activity-1', 'leader-1', 'leader')
    ).rejects.toThrow('活动已取消')
  })

  it('should throw 400 when activity is completed', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'completed',
      organizerId: 'leader-1',
    }])

    await expect(
      cancelActivity('activity-1', 'leader-1', 'leader')
    ).rejects.toThrow('已完成的活动不能取消')
  })

  it('should cancel published activity', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'published',
      organizerId: 'leader-1',
    }])
    const mockCancelled = {
      id: 'activity-1',
      status: 'cancelled',
    }
    pushResolve([mockCancelled])

    const result = await cancelActivity('activity-1', 'leader-1', 'leader')
    expect(result.status).toBe('cancelled')
  })
})

describe('deleteActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when activity not found', async () => {
    pushResolve([])

    await expect(
      deleteActivity('nonexistent', 'leader-1', 'leader')
    ).rejects.toThrow('活动不存在')
  })

  it('should throw 400 when activity is not in draft status', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'published',
      organizerId: 'leader-1',
    }])

    await expect(
      deleteActivity('activity-1', 'leader-1', 'leader')
    ).rejects.toThrow('只有草稿状态的活动才能删除')
  })

  it('should delete draft activity', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'draft',
      organizerId: 'leader-1',
    }])

    await deleteActivity('activity-1', 'leader-1', 'leader')
    expect(mockDb.delete).toHaveBeenCalled()
  })
})

describe('registerActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 404 when activity not found', async () => {
    pushResolve([])

    await expect(
      registerActivity('nonexistent', 'user-1')
    ).rejects.toThrow('活动不存在')
  })

  it('should throw 400 when activity is not open for registration', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'draft',
      organizerId: 'leader-1',
      maxParticipants: null,
      currentParticipants: 0,
    }])

    await expect(
      registerActivity('activity-1', 'user-1')
    ).rejects.toThrow('活动未开放报名')
  })

  it('should throw 400 when activity is full', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'published',
      organizerId: 'leader-1',
      maxParticipants: 10,
      currentParticipants: 10,
    }])

    await expect(
      registerActivity('activity-1', 'user-1')
    ).rejects.toThrow('活动人数已满')
  })

  it('should throw 400 when organizer tries to register own activity', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'published',
      organizerId: 'leader-1',
      maxParticipants: null,
      currentParticipants: 0,
    }])

    await expect(
      registerActivity('activity-1', 'leader-1')
    ).rejects.toThrow('组织者不能报名自己的活动')
  })

  it('should throw 409 when already registered', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'published',
      organizerId: 'leader-1',
      maxParticipants: null,
      currentParticipants: 0,
    }])
    pushResolve([{
      id: 'reg-1',
      status: 'approved',
    }])

    await expect(
      registerActivity('activity-1', 'user-1')
    ).rejects.toThrow('已经报名该活动')
  })

  it('should register successfully for published activity', async () => {
    pushResolve([{
      id: 'activity-1',
      status: 'published',
      organizerId: 'leader-1',
      maxParticipants: null,
      currentParticipants: 0,
    }])
    pushResolve([])

    mockDb.transaction.mockImplementationOnce(async (fn) => {
      const mockTx = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
          id: 'reg-1',
          activityId: 'activity-1',
          userId: 'user-1',
          status: 'pending',
        }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      }
      await fn(mockTx)
    })

    const result = await registerActivity('activity-1', 'user-1', 'excited to join')
    expect(result).toBeDefined()
    expect(mockDb.transaction).toHaveBeenCalled()
  })
})
