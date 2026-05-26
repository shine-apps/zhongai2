import { reactive } from 'vue'
import { get } from '@/utils/request'
import { clearToken } from '@/utils/auth'

export interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone: string
  realName: string
  isRealNameVerified: boolean
  points: number
  level: number
}

const defaultUserInfo: UserInfo = {
  id: 0,
  nickname: '',
  avatar: '',
  phone: '',
  realName: '',
  isRealNameVerified: false,
  points: 0,
  level: 0,
}

const userInfo = reactive<UserInfo>({ ...defaultUserInfo })

export function useUserStore() {
  function setUserInfo(info: Partial<UserInfo>) {
    Object.assign(userInfo, info)
  }

  function clearUserInfo() {
    Object.assign(userInfo, defaultUserInfo)
    clearToken()
  }

  async function fetchUserInfo(): Promise<UserInfo> {
    const data = await get<UserInfo>('/api/users/me')
    setUserInfo(data)
    return data
  }

  return {
    userInfo,
    setUserInfo,
    clearUserInfo,
    fetchUserInfo,
  }
}
