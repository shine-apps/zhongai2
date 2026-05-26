const TOKEN_KEY = 'admin_token'

export const useAdminAuth = () => {
  const getToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  }

  const setToken = (token: string): void => {
    if (import.meta.client) {
      localStorage.setItem(TOKEN_KEY, token)
    }
  }

  const clearToken = (): void => {
    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  const isAuthenticated = (): boolean => {
    return !!getToken()
  }

  const fetchWithAuth = async (url: string, options: Record<string, any> = {}) => {
    const token = getToken()
    const headers: Record<string, string> = {
      ...(options.headers || {}),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return $fetch(url, {
      ...options,
      headers,
    })
  }

  return {
    getToken,
    setToken,
    clearToken,
    isAuthenticated,
    fetchWithAuth,
  }
}
