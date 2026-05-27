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

vi.mock('~/server/db', () => ({ db: mockDb }))

vi.mock('~/server/utils/response', () => ({
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
    VALIDATION_ERROR: 422,
  },
}))

vi.mock('~/server/utils/pagination', () => ({
  parsePaginationQuery: vi.fn((q) => ({ page: 1, pageSize: 10, offset: 0 })),
}))

import {
  getActiveBanners,
  getBannerList,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  updateBannerStatus,
  recordBannerClick,
} from '~/server/services/banner.service'

describe('BannerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  describe('getActiveBanners', () => {
    it('should_return_only_published_and_active_banners', async () => {
      const mockBanners = [
        { id: 'banner-1', title: 'Active Banner', status: 'published' },
      ]
      pushResolve(mockBanners)

      const result = await getActiveBanners('home_top')
      expect(result).toEqual(mockBanners)
    })

    it('should_order_by_sort_order_asc', async () => {
      pushResolve([])
      await getActiveBanners('home_top')
      expect(mockDb.orderBy).toHaveBeenCalled()
    })
  })

  describe('createBanner', () => {
    it('should_create_banner_with_draft_status', async () => {
      const mockBanner = {
        id: 'banner-1',
        title: 'Test Banner',
        status: 'draft',
        createdBy: 'admin-1',
      }
      pushResolve([mockBanner])

      const result = await createBanner({
        position: 'home_top',
        title: 'Test Banner',
        imageUrl: 'https://example.com/banner.jpg',
      }, 'admin-1')

      expect(result.status).toBe('draft')
      expect(result.createdBy).toBe('admin-1')
    })
  })

  describe('updateBannerStatus', () => {
    it('should_throw_404_when_banner_not_found', async () => {
      pushResolve([])
      await expect(
        updateBannerStatus('nonexistent', 'published', 'admin-1')
      ).rejects.toThrow('轮播图不存在')
    })

    it('should_update_banner_status_successfully', async () => {
      pushResolve([{ id: 'banner-1', status: 'draft' }])
      pushResolve([{ id: 'banner-1', status: 'published' }])

      const result = await updateBannerStatus('banner-1', 'published', 'admin-1')
      expect(result.status).toBe('published')
    })
  })

  describe('recordBannerClick', () => {
    it('should_increment_click_count', async () => {
      pushResolve([{ id: 'banner-1', clickCount: 5 }])
      pushResolve([{ id: 'banner-1', clickCount: 6 }])

      const result = await recordBannerClick('banner-1')
      expect(result.clickCount).toBeGreaterThan(5)
    })

    it('should_throw_404_when_banner_not_found', async () => {
      pushResolve([])
      await expect(
        recordBannerClick('nonexistent')
      ).rejects.toThrow('轮播图不存在')
    })
  })
})
