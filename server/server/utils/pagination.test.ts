import { describe, it, expect } from 'vitest'
import { parsePaginationQuery } from '~/server/utils/pagination'

describe('parsePaginationQuery', () => {
  it('should_return_defaults_when_empty_query', () => {
    const result = parsePaginationQuery({})
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
    expect(result.offset).toBe(0)
  })

  it('should_parse_page_and_pageSize_when_valid_input', () => {
    const result = parsePaginationQuery({ page: 3, pageSize: 20 })
    expect(result.page).toBe(3)
    expect(result.pageSize).toBe(20)
    expect(result.offset).toBe(40)
  })

  it('should_handle_string_inputs_when_provided', () => {
    const result = parsePaginationQuery({ page: '2', pageSize: '25' })
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(25)
    expect(result.offset).toBe(25)
  })

  it('should_enforce_minimum_page_when_page_is_zero', () => {
    const result = parsePaginationQuery({ page: 0 })
    expect(result.page).toBe(1)
  })

  it('should_enforce_minimum_page_when_negative_values', () => {
    const result = parsePaginationQuery({ page: -5 })
    expect(result.page).toBe(1)
  })

  it('should_default_pageSize_when_zero_provided', () => {
    const result = parsePaginationQuery({ pageSize: 0 })
    expect(result.pageSize).toBe(10)
  })

  it('should_enforce_maximum_pageSize_when_exceeds_50', () => {
    const result = parsePaginationQuery({ pageSize: 100 })
    expect(result.pageSize).toBe(50)
  })

  it('should_handle_NaN_values_when_non_numeric_input', () => {
    const result = parsePaginationQuery({ page: 'abc', pageSize: 'xyz' })
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it('should_calculate_offset_correctly_when_page_and_pageSize_provided', () => {
    const result = parsePaginationQuery({ page: 5, pageSize: 15 })
    expect(result.offset).toBe(60)
  })
})
