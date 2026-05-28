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
    groupBy: vi.fn().mockReturnThis(),
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
}))

import {
  checkUnlockStatus,
  getHonorItems,
  getHonorItemById,
  claimHonorItem,
  calculateProgress,
  generateCertificateNo,
} from '~/server/services/honor.service'

describe('HonorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  describe('checkUnlockStatus', () => {
    it('should_unlock_when_level_type_and_user_level_meets_requirement', async () => {
      const item = {
        id: 'item-1',
        unlockType: 'level',
        unlockValue: 2,
        unlockLevel: 2,
      }
      const userStats = { honorLevel: 2, activityCount: 0, donationAmount: 0 }

      const result = await checkUnlockStatus(item, userStats)
      expect(result.unlocked).toBe(true)
    })

    it('should_not_unlock_when_level_type_and_user_level_insufficient', async () => {
      const item = {
        id: 'item-1',
        unlockType: 'level',
        unlockValue: 3,
        unlockLevel: 3,
      }
      const userStats = { honorLevel: 1, activityCount: 0, donationAmount: 0 }

      const result = await checkUnlockStatus(item, userStats)
      expect(result.unlocked).toBe(false)
    })

    it('should_unlock_when_activity_count_type_and_count_meets_requirement', async () => {
      const item = {
        id: 'item-2',
        unlockType: 'activity_count',
        unlockValue: 5,
        unlockActivityCount: 5,
      }
      const userStats = { honorLevel: 0, activityCount: 5, donationAmount: 0 }

      const result = await checkUnlockStatus(item, userStats)
      expect(result.unlocked).toBe(true)
    })

    it('should_not_unlock_when_activity_count_type_and_count_insufficient', async () => {
      const item = {
        id: 'item-2',
        unlockType: 'activity_count',
        unlockValue: 5,
        unlockActivityCount: 5,
      }
      const userStats = { honorLevel: 0, activityCount: 3, donationAmount: 0 }

      const result = await checkUnlockStatus(item, userStats)
      expect(result.unlocked).toBe(false)
    })

    it('should_unlock_when_donation_amount_type_and_amount_meets_requirement', async () => {
      const item = {
        id: 'item-3',
        unlockType: 'donation_amount',
        unlockValue: 100,
        unlockDonationAmount: '100.00',
      }
      const userStats = { honorLevel: 0, activityCount: 0, donationAmount: 150 }

      const result = await checkUnlockStatus(item, userStats)
      expect(result.unlocked).toBe(true)
    })

    it('should_not_unlock_when_donation_amount_type_and_amount_insufficient', async () => {
      const item = {
        id: 'item-3',
        unlockType: 'donation_amount',
        unlockValue: 100,
        unlockDonationAmount: '100.00',
      }
      const userStats = { honorLevel: 0, activityCount: 0, donationAmount: 50 }

      const result = await checkUnlockStatus(item, userStats)
      expect(result.unlocked).toBe(false)
    })
  })

  describe('getHonorItems', () => {
    it('should_return_honor_items_with_unlock_status', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: '铜牌勋章',
          type: 'badge',
          unlockType: 'level',
          unlockValue: 1,
          unlockLevel: 1,
          unlockActivityCount: 0,
          unlockDonationAmount: '0',
          isActive: true,
          stock: -1,
        },
        {
          id: 'item-2',
          name: '活动达人',
          type: 'certificate',
          unlockType: 'activity_count',
          unlockValue: 10,
          unlockLevel: 0,
          unlockActivityCount: 10,
          unlockDonationAmount: '0',
          isActive: true,
          stock: 50,
        },
      ]
      const mockRecords = [
        { itemId: 'item-1', status: 'claimed' },
      ]

      pushResolve(mockItems)
      pushResolve(mockRecords)

      const result = await getHonorItems('user-1', { honorLevel: 1, activityCount: 5, donationAmount: 0 })
      expect(result).toHaveLength(2)
      expect(result[0].unlocked).toBe(true)
      expect(result[0].claimed).toBe(true)
      expect(result[1].unlocked).toBe(false)
      expect(result[1].claimed).toBe(false)
    })
  })

  describe('getHonorItemById', () => {
    it('should_return_honor_item_detail_with_unlock_status', async () => {
      const mockItem = [{
        id: 'item-1',
        name: '铜牌勋章',
        type: 'badge',
        description: '铜牌志愿者勋章',
        imageUrl: '/badge.png',
        unlockType: 'level',
        unlockValue: 1,
        unlockLevel: 1,
        unlockActivityCount: 0,
        unlockDonationAmount: '0',
        isActive: true,
        stock: -1,
      }]
      const mockRecords = []

      pushResolve(mockItem)
      pushResolve(mockRecords)

      const result = await getHonorItemById('item-1', 'user-1', { honorLevel: 1, activityCount: 0, donationAmount: 0 })
      expect(result.id).toBe('item-1')
      expect(result.unlocked).toBe(true)
      expect(result.claimed).toBe(false)
    })

    it('should_throw_404_when_item_not_found', async () => {
      pushResolve([])

      await expect(getHonorItemById('nonexistent', 'user-1', { honorLevel: 0, activityCount: 0, donationAmount: 0 }))
        .rejects.toThrow()
    })
  })

  describe('claimHonorItem', () => {
    it('should_claim_honor_item_successfully', async () => {
      const mockItem = [{
        id: 'item-1',
        name: '铜牌勋章',
        type: 'badge',
        unlockType: 'level',
        unlockValue: 1,
        unlockLevel: 1,
        unlockActivityCount: 0,
        unlockDonationAmount: '0',
        isActive: true,
        stock: -1,
      }]
      const mockExistingRecord = []
      const mockCountResult = [{ count: 0 }]
      const mockInsertedRecord = [{
        id: 'record-1',
        userId: 'user-1',
        itemId: 'item-1',
        itemName: '铜牌勋章',
        itemType: 'badge',
        status: 'issued',
        certificateNo: 'ZA-BD-2026-00001',
      }]

      pushResolve(mockItem)
      pushResolve(mockExistingRecord)
      pushResolve(mockCountResult)
      pushResolve(mockInsertedRecord)

      const result = await claimHonorItem('user-1', 'item-1', { honorLevel: 1, activityCount: 0, donationAmount: 0 })
      expect(result.certificateNo).toMatch(/^ZA-BD-2026-\d{5}$/)
      expect(result.status).toBe('issued')
    })

    it('should_throw_error_when_item_not_unlocked', async () => {
      const mockItem = [{
        id: 'item-1',
        name: '金牌勋章',
        type: 'badge',
        unlockType: 'level',
        unlockValue: 3,
        unlockLevel: 3,
        unlockActivityCount: 0,
        unlockDonationAmount: '0',
        isActive: true,
        stock: -1,
      }]

      pushResolve(mockItem)

      await expect(claimHonorItem('user-1', 'item-1', { honorLevel: 1, activityCount: 0, donationAmount: 0 }))
        .rejects.toThrow()
    })

    it('should_throw_error_when_already_claimed', async () => {
      const mockItem = [{
        id: 'item-1',
        name: '铜牌勋章',
        type: 'badge',
        unlockType: 'level',
        unlockValue: 1,
        unlockLevel: 1,
        unlockActivityCount: 0,
        unlockDonationAmount: '0',
        isActive: true,
        stock: -1,
      }]
      const mockExistingRecord = [{
        id: 'record-1',
        userId: 'user-1',
        itemId: 'item-1',
        status: 'issued',
      }]

      pushResolve(mockItem)
      pushResolve(mockExistingRecord)

      await expect(claimHonorItem('user-1', 'item-1', { honorLevel: 1, activityCount: 0, donationAmount: 0 }))
        .rejects.toThrow()
    })

    it('should_throw_error_when_out_of_stock', async () => {
      const mockItem = [{
        id: 'item-2',
        name: '限定礼物',
        type: 'gift',
        unlockType: 'level',
        unlockValue: 1,
        unlockLevel: 1,
        unlockActivityCount: 0,
        unlockDonationAmount: '0',
        isActive: true,
        stock: 0,
      }]
      const mockExistingRecord = []

      pushResolve(mockItem)
      pushResolve(mockExistingRecord)

      await expect(claimHonorItem('user-1', 'item-2', { honorLevel: 1, activityCount: 0, donationAmount: 0 }))
        .rejects.toThrow()
    })

    it('should_set_status_pending_for_physical_gift', async () => {
      const mockItem = [{
        id: 'item-3',
        name: '限定礼物',
        type: 'gift',
        unlockType: 'level',
        unlockValue: 1,
        unlockLevel: 1,
        unlockActivityCount: 0,
        unlockDonationAmount: '0',
        isActive: true,
        stock: 10,
      }]
      const mockExistingRecord = []
      const mockCountResult = [{ count: 0 }]
      const mockInsertedRecord = [{
        id: 'record-3',
        userId: 'user-1',
        itemId: 'item-3',
        itemName: '限定礼物',
        itemType: 'gift',
        status: 'pending',
        certificateNo: 'ZA-GT-2026-00001',
      }]

      pushResolve(mockItem)
      pushResolve(mockExistingRecord)
      pushResolve(mockCountResult)
      pushResolve(mockInsertedRecord)

      const result = await claimHonorItem('user-1', 'item-3', { honorLevel: 1, activityCount: 0, donationAmount: 0 })
      expect(result.status).toBe('pending')
      expect(result.certificateNo).toMatch(/^ZA-GT-2026-\d{5}$/)
    })

    it('should_generate_certificate_no_with_correct_format', async () => {
      const mockItem = [{
        id: 'item-4',
        name: '公益证书',
        type: 'certificate',
        unlockType: 'activity_count',
        unlockValue: 5,
        unlockLevel: 0,
        unlockActivityCount: 5,
        unlockDonationAmount: '0',
        isActive: true,
        stock: -1,
      }]
      const mockExistingRecord = []
      const mockCountResult = [{ count: 3 }]
      const mockInsertedRecord = [{
        id: 'record-4',
        userId: 'user-1',
        itemId: 'item-4',
        itemName: '公益证书',
        itemType: 'certificate',
        status: 'issued',
        certificateNo: 'ZA-CT-2026-00004',
      }]

      pushResolve(mockItem)
      pushResolve(mockExistingRecord)
      pushResolve(mockCountResult)
      pushResolve(mockInsertedRecord)

      const result = await claimHonorItem('user-1', 'item-4', { honorLevel: 0, activityCount: 5, donationAmount: 0 })
      expect(result.certificateNo).toMatch(/^ZA-CT-2026-\d{5}$/)
    })
  })

  describe('calculateProgress', () => {
    it('should_calculate_progress_for_level_type', () => {
      const result = calculateProgress('level', 2, 3)
      expect(result.current).toBe(2)
      expect(result.target).toBe(3)
      expect(result.percentage).toBeCloseTo(66.67, 1)
    })

    it('should_calculate_progress_for_activity_count_type', () => {
      const result = calculateProgress('activity_count', 3, 10)
      expect(result.current).toBe(3)
      expect(result.target).toBe(10)
      expect(result.percentage).toBe(30)
    })

    it('should_calculate_progress_for_donation_amount_type', () => {
      const result = calculateProgress('donation_amount', 50, 100)
      expect(result.current).toBe(50)
      expect(result.target).toBe(100)
      expect(result.percentage).toBe(50)
    })

    it('should_cap_percentage_at_100', () => {
      const result = calculateProgress('level', 5, 3)
      expect(result.percentage).toBe(100)
    })

    it('should_return_0_when_target_is_0', () => {
      const result = calculateProgress('level', 0, 0)
      expect(result.percentage).toBe(0)
    })
  })

  describe('generateCertificateNo', () => {
    it('should_generate_certificate_no_for_badge_type', () => {
      const count = 0
      const result = generateCertificateNo('badge', count)
      expect(result).toBe(`ZA-BD-${new Date().getFullYear()}-00001`)
    })

    it('should_generate_certificate_no_for_certificate_type', () => {
      const count = 5
      const result = generateCertificateNo('certificate', count)
      expect(result).toBe(`ZA-CT-${new Date().getFullYear()}-00006`)
    })

    it('should_generate_certificate_no_for_gift_type', () => {
      const count = 2
      const result = generateCertificateNo('gift', count)
      expect(result).toBe(`ZA-GT-${new Date().getFullYear()}-00003`)
    })

    it('should_generate_certificate_no_for_title_type', () => {
      const count = 0
      const result = generateCertificateNo('title', count)
      expect(result).toBe(`ZA-TL-${new Date().getFullYear()}-00001`)
    })
  })
})
