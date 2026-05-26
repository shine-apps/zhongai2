const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

export function parsePaginationQuery(query: any): { page: number; pageSize: number; offset: number } {
  const page = Math.max(DEFAULT_PAGE, Number(query.page) || DEFAULT_PAGE)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize) || DEFAULT_PAGE_SIZE))
  const offset = (page - 1) * pageSize
  return { page, pageSize, offset }
}
