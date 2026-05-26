import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
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

vi.mock('~/server/utils/jwt', () => ({
  signAccessToken: vi.fn((id, role) => Promise.resolve(`access_${id}_${role}`)),
  signRefreshToken: vi.fn((id, role) => Promise.resolve(`refresh_${id}_${role}`)),
  verifyToken: vi.fn((token) => {
    if (token.startsWith('refresh_')) {
      const parts = token.split('_')
      return Promise.resolve({ sub: parts[1], role: parts[2], type: 'refresh' })
    }
    return Promise.resolve({ sub: 'user-1', role: 'admin', type: 'access' })
  }),
}))

vi.mock('~/server/utils/wechat', () => ({
  code2Session: vi.fn((code) =>
    Promise.resolve({ openid: `openid_${code}`, session_key: 'sk', unionid: undefined })
  ),
  getPhoneNumber: vi.fn((phoneCode) =>
    Promise.resolve({ phoneNumber: '13812345678' })
  ),
}))

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
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn((password, hash) => Promise.resolve(password === 'correct-password')),
  },
}))

import { adminLogin, refreshToken, login } from '~/server/services/auth.service'

describe('adminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw for non-existent username', async () => {
    pushResolve([])

    await expect(adminLogin('nobody', 'pass')).rejects.toThrow('Invalid username or password')
  })

  it('should throw for user without password hash', async () => {
    pushResolve([{
      id: '1',
      username: 'admin',
      passwordHash: null,
      role: 'admin',
    }])

    await expect(adminLogin('admin', 'pass')).rejects.toThrow('Invalid username or password')
  })

  it('should throw for wrong password', async () => {
    pushResolve([{
      id: '1',
      username: 'admin',
      passwordHash: 'hashed',
      role: 'admin',
    }])

    await expect(adminLogin('admin', 'wrong-password')).rejects.toThrow('Invalid username or password')
  })

  it('should return tokens for valid credentials', async () => {
    pushResolve([{
      id: 'admin-1',
      username: 'admin',
      passwordHash: 'hashed',
      role: 'admin',
      openid: null,
      nickname: 'Admin',
      avatarUrl: null,
      phone: '13812345678',
      idCardNo: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }])
    pushResolve([{
      activityPointsBalance: 100,
      donationPointsBalance: 50,
    }])

    const result = await adminLogin('admin', 'correct-password')
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.userInfo).toBeDefined()
  })
})

describe('refreshToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should throw for access token used as refresh', async () => {
    const { verifyToken } = await import('~/server/utils/jwt')
    ;(verifyToken as any).mockResolvedValueOnce({ sub: 'user-1', role: 'admin', type: 'access' })
    await expect(refreshToken('access_user-1_admin')).rejects.toThrow('Invalid token type')
  })

  it('should throw for non-existent user', async () => {
    pushResolve([])

    await expect(refreshToken('refresh_deleted_volunteer')).rejects.toThrow('User not found')
  })

  it('should return new tokens for valid refresh token', async () => {
    pushResolve([{
      id: 'user-1',
      role: 'volunteer',
    }])

    const result = await refreshToken('refresh_user-1_volunteer')
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.expiresIn).toBe(7 * 24 * 3600)
  })
})

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should login existing user', async () => {
    pushResolve([{
      id: 'user-1',
      openid: 'openid_test-code',
      role: 'volunteer',
      phone: null,
      unionId: null,
      nickname: 'Test',
      avatarUrl: null,
      idCardNo: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }])
    pushResolve([])
    pushResolve([{
      activityPointsBalance: 0,
      donationPointsBalance: 0,
    }])

    const result = await login('test-code', 'test-phone-code', 'TestUser', 'http://avatar.jpg')
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.userInfo).toBeDefined()
  })

  it('should register new user when openid not found', async () => {
    pushResolve([])
    pushResolve([])
    pushResolve([{
      id: 'new-user-1',
      openid: 'openid_new-code',
      role: 'volunteer',
      phone: '13812345678',
      unionId: null,
      nickname: 'NewUser',
      avatarUrl: null,
      idCardNo: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }])
    pushResolve([])
    pushResolve([{
      activityPointsBalance: 0,
      donationPointsBalance: 0,
    }])

    const result = await login('new-code', 'phone-code', 'NewUser')
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.userInfo).toBeDefined()
  })
})
