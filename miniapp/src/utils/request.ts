import { getToken, clearToken } from './auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string || ''

interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: Record<string, unknown>
  header?: Record<string, string>
  showLoading?: boolean
  showError?: boolean
}

function showToast(title: string) {
  uni.showToast({
    title,
    icon: 'none',
    duration: 2000,
  })
}

function handle401() {
  clearToken()
  uni.reLaunch({ url: '/pages/login/index' })
}

function request<T = unknown>(config: RequestConfig): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = false,
    showError = true,
  } = config

  if (showLoading) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  const token = getToken()
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      success(res) {
        if (showLoading) {
          uni.hideLoading()
        }

        const statusCode = res.statusCode
        if (statusCode === 401) {
          handle401()
          reject(new Error('未授权，请重新登录'))
          return
        }

        if (statusCode >= 400) {
          // Try to extract the actual error message from the response body
          const body = res.data as ApiResponse<T> | undefined
          const msg = (body && typeof body === 'object' && 'message' in body && body.message)
            ? body.message
            : `请求失败 (${statusCode})`
          if (showError) showToast(msg)
          reject(new Error(msg))
          return
        }

        const body = res.data as ApiResponse<T>
        if (body.code !== 0) {
          if (body.code === 401) {
            handle401()
            reject(new Error('未授权，请重新登录'))
            return
          }
          if (showError) showToast(body.message || '请求失败')
          reject(new Error(body.message || '请求失败'))
          return
        }

        resolve(body.data)
      },
      fail(err) {
        if (showLoading) {
          uni.hideLoading()
        }
        const msg = '网络异常，请稍后重试'
        if (showError) showToast(msg)
        reject(new Error(msg))
      },
    })
  })
}

export function get<T = unknown>(url: string, data?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'GET', data, ...config })
}

export function post<T = unknown>(url: string, data?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'POST', data, ...config })
}

export function put<T = unknown>(url: string, data?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'PUT', data, ...config })
}

export function patch<T = unknown>(url: string, data?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'PATCH', data, ...config })
}

export function del<T = unknown>(url: string, data?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'DELETE', data, ...config })
}

export default request
