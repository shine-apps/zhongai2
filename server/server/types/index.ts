export type UserRole = 'admin' | 'volunteer' | 'user'
export type UserStatus = 'active' | 'inactive' | 'banned'
export type ActivityCategory = 'education' | 'environment' | 'elderly' | 'medical' | 'poverty' | 'other'
export type ActivityStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type CheckinType = 'location' | 'photo' | 'manual'
export type DonationType = 'one_time' | 'monthly' | 'yearly'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type PointType = 'volunteer' | 'donation' | 'activity' | 'bonus'
export type PointChangeType = 'earn' | 'spend' | 'expire' | 'adjust'
export type PointSourceType = 'activity_checkin' | 'activity_complete' | 'donation' | 'market_purchase' | 'admin_adjust' | 'signup_bonus'
export type MarketPostType = 'goods' | 'service' | 'coupon'
export type NotificationType = 'system' | 'activity' | 'donation' | 'point' | 'registration'

export interface UserInfo {
  id: string
  username?: string
  openid?: string
  nickname: string
  avatar?: string
  phone?: string
  idCardEncrypted?: string
  role: UserRole
  status: UserStatus
  points: number
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  code: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userInfo: UserInfo
}

export interface AdminLoginRequest {
  username: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface Activity {
  id: string
  title: string
  description: string
  category: ActivityCategory
  status: ActivityStatus
  coverImage?: string
  images?: string[]
  location: string
  latitude?: number
  longitude?: number
  startTime: string
  endTime: string
  registrationDeadline: string
  maxParticipants: number
  currentParticipants: number
  pointsReward: number
  checkinType: CheckinType
  checkinRadius?: number
  creatorId: string
  reviewStatus: ReviewStatus
  createdAt: string
  updatedAt: string
}

export interface CreateActivityRequest {
  title: string
  description: string
  category: ActivityCategory
  coverImage?: string
  images?: string[]
  location: string
  latitude?: number
  longitude?: number
  startTime: string
  endTime: string
  registrationDeadline: string
  maxParticipants: number
  pointsReward: number
  checkinType: CheckinType
  checkinRadius?: number
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  status?: ActivityStatus
}

export interface Registration {
  id: string
  activityId: string
  userId: string
  status: RegistrationStatus
  checkedIn: boolean
  checkinTime?: string
  pointsAwarded: number
  createdAt: string
  updatedAt: string
}

export interface Donation {
  id: string
  userId: string
  type: DonationType
  amount: number
  description: string
  certificate?: string
  reviewStatus: ReviewStatus
  createdAt: string
}

export interface CreateDonationRequest {
  type: DonationType
  amount: number
  description: string
  certificate?: string
}

export interface PointAccount {
  userId: string
  balance: number
  totalEarned: number
  totalSpent: number
  updatedAt: string
}

export interface PointTransaction {
  id: string
  userId: string
  type: PointChangeType
  source: PointSourceType
  amount: number
  balanceAfter: number
  description: string
  relatedId?: string
  createdAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}
