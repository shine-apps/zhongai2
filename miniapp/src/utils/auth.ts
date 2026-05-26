const TOKEN_KEY = 'zhongai_token'

export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token: string): void {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function clearToken(): void {
  uni.removeStorageSync(TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function checkLogin(): boolean {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return false
  }
  return true
}
