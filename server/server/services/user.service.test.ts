import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    transaction: vi.fn(),
    offset: vi.fn().mockReturnThis(),
  },
}))

const resolveQueue: any[] = []
const originalThen = mockDb.then
mockDb.then = (resolve: any, reject: any) => {
  const value = resolveQueue.length > 0 ? resolveQueue.shift() : undefined
  return Promise.resolve(value).then(resolve, reject)
}

function pushResolve(value: any) {
  resolveQueue.push(value)
}

vi.mock('#server/db', () => ({
  db: mockDb,
}))

vi.mock('#server/utils/encryption', () => ({
  encryptIdCard: vi.fn((id) => `encrypted_${id}`),
  decryptIdCard: vi.fn((id) => id.replace('encrypted_', '')),
  maskIdCard: vi.fn((id) => id.slice(0, 3) + '****' + id.slice(-4)),
  maskPhone: vi.fn((phone) => phone.slice(0, 3) + '****' + phone.slice(-4)),
}))

vi.mock('#server/utils/response', () => ({
  createErrorResponse: vi.fn((statusCode, message, code) => {
    const err = new Error(message)
    ;(err as any).statusCode = statusCode
    ;(err as any).data = { code: code || statusCode, message }
    throw err
  }),
  ResponseCode: {
    SUCCESS: 0,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    INTERNAL_ERROR: 500,
  },
}))

import {
  calculateHonorLevel,
  getHonorLevels,
  getUserById,
  updateUser,
  verifyRealName,
  freezeUser,
  unfreezeUser,
} from '#server/services/user.service'

describe('calculateHonorLevel', () => {
  it('should return 0 for 0 points', () => {
    expect(calculateHonorLevel(0)).toBe(0)
  })

  it('should return 0 for 99 points', () => {
    expect(calculateHonorLevel(99)).toBe(0)
  })

  it('should return 1 for 100 points', () => {
    expect(calculateHonorLevel(100)).toBe(1)
  })

  it('should return 1 for 499 points', () => {
    expect(calculateHonorLevel(499)).toBe(1)
  })

  it('should return 2 for 500 points', () => {
    expect(calculateHonorLevel(500)).toBe(2)
  })

  it('should return 2 for 1999 points', () => {
    expect(calculateHonorLevel(1999)).toBe(2)
  })

  it('should return 3 for 2000 points', () => {
    expect(calculateHonorLevel(2000)).toBe(3)
  })

  it('should return 3 for 4999 points', () => {
    expect(calculateHonorLevel(4999)).toBe(3)
  })

  it('should return 4 for 5000 points', () => {
    expect(calculateHonorLevel(5000)).toBe(4)
  })

  it('should return 4 for 10000 points', () => {
    expect(calculateHonorLevel(10000)).toBe(4)
  })

  it('should return 0 for negative points', () => {
    expect(calculateHonorLevel(-10)).toBe(0)
  })
})

describe('getHonorLevels', () => {
  it('should return 5 honor levels', () => {
    const levels = getHonorLevels()
    expect(levels).toHaveLength(5)
  })

  it('should have correct level progression', () => {
    const levels = getHonorLevels()
    expect(levels[0].level).toBe(0)
    expect(levels[0].name).toBe('普通志愿者')
    expect(levels[0].minPoints).toBe(0)
    expect(levels[4].level).toBe(4)
    expect(levels[4].name).toBe('钻石志愿者')
    expect(levels[4].minPoints).toBe(5000)
  })

  it('should have ascending minPoints', () => {
    const levels = getHonorLevels()
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i].minPoints).toBeGreaterThan(levels[i - 1].minPoints)
    }
  })

  it('should have correct structure for each level', () => {
    const levels = getHonorLevels()
    for (const level of levels) {
      expect(level).toHaveProperty('level')
      expect(level).toHaveProperty('name')
      expect(level).toHaveProperty('minPoints')
      expect(level).toHaveProperty('icon')
    }
  })

  it('should have correct names for all levels', () => {
    const levels = getHonorLevels()
    expect(levels[0].name).toBe('普通志愿者')
    expect(levels[1].name).toBe('铜牌志愿者')
    expect(levels[2].name).toBe('银牌志愿者')
    expect(levels[3].name).toBe('金牌志愿者')
    expect(levels[4].name).toBe('钻石志愿者')
  })
})

describe('getUserById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should return masked user when found', async () => {
    const mockUser = {
      id: 'user-1',
      nickname: 'Test',
      phone: '13812345678',
      idCardNo: 'encrypted_110101199001011237',
    }
    pushResolve([mockUser])

    const result = await getUserById('user-1')
    expect(result.id).toBe('user-1')
    expect(result.phone).toBe('138****5678')
    expect(mockDb.select).toHaveBeenCalled()
    expect(mockDb.from).toHaveBeenCalled()
    expect(mockDb.where).toHaveBeenCalled()
  })

  it('should throw 404 when user not found', async () => {
    pushResolve([])

    await expect(getUserById('nonexistent')).rejects.toThrow('User not found')
  })
})

describe('updateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should update nickname', async () => {
    const mockUpdated = {
      id: 'user-1',
      nickname: 'NewName',
      phone: '13812345678',
      idCardNo: null,
    }
    pushResolve([mockUpdated])

    const result = await updateUser('user-1', { nickname: 'NewName' })
    expect(result.nickname).toBe('NewName')
    expect(mockDb.update).toHaveBeenCalled()
    expect(mockDb.set).toHaveBeenCalled()
  })

  it('should update avatarUrl', async () => {
    const mockUpdated = {
      id: 'user-1',
      nickname: 'Test',
      avatarUrl: 'http://new-avatar.jpg',
      phone: null,
      idCardNo: null,
    }
    pushResolve([mockUpdated])

    const result = await updateUser('user-1', { avatarUrl: 'http://new-avatar.jpg' })
    expect(result.avatarUrl).toBe('http://new-avatar.jpg')
  })

  it('should throw 404 when user not found', async () => {
    pushResolve([])

    await expect(updateUser('nonexistent', { nickname: 'Test' })).rejects.toThrow('User not found')
  })
})

describe('verifyRealName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw 422 for invalid id card format (too short)', async () => {
    await expect(
      verifyRealName('user-1', { realName: '张三', idCardNo: '123' })
    ).rejects.toThrow('Invalid ID card number format')
  })

  it('should throw 422 for invalid id card format (wrong check digit)', async () => {
    await expect(
      verifyRealName('user-1', { realName: '张三', idCardNo: '110101199001011230' })
    ).rejects.toThrow('Invalid ID card number format')
  })

  it('should throw 409 when id card already used by another user', async () => {
    pushResolve([{ id: 'other-user' }])

    await expect(
      verifyRealName('user-1', { realName: '张三', idCardNo: '110101199001011237' })
    ).rejects.toThrow('ID card number already registered by another user')
  })

  it('should verify real name successfully', async () => {
    pushResolve([])
    const mockUpdated = {
      id: 'user-1',
      realName: '张三',
      idCardNo: 'encrypted_110101199001011237',
      realNameVerified: true,
      phone: null,
    }
    pushResolve([mockUpdated])

    const result = await verifyRealName('user-1', {
      realName: '张三',
      idCardNo: '110101199001011237',
    })
    expect(result.realName).toBe('张三')
    expect(result.realNameVerified).toBe(true)
  })
})

describe('freezeUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should freeze user successfully', async () => {
    const mockFrozen = { id: 'user-1', status: 'frozen' }
    pushResolve([mockFrozen])

    const result = await freezeUser('user-1')
    expect(result.status).toBe('frozen')
    expect(mockDb.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'frozen' })
    )
  })

  it('should throw 404 when user not found', async () => {
    pushResolve([])

    await expect(freezeUser('nonexistent')).rejects.toThrow('User not found')
  })
})

describe('unfreezeUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should unfreeze user successfully', async () => {
    const mockActive = { id: 'user-1', status: 'active' }
    pushResolve([mockActive])

    const result = await unfreezeUser('user-1')
    expect(result.status).toBe('active')
    expect(mockDb.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' })
    )
  })

  it('should throw 404 when user not found', async () => {
    pushResolve([])

    await expect(unfreezeUser('nonexistent')).rejects.toThrow('User not found')
  })
})
