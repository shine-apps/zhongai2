export const ResponseCode = {
  SUCCESS: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500,
} as const

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export interface PaginatedData<T = any> {
  list: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface PaginatedResponse<T = any> extends ApiResponse<PaginatedData<T>> {}

export function success<T>(data: T, message = 'success'): ApiResponse<T> {
  return { code: ResponseCode.SUCCESS, message, data }
}

export function error(message: string, code: number = ResponseCode.INTERNAL_ERROR): ApiResponse<null> {
  return { code, message, data: null }
}

export function paginated<T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message = 'success'
): PaginatedResponse<T> {
  return {
    code: ResponseCode.SUCCESS,
    message,
    data: {
      list,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    },
  }
}

export function createErrorResponse(statusCode: number, message: string, code?: number) {
  throw createError({
    statusCode,
    statusMessage: message,
    data: { code: code || statusCode, message },
  })
}
