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
  ResponseCode: {
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    UNAUTHORIZED: 401,
    VALIDATION_ERROR: 422,
  },
}))

vi.mock('~/server/utils/pagination', () => ({
  parsePaginationQuery: vi.fn((q) => ({ page: 1, pageSize: 10, offset: 0 })),
}))

import {
  createFeedback,
  getMyFeedbacks,
  getFeedbackById,
  rateFeedback,
  processFeedback,
  resolveFeedback,
  closeFeedback,
  getFeedbackStats,
} from '~/server/services/feedback.service'

describe('createFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_create_feedback_with_default_priority_when_type_is_suggestion', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      type: 'suggestion',
      title: '建议标题',
      content: '建议内容',
      status: 'pending',
      priority: 'low',
    }
    pushResolve([mockFeedback])

    const result = await createFeedback('user-1', {
      type: 'suggestion',
      title: '建议标题',
      content: '建议内容',
    })

    expect(result).toEqual(mockFeedback)
    expect(mockDb.insert).toHaveBeenCalled()
    expect(mockDb.values).toHaveBeenCalled()
  })

  it('should_set_high_priority_when_type_is_complaint', async () => {
    const mockFeedback = {
      id: 'fb-2',
      userId: 'user-1',
      type: 'complaint',
      title: '投诉标题',
      content: '投诉内容',
      status: 'pending',
      priority: 'high',
    }
    pushResolve([mockFeedback])

    const result = await createFeedback('user-1', {
      type: 'complaint',
      title: '投诉标题',
      content: '投诉内容',
    })

    expect(result.priority).toBe('high')
  })

  it('should_set_normal_priority_when_type_is_bug', async () => {
    const mockFeedback = {
      id: 'fb-3',
      userId: 'user-1',
      type: 'bug',
      title: 'Bug标题',
      content: 'Bug内容',
      status: 'pending',
      priority: 'normal',
    }
    pushResolve([mockFeedback])

    const result = await createFeedback('user-1', {
      type: 'bug',
      title: 'Bug标题',
      content: 'Bug内容',
    })

    expect(result.priority).toBe('normal')
  })

  it('should_throw_error_when_title_is_empty', async () => {
    await expect(
      createFeedback('user-1', {
        type: 'suggestion',
        title: '',
        content: '内容',
      })
    ).rejects.toThrow()
  })

  it('should_throw_error_when_content_is_empty', async () => {
    await expect(
      createFeedback('user-1', {
        type: 'suggestion',
        title: '标题',
        content: '',
      })
    ).rejects.toThrow()
  })

  it('should_set_normal_priority_when_type_is_other', async () => {
    const mockFeedback = {
      id: 'fb-4',
      userId: 'user-1',
      type: 'other',
      title: '其他标题',
      content: '其他内容',
      status: 'pending',
      priority: 'normal',
    }
    pushResolve([mockFeedback])

    const result = await createFeedback('user-1', {
      type: 'other',
      title: '其他标题',
      content: '其他内容',
    })

    expect(result.priority).toBe('normal')
  })
})

describe('getMyFeedbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_return_feedback_list_for_current_user', async () => {
    const mockList = [
      { id: 'fb-1', userId: 'user-1', title: '反馈1', status: 'pending' },
      { id: 'fb-2', userId: 'user-1', title: '反馈2', status: 'resolved' },
    ]
    pushResolve([{ value: 2 }])
    pushResolve(mockList)

    const result = await getMyFeedbacks('user-1', {})

    expect(result.list).toEqual(mockList)
    expect(result.total).toBe(2)
  })

  it('should_filter_by_status_when_status_provided', async () => {
    const mockList = [
      { id: 'fb-1', userId: 'user-1', title: '反馈1', status: 'pending' },
    ]
    pushResolve([{ value: 1 }])
    pushResolve(mockList)

    const result = await getMyFeedbacks('user-1', { status: 'pending' })

    expect(result.list).toEqual(mockList)
    expect(result.total).toBe(1)
  })
})

describe('getFeedbackById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_throw_404_when_feedback_not_found', async () => {
    pushResolve([])

    await expect(
      getFeedbackById('nonexistent', 'user-1', 'volunteer')
    ).rejects.toThrow('反馈不存在')
  })

  it('should_throw_403_when_user_accesses_other_user_feedback', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'other-user',
      title: '反馈',
    }
    pushResolve([mockFeedback])

    await expect(
      getFeedbackById('fb-1', 'user-1', 'volunteer')
    ).rejects.toThrow('无权查看此反馈')
  })

  it('should_return_feedback_when_owner_requests', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      title: '反馈',
    }
    pushResolve([mockFeedback])

    const result = await getFeedbackById('fb-1', 'user-1', 'volunteer')
    expect(result.id).toBe('fb-1')
  })

  it('should_return_feedback_when_admin_requests_even_if_not_owner', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'other-user',
      title: '反馈',
    }
    pushResolve([mockFeedback])

    const result = await getFeedbackById('fb-1', 'admin-1', 'admin')
    expect(result.id).toBe('fb-1')
  })
})

describe('rateFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_rate_feedback_successfully_when_resolved_and_owner', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      status: 'resolved',
      userRating: null,
    }
    pushResolve([mockFeedback])
    pushResolve([{
      id: 'fb-1',
      userId: 'user-1',
      status: 'resolved',
      userRating: 5,
      userRatingNote: '非常满意',
    }])

    const result = await rateFeedback('fb-1', 'user-1', { rating: 5, ratingNote: '非常满意' })
    expect(result.userRating).toBe(5)
    expect(result.userRatingNote).toBe('非常满意')
  })

  it('should_throw_403_when_non_owner_tries_to_rate', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'other-user',
      status: 'resolved',
    }
    pushResolve([mockFeedback])

    await expect(
      rateFeedback('fb-1', 'user-1', { rating: 5 })
    ).rejects.toThrow('无权评分此反馈')
  })

  it('should_throw_400_when_feedback_not_resolved', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      status: 'pending',
    }
    pushResolve([mockFeedback])

    await expect(
      rateFeedback('fb-1', 'user-1', { rating: 5 })
    ).rejects.toThrow('只有已解决的反馈才能评分')
  })

  it('should_throw_400_when_rating_is_below_1', async () => {
    await expect(
      rateFeedback('fb-1', 'user-1', { rating: 0 })
    ).rejects.toThrow()
  })

  it('should_throw_400_when_rating_is_above_5', async () => {
    await expect(
      rateFeedback('fb-1', 'user-1', { rating: 6 })
    ).rejects.toThrow()
  })

  it('should_throw_404_when_feedback_not_found', async () => {
    pushResolve([])

    await expect(
      rateFeedback('nonexistent', 'user-1', { rating: 4 })
    ).rejects.toThrow('反馈不存在')
  })
})

describe('processFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_process_feedback_when_admin_and_pending', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      status: 'pending',
    }
    pushResolve([mockFeedback])
    pushResolve([{
      id: 'fb-1',
      status: 'processing',
      assignedTo: 'admin-1',
      response: '正在处理',
    }])

    const result = await processFeedback('fb-1', 'admin-1', { response: '正在处理' }, 'admin')
    expect(result.status).toBe('processing')
  })

  it('should_throw_403_when_non_admin_tries_to_process', async () => {
    await expect(
      processFeedback('fb-1', 'user-1', { response: '处理' }, 'volunteer')
    ).rejects.toThrow('需要管理员权限')
  })

  it('should_throw_404_when_feedback_not_found', async () => {
    pushResolve([])

    await expect(
      processFeedback('nonexistent', 'admin-1', { response: '处理' }, 'admin')
    ).rejects.toThrow('反馈不存在')
  })

  it('should_throw_400_when_feedback_not_pending', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      status: 'processing',
    }
    pushResolve([mockFeedback])

    await expect(
      processFeedback('fb-1', 'admin-1', { response: '处理' }, 'admin')
    ).rejects.toThrow('只有待处理的反馈才能开始处理')
  })
})

describe('resolveFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_resolve_feedback_when_admin_and_processing', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      status: 'processing',
    }
    pushResolve([mockFeedback])
    pushResolve([{
      id: 'fb-1',
      status: 'resolved',
      response: '已解决',
    }])

    const result = await resolveFeedback('fb-1', 'admin-1', { response: '已解决' }, 'admin')
    expect(result.status).toBe('resolved')
  })

  it('should_throw_404_when_feedback_not_found', async () => {
    pushResolve([])

    await expect(
      resolveFeedback('nonexistent', 'admin-1', { response: '解决' }, 'admin')
    ).rejects.toThrow('反馈不存在')
  })

  it('should_throw_400_when_feedback_not_processing', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      status: 'pending',
    }
    pushResolve([mockFeedback])

    await expect(
      resolveFeedback('fb-1', 'admin-1', { response: '解决' }, 'admin')
    ).rejects.toThrow('只有处理中的反馈才能标记为已解决')
  })

  it('should_throw_403_when_non_admin_tries_to_resolve', async () => {
    await expect(
      resolveFeedback('fb-1', 'user-1', { response: '解决' }, 'user')
    ).rejects.toThrow('需要管理员权限')
  })
})

describe('closeFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_close_feedback_when_admin', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      status: 'pending',
    }
    pushResolve([mockFeedback])
    pushResolve([{
      id: 'fb-1',
      status: 'closed',
      response: '已关闭',
    }])

    const result = await closeFeedback('fb-1', 'admin-1', { response: '已关闭' }, 'admin')
    expect(result.status).toBe('closed')
  })

  it('should_throw_404_when_feedback_not_found', async () => {
    pushResolve([])

    await expect(
      closeFeedback('nonexistent', 'admin-1', { response: '关闭' }, 'admin')
    ).rejects.toThrow('反馈不存在')
  })

  it('should_throw_400_when_feedback_already_closed', async () => {
    const mockFeedback = {
      id: 'fb-1',
      userId: 'user-1',
      status: 'closed',
    }
    pushResolve([mockFeedback])

    await expect(
      closeFeedback('fb-1', 'admin-1', { response: '关闭' }, 'admin')
    ).rejects.toThrow('反馈已关闭')
  })

  it('should_throw_403_when_non_admin_tries_to_close', async () => {
    await expect(
      closeFeedback('fb-1', 'user-1', { response: '关闭' }, 'user')
    ).rejects.toThrow('需要管理员权限')
  })
})

describe('getFeedbackStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveQueue.length = 0
  })

  it('should_return_stats_with_status_and_type_counts', async () => {
    pushResolve([
      { status: 'pending', count: 5 },
      { status: 'processing', count: 3 },
      { status: 'resolved', count: 10 },
      { status: 'closed', count: 2 },
    ])
    pushResolve([
      { type: 'suggestion', count: 8 },
      { type: 'bug', count: 4 },
      { type: 'complaint', count: 3 },
      { type: 'question', count: 3 },
      { type: 'other', count: 2 },
    ])
    pushResolve([{ avgRating: '4.5' }])

    const result = await getFeedbackStats()

    expect(result.byStatus).toEqual({
      pending: 5,
      processing: 3,
      resolved: 10,
      closed: 2,
    })
    expect(result.byType).toEqual({
      suggestion: 8,
      bug: 4,
      complaint: 3,
      question: 3,
      other: 2,
    })
    expect(result.avgRating).toBe(4.5)
  })

  it('should_return_zero_avg_rating_when_no_ratings', async () => {
    pushResolve([])
    pushResolve([])
    pushResolve([{ avgRating: null }])

    const result = await getFeedbackStats()

    expect(result.avgRating).toBe(0)
  })
})
