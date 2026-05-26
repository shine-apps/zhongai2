import { describe, it, expect } from 'vitest'
import { parsePaginationQuery } from '~/server/utils/pagination'

describe('parsePaginationQuery', () => {
  it('should return defaults for empty query', () => {
    const result = parsePaginationQuery({})
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
    expect(result.offset).toBe(0)
  })

  it('should parse valid page and pageSize', () => {
    const result = parsePaginationQuery({ page: 3, pageSize: 20 })
    expect(result.page).toBe(3)
    expect(result.pageSize).toBe(20)
    expect(result.offset).toBe(40)
  })

  it('should handle string inputs', () => {
    const result = parsePaginationQuery({ page: '2', pageSize: '25' })
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(25)
    expect(result.offset).toBe(25)
  })

  it('should enforce minimum page of 1', () => {
    const result = parsePaginationQuery({ page: 0 })
    expect(result.page).toBe(1)
  })

  it('should enforce minimum page for negative values', () => {
    const result = parsePaginationQuery({ page: -5 })
    expect(result.page).toBe(1)
  })

  it('should default pageSize when 0 is provided', () => {
    const result = parsePaginationQuery({ pageSize: 0 })
    expect(result.pageSize).toBe(10)
  })

  it('should enforce maximum pageSize of 50', () => {
    const result = parsePaginationQuery({ pageSize: 100 })
    expect(result.pageSize).toBe(50)
  })

  it('should handle NaN values', () => {
    const result = parsePaginationQuery({ page: 'abc', pageSize: 'xyz' })
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it('should calculate offset correctly', () => {
    const result = parsePaginationQuery({ page: 5, pageSize: 15 })
    expect(result.offset).toBe(60)
  })
})
