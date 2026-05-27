import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    rightJoin: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    transaction: vi.fn(),
    offset: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
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

vi.mock('~/server/db', () => ({
  db: mockDb,
}))

vi.mock('~/server/utils/response', () => ({
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
  createMarketPost,
  getMarketPosts,
  getMarketPostById,
  deleteMarketPost,
  favoriteMarketPost,
  unfavoriteMarketPost,
  getMyMarketPosts,
  getPendingMarketPosts,
  reviewMarketPost,
} from '~/server/services/market.service'

describe('MarketService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  describe('createMarketPost', () => {
    it('should create a new market post successfully', async () => {
      const userId = 'user-1'
      const postData = {
        postType: 'job',
        title: '招聘志愿者助理',
        content: '这是一个详细的职位描述，包含工作内容和要求。',
        images: ['image1.jpg', 'image2.jpg'],
        contactInfo: '13800138000',
        location: '上海',
        price: null,
        pointsCost: 10,
        pointTypeUsed: 'activity',
      }
      
      const mockResult = [{
        id: 'post-1',
        userId,
        ...postData,
        status: 'pending',
        viewCount: 0,
        favoriteCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]
      
      pushResolve(mockResult)
      
      const result = await createMarketPost(userId, postData)
      expect(result).toBeDefined()
      expect(result.status).toBe('pending')
      expect(mockDb.insert).toHaveBeenCalled()
      expect(mockDb.values).toHaveBeenCalled()
      expect(mockDb.returning).toHaveBeenCalled()
    })

    it('should throw error for invalid post type', async () => {
      const userId = 'user-1'
      const postData = {
        postType: 'invalid',
        title: '招聘志愿者助理',
        content: '这是一个详细的职位描述',
        images: [],
        contactInfo: '13800138000',
        location: '上海',
        price: null,
        pointsCost: 10,
        pointTypeUsed: 'activity',
      }
      
      await expect(createMarketPost(userId, postData)).rejects.toThrow()
    })
  })

  describe('getMarketPosts', () => {
    it('should return paginated list of approved posts', async () => {
      const mockPostsWithUser = [
        { post: { id: 'post-1', title: 'Post 1', status: 'approved', contactInfo: '13800138000' }, user: { id: 'user-1', nickname: 'User 1' } },
        { post: { id: 'post-2', title: 'Post 2', status: 'approved', contactInfo: '13900139000' }, user: { id: 'user-2', nickname: 'User 2' } },
      ]
      const mockTotal = [{ count: 10 }]
      
      pushResolve(mockTotal)
      pushResolve(mockPostsWithUser)
      
      const result = await getMarketPosts({ page: 1, pageSize: 10 })
      expect(result.list).toHaveLength(2)
      expect(result.total).toBe(10)
    })
  })

  describe('getMarketPostById', () => {
    it('should return post by id', async () => {
      const mockPostWithUser = [{ post: { id: 'post-1', title: 'Test Post', status: 'approved', contactInfo: '13800138000' }, user: { id: 'user-1', nickname: 'User 1' } }]
      const mockUpdatedPost = [{ id: 'post-1', title: 'Test Post', viewCount: 1 }]
      pushResolve(mockPostWithUser)
      pushResolve(mockUpdatedPost)
      
      const result = await getMarketPostById('post-1')
      expect(result.id).toBe('post-1')
    })

    it('should throw 404 when post not found', async () => {
      pushResolve([])
      
      await expect(getMarketPostById('nonexistent')).rejects.toThrow()
    })
  })

  describe('deleteMarketPost', () => {
    it('should delete post successfully', async () => {
      const mockPost = { id: 'post-1', userId: 'user-1', status: 'pending' }
      pushResolve([mockPost])
      pushResolve([{ id: 'post-1' }])
      
      const result = await deleteMarketPost('user-1', 'post-1')
      expect(result).toBeDefined()
    })

    it('should throw 403 when user is not owner', async () => {
      const mockPost = { id: 'post-1', userId: 'user-2', status: 'pending' }
      pushResolve([mockPost])
      
      await expect(deleteMarketPost('user-1', 'post-1')).rejects.toThrow()
    })
  })

  describe('favoriteMarketPost', () => {
    it('should favorite post successfully', async () => {
      const mockPost = { id: 'post-1', favoriteCount: 0 }
      pushResolve([mockPost])
      pushResolve([{ id: 'fav-1' }])
      pushResolve([{ ...mockPost, favoriteCount: 1 }])
      
      const result = await favoriteMarketPost('user-1', 'post-1')
      expect(result.favoriteCount).toBe(1)
    })
  })

  describe('unfavoriteMarketPost', () => {
    it('should unfavorite post successfully', async () => {
      const mockPost = { id: 'post-1', favoriteCount: 1 }
      pushResolve([mockPost])
      pushResolve([{ id: 'post-1' }])
      pushResolve([{ ...mockPost, favoriteCount: 0 }])
      
      const result = await unfavoriteMarketPost('user-1', 'post-1')
      expect(result.favoriteCount).toBe(0)
    })
  })

  describe('getMyMarketPosts', () => {
    it('should return user\'s posts', async () => {
      const mockPosts = [
        { id: 'post-1', userId: 'user-1', title: 'My Post' },
      ]
      const mockTotal = [{ count: 5 }]
      
      pushResolve(mockTotal)
      pushResolve(mockPosts)
      
      const result = await getMyMarketPosts('user-1', { page: 1, pageSize: 10 })
      expect(result.list).toHaveLength(1)
    })
  })

  describe('getPendingMarketPosts', () => {
    it('should return pending posts for admin', async () => {
      const mockPosts = [
        { id: 'post-1', status: 'pending', title: 'Pending Post' },
      ]
      const mockTotal = [{ count: 3 }]
      
      pushResolve(mockTotal)
      pushResolve(mockPosts)
      
      const result = await getPendingMarketPosts({ page: 1, pageSize: 10 })
      expect(result.list).toHaveLength(1)
    })
  })

  describe('reviewMarketPost', () => {
    it('should approve post successfully', async () => {
      const mockPost = { id: 'post-1', status: 'pending' }
      pushResolve([mockPost])
      pushResolve([{ ...mockPost, status: 'approved' }])
      
      const result = await reviewMarketPost('admin-1', 'post-1', 'approved')
      expect(result.status).toBe('approved')
    })

    it('should reject post successfully', async () => {
      const mockPost = { id: 'post-1', status: 'pending' }
      pushResolve([mockPost])
      pushResolve([{ ...mockPost, status: 'rejected' }])
      
      const result = await reviewMarketPost('admin-1', 'post-1', 'rejected')
      expect(result.status).toBe('rejected')
    })
  })
})
