import { describe, it, expect } from 'vitest'
import { success, error, paginated, ResponseCode, createErrorResponse } from '~/server/utils/response'

describe('ResponseCode', () => {
  it('should_have_correct_code_values_when_checking_response_codes', () => {
    expect(ResponseCode.SUCCESS).toBe(0)
    expect(ResponseCode.BAD_REQUEST).toBe(400)
    expect(ResponseCode.UNAUTHORIZED).toBe(401)
    expect(ResponseCode.FORBIDDEN).toBe(403)
    expect(ResponseCode.NOT_FOUND).toBe(404)
    expect(ResponseCode.CONFLICT).toBe(409)
    expect(ResponseCode.VALIDATION_ERROR).toBe(422)
    expect(ResponseCode.INTERNAL_ERROR).toBe(500)
  })
})

describe('success', () => {
  it('should_return_success_response_when_data_provided', () => {
    const result = success({ id: 1, name: 'test' })
    expect(result.code).toBe(0)
    expect(result.message).toBe('success')
    expect(result.data).toEqual({ id: 1, name: 'test' })
  })

  it('should_return_success_response_when_custom_message_provided', () => {
    const result = success(null, '操作成功')
    expect(result.code).toBe(0)
    expect(result.message).toBe('操作成功')
  })

  it('should_return_success_response_when_string_data_provided', () => {
    const result = success('hello')
    expect(result.data).toBe('hello')
  })
})

describe('error', () => {
  it('should_return_error_response_when_default_code_used', () => {
    const result = error('Something went wrong')
    expect(result.code).toBe(500)
    expect(result.message).toBe('Something went wrong')
    expect(result.data).toBeNull()
  })

  it('should_return_error_response_when_custom_code_provided', () => {
    const result = error('Not found', 404)
    expect(result.code).toBe(404)
    expect(result.message).toBe('Not found')
  })

  it('should_return_error_response_when_validation_code_used', () => {
    const result = error('Validation failed', 422)
    expect(result.code).toBe(422)
  })
})

describe('paginated', () => {
  it('should_return_paginated_response_when_data_provided', () => {
    const list = [{ id: 1 }, { id: 2 }]
    const result = paginated(list, 100, 1, 10)
    expect(result.code).toBe(0)
    expect(result.data.list).toEqual(list)
    expect(result.data.pagination.total).toBe(100)
    expect(result.data.pagination.page).toBe(1)
    expect(result.data.pagination.pageSize).toBe(10)
    expect(result.data.pagination.totalPages).toBe(10)
  })

  it('should_calculate_total_pages_correctly_when_remainder_exists', () => {
    const result = paginated([], 25, 2, 10)
    expect(result.data.pagination.totalPages).toBe(3)
  })

  it('should_handle_empty_list_when_no_items', () => {
    const result = paginated([], 0, 1, 10)
    expect(result.data.pagination.totalPages).toBe(0)
  })

  it('should_handle_single_page_when_one_item', () => {
    const result = paginated([{ id: 1 }], 1, 1, 10)
    expect(result.data.pagination.totalPages).toBe(1)
  })

  it('should_use_custom_message_when_provided', () => {
    const result = paginated([], 0, 1, 10, '查询成功')
    expect(result.message).toBe('查询成功')
  })
})

describe('createErrorResponse', () => {
  it('should_throw_error_when_statusCode_and_message_provided', () => {
    expect(() => createErrorResponse(404, 'Not found')).toThrow()
  })

  it('should_throw_error_when_data_contains_code_and_message', () => {
    expect(() => createErrorResponse(400, 'Bad request', 400)).toThrow()
    try {
      createErrorResponse(400, 'Bad request', 400)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.data.code).toBe(400)
      expect(err.data.message).toBe('Bad request')
    }
  })

  it('should_use_statusCode_as_default_code_when_no_code_provided', () => {
    try {
      createErrorResponse(500, 'Internal error')
      expect.unreachable('Should have thrown')
    } catch (err: any) {
      expect(err.data.code).toBe(500)
    }
  })
})
