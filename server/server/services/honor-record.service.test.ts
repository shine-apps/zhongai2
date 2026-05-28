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
  ResponseCode: { NOT_FOUND: 404, BAD_REQUEST: 400, FORBIDDEN: 403 },
}))

vi.mock('~/server/utils/pagination', () => ({
  parsePaginationQuery: vi.fn((q) => ({ page: 1, pageSize: 10, offset: 0 })),
}))

import {
  getMyRecords,
  getRecordById,
  reserveReceive,
  issueHonor,
  confirmReceive,
  getHonorStats,
} from '~/server/services/honor-record.service'

describe('getMyRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_return_user_records_when_no_filter', async () => {
    const mockRecords = [
      { id: 'r1', userId: 'user-1', itemName: '勋章', itemType: 'badge', status: 'pending' },
      { id: 'r2', userId: 'user-1', itemName: '证书', itemType: 'certificate', status: 'issued' },
    ]
    pushResolve([{ value: 2 }])
    pushResolve(mockRecords)

    const result = await getMyRecords('user-1', {})
    expect(result.list).toEqual(mockRecords)
    expect(result.total).toBe(2)
  })

  it('should_filter_by_itemType_when_itemType_provided', async () => {
    const mockRecords = [
      { id: 'r1', userId: 'user-1', itemName: '勋章', itemType: 'badge', status: 'pending' },
    ]
    pushResolve([{ value: 1 }])
    pushResolve(mockRecords)

    const result = await getMyRecords('user-1', { itemType: 'badge' })
    expect(result.list).toEqual(mockRecords)
    expect(result.total).toBe(1)
  })

  it('should_filter_by_status_when_status_provided', async () => {
    const mockRecords = [
      { id: 'r2', userId: 'user-1', itemName: '证书', itemType: 'certificate', status: 'issued' },
    ]
    pushResolve([{ value: 1 }])
    pushResolve(mockRecords)

    const result = await getMyRecords('user-1', { status: 'issued' })
    expect(result.list).toEqual(mockRecords)
    expect(result.total).toBe(1)
  })

  it('should_filter_by_both_itemType_and_status', async () => {
    const mockRecords = [
      { id: 'r1', userId: 'user-1', itemName: '礼物', itemType: 'gift', status: 'pending' },
    ]
    pushResolve([{ value: 1 }])
    pushResolve(mockRecords)

    const result = await getMyRecords('user-1', { itemType: 'gift', status: 'pending' })
    expect(result.list).toEqual(mockRecords)
  })
})

describe('getRecordById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_throw_404_when_record_not_found', async () => {
    pushResolve([])

    await expect(
      getRecordById('nonexistent', 'user-1', 'volunteer')
    ).rejects.toThrow('荣誉记录不存在')
  })

  it('should_throw_403_when_non_admin_accesses_other_user_record', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'other-user',
      itemName: '勋章',
      itemType: 'badge',
      status: 'pending',
    }
    pushResolve([mockRecord])

    await expect(
      getRecordById('r1', 'user-1', 'volunteer')
    ).rejects.toThrow('无权查看此荣誉记录')
  })

  it('should_return_record_when_owner_requests', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemName: '勋章',
      itemType: 'badge',
      status: 'pending',
    }
    pushResolve([mockRecord])

    const result = await getRecordById('r1', 'user-1', 'volunteer')
    expect(result.id).toBe('r1')
  })

  it('should_return_record_when_admin_requests_even_if_not_owner', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'other-user',
      itemName: '勋章',
      itemType: 'badge',
      status: 'pending',
    }
    pushResolve([mockRecord])

    const result = await getRecordById('r1', 'admin-1', 'admin')
    expect(result.id).toBe('r1')
  })
})

describe('reserveReceive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_throw_404_when_record_not_found', async () => {
    pushResolve([])

    await expect(
      reserveReceive('nonexistent', 'user-1', { receiveLocation: '地点A', receiveContact: '13800001111' })
    ).rejects.toThrow('荣誉记录不存在')
  })

  it('should_throw_403_when_user_is_not_record_owner', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'other-user',
      itemType: 'gift',
      status: 'pending',
    }
    pushResolve([mockRecord])

    await expect(
      reserveReceive('r1', 'user-1', { receiveLocation: '地点A', receiveContact: '13800001111' })
    ).rejects.toThrow('无权操作此荣誉记录')
  })

  it('should_throw_400_when_item_type_is_not_gift', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'badge',
      status: 'pending',
    }
    pushResolve([mockRecord])

    await expect(
      reserveReceive('r1', 'user-1', { receiveLocation: '地点A', receiveContact: '13800001111' })
    ).rejects.toThrow('只有实体物品可以预约领取')
  })

  it('should_throw_400_when_status_is_not_pending_or_issued', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'received',
    }
    pushResolve([mockRecord])

    await expect(
      reserveReceive('r1', 'user-1', { receiveLocation: '地点A', receiveContact: '13800001111' })
    ).rejects.toThrow('当前状态不可预约领取')
  })

  it('should_reserve_successfully_when_gift_and_pending', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'pending',
    }
    pushResolve([mockRecord])

    const mockUpdated = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'pending',
      receiveLocation: '地点A',
      receiveContact: '13800001111',
    }
    pushResolve([mockUpdated])

    const result = await reserveReceive('r1', 'user-1', { receiveLocation: '地点A', receiveContact: '13800001111' })
    expect(result.receiveLocation).toBe('地点A')
    expect(result.receiveContact).toBe('13800001111')
  })

  it('should_reserve_successfully_when_gift_and_issued', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'issued',
    }
    pushResolve([mockRecord])

    const mockUpdated = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'issued',
      receiveLocation: '地点B',
      receiveContact: '13900002222',
    }
    pushResolve([mockUpdated])

    const result = await reserveReceive('r1', 'user-1', { receiveLocation: '地点B', receiveContact: '13900002222' })
    expect(result.receiveLocation).toBe('地点B')
    expect(result.receiveContact).toBe('13900002222')
  })
})

describe('issueHonor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_throw_403_when_non_admin_issues_honor', async () => {
    await expect(
      issueHonor('r1', 'user-1', 'volunteer', {})
    ).rejects.toThrow('需要管理员权限')
  })

  it('should_throw_404_when_record_not_found', async () => {
    pushResolve([])

    await expect(
      issueHonor('nonexistent', 'admin-1', 'admin', {})
    ).rejects.toThrow('荣誉记录不存在')
  })

  it('should_throw_400_when_record_already_issued', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'badge',
      status: 'issued',
    }
    pushResolve([mockRecord])

    await expect(
      issueHonor('r1', 'admin-1', 'admin', {})
    ).rejects.toThrow('荣誉已发放，不可重复发放')
  })

  it('should_throw_400_when_record_already_received', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'badge',
      status: 'received',
    }
    pushResolve([mockRecord])

    await expect(
      issueHonor('r1', 'admin-1', 'admin', {})
    ).rejects.toThrow('荣誉已发放，不可重复发放')
  })

  it('should_issue_electronic_item_and_auto_set_status_to_received', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'badge',
      status: 'pending',
    }
    pushResolve([mockRecord])

    const mockUpdated = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'badge',
      status: 'received',
      issuedBy: 'admin-1',
      issueTime: expect.any(Date),
      receiveTime: expect.any(Date),
    }
    pushResolve([mockUpdated])

    const result = await issueHonor('r1', 'admin-1', 'admin', {})
    expect(result.status).toBe('received')
    expect(result.issuedBy).toBe('admin-1')
  })

  it('should_issue_physical_item_and_set_status_to_issued', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'pending',
    }
    pushResolve([mockRecord])

    const mockUpdated = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'issued',
      issuedBy: 'admin-1',
      issueTime: expect.any(Date),
    }
    pushResolve([mockUpdated])

    const result = await issueHonor('r1', 'admin-1', 'admin', { note: '已发出' })
    expect(result.status).toBe('issued')
    expect(result.issuedBy).toBe('admin-1')
  })

  it('should_issue_certificate_with_certificate_info', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'certificate',
      status: 'pending',
    }
    pushResolve([mockRecord])

    const mockUpdated = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'certificate',
      status: 'received',
      issuedBy: 'admin-1',
      certificateNo: 'CERT-001',
      certificateUrl: 'http://example.com/cert.pdf',
    }
    pushResolve([mockUpdated])

    const result = await issueHonor('r1', 'admin-1', 'admin', {
      certificateNo: 'CERT-001',
      certificateUrl: 'http://example.com/cert.pdf',
    })
    expect(result.status).toBe('received')
    expect(result.certificateNo).toBe('CERT-001')
    expect(result.certificateUrl).toBe('http://example.com/cert.pdf')
  })
})

describe('confirmReceive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_throw_403_when_non_admin_confirms', async () => {
    await expect(
      confirmReceive('r1', 'user-1', 'volunteer')
    ).rejects.toThrow('需要管理员权限')
  })

  it('should_throw_404_when_record_not_found', async () => {
    pushResolve([])

    await expect(
      confirmReceive('nonexistent', 'admin-1', 'admin')
    ).rejects.toThrow('荣誉记录不存在')
  })

  it('should_throw_400_when_status_is_not_issued', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'pending',
    }
    pushResolve([mockRecord])

    await expect(
      confirmReceive('r1', 'admin-1', 'admin')
    ).rejects.toThrow('只有已发放的荣誉才能确认领取')
  })

  it('should_throw_400_when_status_is_received', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'received',
    }
    pushResolve([mockRecord])

    await expect(
      confirmReceive('r1', 'admin-1', 'admin')
    ).rejects.toThrow('只有已发放的荣誉才能确认领取')
  })

  it('should_confirm_receive_successfully_when_status_is_issued', async () => {
    const mockRecord = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'issued',
    }
    pushResolve([mockRecord])

    const mockUpdated = {
      id: 'r1',
      userId: 'user-1',
      itemType: 'gift',
      status: 'received',
      receiveTime: expect.any(Date),
    }
    pushResolve([mockUpdated])

    const result = await confirmReceive('r1', 'admin-1', 'admin')
    expect(result.status).toBe('received')
  })
})

describe('getHonorStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_return_stats_grouped_by_status_and_type', async () => {
    const mockStatusStats = [
      { status: 'pending', count: 10 },
      { status: 'issued', count: 5 },
      { status: 'received', count: 20 },
    ]
    const mockTypeStats = [
      { itemType: 'badge', count: 15 },
      { itemType: 'certificate', count: 10 },
      { itemType: 'gift', count: 8 },
      { itemType: 'title', count: 2 },
    ]
    const mockTotal = [{ count: 35 }]

    pushResolve(mockTotal)
    pushResolve(mockStatusStats)
    pushResolve(mockTypeStats)

    const result = await getHonorStats()
    expect(result.total).toBe(35)
    expect(result.byStatus).toEqual({
      pending: 10,
      issued: 5,
      received: 20,
    })
    expect(result.byType).toEqual({
      badge: 15,
      certificate: 10,
      gift: 8,
      title: 2,
    })
  })

  it('should_handle_empty_stats', async () => {
    pushResolve([{ count: 0 }])
    pushResolve([])
    pushResolve([])

    const result = await getHonorStats()
    expect(result.total).toBe(0)
    expect(result.byStatus).toEqual({})
    expect(result.byType).toEqual({})
  })
})
