# 认证模块规范

> **文件**: phase1/auth.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

实现众爱联盟的微信小程序手机快捷登录系统，包括：
- 微信登录凭证换取
- 手机号自动绑定
- JWT Token生成与刷新
- 管理员账号密码登录

### 1.2 业务价值

- 提供无感登录体验，用户授权手机号即可完成注册和登录
- 确保用户身份真实性（手机号作为唯一标识）
- 支持Token自动刷新，保持登录状态
- 区分普通用户和管理员用户

### 1.3 依赖关系

- 依赖: 无（基础认证模块）
- 被依赖: 所有需要登录的模块

### 1.4 业务流程图

```
┌─────────────────────────────────────────────────────────────┐
│                   微信小程序登录流程                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│  │ wx.login │ ──── │ 后端API  │ ──── │ code2session │     │
│  └──────────┘      └────┬─────┘      └──────────┘        │
│         │               │                                 │
│         │               ▼                                 │
│         │        ┌──────────────┐                         │
│         │        │ 查询/创建用户 │                         │
│         │        └──────┬───────┘                         │
│         │               │                                 │
│         │               ▼                                 │
│         │        ┌──────────────┐                         │
│  ┌──────────┐   │ wx.getPhoneNumber │                     │
│  │ 用户授权  │ ──┴───────┬───────┘                         │
│  └──────────┘           │                                 │
│                         ▼                                 │
│                  ┌──────────────┐                         │
│                  │  绑定手机号   │                         │
│                  └──────┬───────┘                         │
│                         │                                 │
│                         ▼                                 │
│                  ┌──────────────┐                         │
│                  │ 生成JWT Token │                         │
│                  └──────┬───────┘                         │
│                         │                                 │
│                         ▼                                 │
│                  ┌──────────────┐                         │
│                  │ 返回用户信息  │                         │
│                  └──────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 数据模型

### 2.1 数据库表

```sql
-- 见详细设计文档 3.2.1 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) UNIQUE NOT NULL,          -- 微信OpenID
  union_id VARCHAR(64) UNIQUE,                  -- 微信UnionID
  phone VARCHAR(20) UNIQUE,                      -- 手机号
  nickname VARCHAR(50),                         -- 微信昵称
  avatar_url VARCHAR(500),                       -- 头像URL
  username VARCHAR(50) UNIQUE,                   -- 用户名（管理员登录用）
  password_hash VARCHAR(255),                   -- 密码哈希
  real_name VARCHAR(50),                        -- 真实姓名
  id_card_no VARCHAR(18),                       -- 身份证号（加密）
  real_name_verified BOOLEAN DEFAULT false,      -- 实名认证状态
  member_no VARCHAR(20) UNIQUE,                  -- 会员编号
  role VARCHAR(20) DEFAULT 'volunteer',         -- 角色
  status VARCHAR(20) DEFAULT 'active',          -- 状态
  honor_level INT DEFAULT 0,                    -- 荣誉等级
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 积分账户表（登录时自动创建）
CREATE TABLE point_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  activity_points_balance INT DEFAULT 0,
  activity_points_total INT DEFAULT 0,
  donation_points_balance INT DEFAULT 0,
  donation_points_total INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 TypeScript类型

```typescript
// 登录请求
interface LoginRequest {
  code: string                    // 微信wx.login获取的code
  phoneCode: string               // 微信getPhoneNumber获取的code
  nickname?: string               // 微信昵称（首次登录可选）
  avatarUrl?: string              // 头像URL（首次登录可选）
}

// 登录响应
interface LoginResponse {
  token: string                   // JWT access token
  refreshToken: string            // JWT refresh token
  expiresIn: number               // token有效期（秒）
  user: UserInfo                  // 用户信息
}

// 用户信息
interface UserInfo {
  id: string                      // 用户ID
  nickname: string | null         // 昵称
  avatarUrl: string | null        // 头像
  phone: string | null            // 手机号（脱敏）
  memberNo: string | null         // 会员编号
  role: UserRole                  // 角色
  realNameVerified: boolean       // 实名认证状态
  honorLevel: number             // 荣誉等级
  points: {
    activityBalance: number       // 活动积分余额
    activityTotal: number       // 活动积分累计
    donationBalance: number     // 捐助积分余额
    donationTotal: number        // 捐助积分累计
  }
  createdAt: string              // 注册时间
}

// 管理员登录请求
interface AdminLoginRequest {
  username: string
  password: string
}

// Token刷新请求
interface RefreshTokenRequest {
  refreshToken: string
}

// 用户角色枚举
type UserRole = 'volunteer' | 'leader' | 'admin'

// 用户状态枚举
type UserStatus = 'active' | 'frozen'
```

---

## 3. API接口

### 3.1 微信小程序登录

**接口**: `POST /api/auth/login`  
**描述**: 微信手机快捷登录  
**权限**: 公开  
**状态**: [TODO]

**请求体**:
```json
{
  "code": "微信wx.login的code",
  "phoneCode": "微信getPhoneNumber的code",
  "nickname": "用户昵称",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nickname": "志愿者小王",
      "avatarUrl": "https://...",
      "phone": "138****1234",
      "memberNo": "ZA-00001",
      "role": "volunteer",
      "realNameVerified": false,
      "honorLevel": 0,
      "points": {
        "activityBalance": 0,
        "activityTotal": 0,
        "donationBalance": 0,
        "donationTotal": 0
      },
      "createdAt": "2026-05-26T10:00:00Z"
    }
  }
}
```

**错误响应**:
| code | message | 说明 |
|------|---------|------|
| 400 | 参数错误 | code为空 |
| 401 | 微信登录失败 | wx.login失败 |
| 422 | 手机号获取失败 | getPhoneNumber失败 |

### 3.2 管理员登录

**接口**: `POST /api/auth/admin-login`  
**描述**: 管理员账号密码登录  
**权限**: 公开  
**状态**: [TODO]

**请求体**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nickname": "管理员",
      "role": "admin"
    }
  }
}
```

### 3.3 刷新Token

**接口**: `POST /api/auth/refresh`  
**描述**: 使用refreshToken获取新的accessToken  
**权限**: 登录用户  
**状态**: [TODO]

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**错误响应**:
| code | message | 说明 |
|------|---------|------|
| 401 | Token已过期 | refreshToken无效或过期 |

### 3.4 绑定/更换手机号

**接口**: `POST /api/auth/phone`  
**描述**: 已登录用户绑定或更换手机号  
**权限**: 登录用户  
**状态**: [TODO]

**请求体**:
```json
{
  "phoneCode": "微信getPhoneNumber的code"
}
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "手机号绑定成功",
  "data": {
    "phone": "138****5678"
  }
}
```

### 3.5 获取当前用户信息

**接口**: `GET /api/auth/me`  
**描述**: 获取当前登录用户信息  
**权限**: 登录用户  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nickname": "志愿者小王",
    "avatarUrl": "https://...",
    "phone": "138****1234",
    "memberNo": "ZA-00001",
    "role": "volunteer",
    "realNameVerified": true,
    "honorLevel": 3,
    "points": {
      "activityBalance": 25,
      "activityTotal": 30,
      "donationBalance": 10,
      "donationTotal": 15
    },
    "createdAt": "2026-05-26T10:00:00Z"
  }
}
```

### 3.6 退出登录

**接口**: `POST /api/auth/logout`  
**描述**: 退出当前登录  
**权限**: 登录用户  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "退出成功"
}
```

---

## 4. 业务逻辑

### 4.1 微信登录流程

```
1. 前端调用 wx.login() 获取 code
2. 前端展示手机号授权按钮，用户点击授权
3. 前端调用 wx.getPhoneNumber() 获取 phoneCode（encryptedData + iv）
4. 前端将 code 和 phoneCode 发送到后端
5. 后端调用微信接口，用 code 换取 openid
6. 后端调用微信接口，用 phoneCode 解密获取手机号
7. 后端根据 openid 查询用户：
   - 如果用户存在，更新昵称头像，返回token
   - 如果用户不存在，创建新用户，自动创建积分账户，生成会员编号，返回token
8. 前端存储token，跳转到首页
```

**微信API调用**:

```typescript
// 1. 换取openid
const wechatResponse = await fetch(
  `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
)
// 返回: { openid, session_key, unionid }

// 2. 解密手机号
const phoneResponse = await fetch('/api/auth/decrypt-phone', {
  method: 'POST',
  body: JSON.stringify({ phoneCode, sessionKey })
})
// 返回: { phoneNumber }
```

### 4.2 Token生成规则

```typescript
// 使用 jose 库生成 JWT
import { SignJWT, jwtVerify } from 'jose'

// Access Token Payload
interface TokenPayload {
  sub: string          // 用户ID
  role: UserRole       // 用户角色
  type: 'access'       // token类型
  iat: number          // 签发时间
  exp: number          // 过期时间
}

// Token有效期
const ACCESS_TOKEN_EXPIRY = '7d'   // 7天
const REFRESH_TOKEN_EXPIRY = '30d' // 30天
```

### 4.3 会员编号生成规则

```typescript
// 格式: ZA-XXXXX（5位数字，从00001开始）
async function generateMemberNo(): Promise<string> {
  const count = await db.select().from(users)
  const nextNo = count + 1
  return `ZA-${nextNo.toString().padStart(5, '0')}`
}
```

### 4.4 状态机

```
用户状态:
┌──────────┐
│  active  │  ←─── 正常状态，可登录
└─────┬────┘
      │
      │ 管理员冻结
      ▼
┌──────────┐
│  frozen  │  ←─── 冻结状态，禁止登录
└─────────┘
```

### 4.5 边界条件

| 场景 | 处理方式 |
|------|----------|
| 微信code已被使用 | 返回错误，要求重新wx.login |
| 手机号已绑定其他账号 | 返回错误，换手机号重试 |
| 用户被冻结 | 返回401，提示账号已冻结 |
| refreshToken被重复使用 | 销毁该用户所有token，强制重新登录 |
| 管理员尝试小程序登录 | 允许登录，但无法获取管理员权限 |

---

## 5. 安全要求

### 5.1 微信API安全

- AppID和AppSecret必须存储在环境变量中
- 微信接口调用需限制频率（每IP每秒5次）
- code只能使用一次，使用后立即失效
- sessionKey不能传输到前端

### 5.2 JWT安全

- JWT Secret必须256位以上，使用随机字符串
- accessToken有效期7天
- refreshToken有效期30天
- refreshToken只能使用一次（使用后生成新的）
- Token中不存储敏感信息

### 5.3 密码安全（管理员）

- 密码使用bcrypt加密存储（cost factor >= 12）
- 密码不能包含用户名
- 连续5次登录失败，锁定账号15分钟

### 5.4 防护措施

| 风险 | 防护措施 |
|------|----------|
| 重放攻击 | code一次性使用，记录已使用code |
| 暴力破解 | 登录限流，失败锁定 |
| Token伪造 | 使用强密钥，验证签名 |
| 敏感信息泄露 | 手机号脱敏显示，密码不返回 |

---

## 6. 前端实现要求

### 6.1 登录页UI

```
┌─────────────────────────────────┐
│                                 │
│       🏠 众爱联盟               │
│                                 │
│    让爱连接每一个人              │
│                                 │
│  ┌─────────────────────────┐   │
│  │   微信授权手机号登录       │   │
│  │                         │   │
│  │  <button>               │   │
│  │    微信手机快捷登录        │   │
│  │  </button>              │   │
│  └─────────────────────────┘   │
│                                 │
│    登录即表示同意《用户协议》     │
│                                 │
└─────────────────────────────────┘
```

### 6.2 登录流程小程序端实现

```typescript
// pages/login/index.vue
async function handleWechatLogin() {
  try {
    // 1. 获取微信登录凭证
    const loginRes = await wx.login()
    if (!loginRes.code) {
      throw new Error('微信登录失败')
    }
    
    // 2. 获取手机号授权
    const phoneRes = await new Promise((resolve, reject) => {
      wx.getPhoneNumber({
        success: resolve,
        fail: reject
      })
    })
    
    // 3. 调用登录API
    const res = await login({
      code: loginRes.code,
      phoneCode: phoneRes.code,
      nickname: phoneRes.nickname,
      avatarUrl: phoneRes.avatarUrl
    })
    
    // 4. 保存token
    storage.set('token', res.data.token)
    storage.set('refreshToken', res.data.refreshToken)
    storage.set('userInfo', res.data.user)
    
    // 5. 跳转到首页
    wx.switchTab({ url: '/pages/index/index' })
    
  } catch (error) {
    wx.showToast({ title: error.message, icon: 'none' })
  }
}
```

### 6.3 Token刷新拦截器

```typescript
// utils/request.ts
import { refreshToken } from './auth'

let isRefreshing = false
let refreshQueue: Function[] = []

async function request(options) {
  const token = storage.get('token')
  
  // 添加token到请求头
  if (token) {
    options.header = {
      ...options.header,
      Authorization: `Bearer ${token}`
    }
  }
  
  try {
    const res = await uni.request(options)
    return res.data
  } catch (error) {
    if (error.statusCode === 401 && !options._retry) {
      if (isRefreshing) {
        // 等待刷新完成
        return new Promise(resolve => {
          refreshQueue.push(() => resolve(request(options)))
        })
      }
      
      options._retry = true
      isRefreshing = true
      
      try {
        const newToken = await refreshToken()
        storage.set('token', newToken.data.token)
        
        // 重试队列中的请求
        refreshQueue.forEach(fn => fn())
        refreshQueue = []
        
        return request(options)
      } catch (refreshError) {
        // 刷新失败，跳转到登录页
        storage.clear()
        wx.redirectTo({ url: '/pages/login/index' })
        throw refreshError
      } finally {
        isRefreshing = false
      }
    }
    
    throw error
  }
}
```

---

## 7. TDD测试用例

> **TDD流程**: 先编写以下测试（🔴RED），再编写实现代码（🟢GREEN），最后重构（🔵REFACTOR）

### 7.1 单元测试（AuthService）

**测试文件**: `server/services/__tests__/auth.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '~/server/services/auth.service'
import { mockDb, mockWechatApi } from '../helpers/mocks'
import { mockUser } from '../helpers/fixtures'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AuthService()
  })

  describe('login', () => {
    it('should_create_user_and_return_token_when_new_user_login', async () => {
      // Arrange
      mockWechatApi.code2Session.mockResolvedValue({ openid: 'new-openid', session_key: 'key' })
      mockWechatApi.getPhoneNumber.mockResolvedValue({ phoneNumber: '13900139000' })
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValue([])

      // Act
      const result = await service.login({ code: 'wx-code', phoneCode: 'phone-code' })

      // Assert
      expect(result.token).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(result.user.phone).toBe('139****9000')
      expect(mockDb.insert).toHaveBeenCalledTimes(2) // users + point_accounts
    })

    it('should_return_token_when_existing_user_login', async () => {
      // Arrange
      mockWechatApi.code2Session.mockResolvedValue({ openid: 'existing-openid', session_key: 'key' })
      mockWechatApi.getPhoneNumber.mockResolvedValue({ phoneNumber: '13800138000' })
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValue([mockUser])

      // Act
      const result = await service.login({ code: 'wx-code', phoneCode: 'phone-code' })

      // Assert
      expect(result.token).toBeDefined()
      expect(result.user.id).toBe(mockUser.id)
    })

    it('should_throw_error_when_code_is_empty', async () => {
      await expect(
        service.login({ code: '', phoneCode: 'phone-code' })
      ).rejects.toThrow('code不能为空')
    })

    it('should_throw_error_when_phoneCode_is_empty', async () => {
      await expect(
        service.login({ code: 'wx-code', phoneCode: '' })
      ).rejects.toThrow('phoneCode不能为空')
    })

    it('should_throw_error_when_wechat_login_fails', async () => {
      // Arrange
      mockWechatApi.code2Session.mockResolvedValue({ errcode: 40029, errmsg: 'invalid code' })

      // Act & Assert
      await expect(
        service.login({ code: 'invalid-code', phoneCode: 'phone-code' })
      ).rejects.toThrow('微信登录失败')
    })
  })

  describe('adminLogin', () => {
    it('should_return_admin_token_when_credentials_valid', async () => {
      // Arrange
      const adminUser = { ...mockUser, role: 'admin', username: 'admin', passwordHash: 'hashed' }
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValue([adminUser])
      vi.mock('bcryptjs', () => ({ default: { compare: vi.fn().mockResolvedValue(true) } }))

      // Act
      const result = await service.adminLogin({ username: 'admin', password: 'password123' })

      // Assert
      expect(result.user.role).toBe('admin')
      expect(result.token).toBeDefined()
    })

    it('should_throw_error_when_password_incorrect', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValue([mockUser])
      vi.mock('bcryptjs', () => ({ default: { compare: vi.fn().mockResolvedValue(false) } }))

      // Act & Assert
      await expect(
        service.adminLogin({ username: 'admin', password: 'wrong' })
      ).rejects.toThrow('用户名或密码错误')
    })
  })

  describe('refreshToken', () => {
    it('should_return_new_token_when_refresh_token_valid', async () => {
      // Act
      const result = await service.refreshToken('valid-refresh-token')

      // Assert
      expect(result.token).toBeDefined()
      expect(result.refreshToken).toBeDefined()
    })

    it('should_throw_error_when_refresh_token_expired', async () => {
      await expect(
        service.refreshToken('expired-token')
      ).rejects.toThrow('Token已过期')
    })
  })
})
```

### 7.2 API集成测试

**测试文件**: `server/api/__tests__/auth.test.ts`

```typescript
import { describe, it, expect } from 'vitest'

describe('POST /api/auth/login', () => {
  it('should_return_200_with_token_when_login_successfully', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ code: 'valid-code', phoneCode: 'valid-phone-code' })
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.code).toBe(0)
    expect(body.data.token).toBeDefined()
  })

  it('should_return_400_when_code_missing', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneCode: 'valid-phone-code' })
    })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/refresh', () => {
  it('should_return_200_with_new_token_when_refresh_valid', async () => {
    const res = await app.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'valid-token' })
    })
    expect(res.status).toBe(200)
    expect(res.data.token).toBeDefined()
  })
})
```

### 7.3 E2E测试用例

| 用例 | 前置条件 | 步骤 | 预期结果 |
|------|----------|------|----------|
| 新用户登录 | 用户从未登录 | 1.打开小程序 2.点击微信登录 3.授权手机号 | 登录成功，有积分账户 |
| 老用户登录 | 用户已注册 | 1.打开小程序 2.点击微信登录 3.授权手机号 | 登录成功，信息更新 |
| Token自动刷新 | 用户已登录，token过期 | 1.发起API请求 2.收到401 3.自动刷新token | 请求自动重试成功 |
| 管理员登录 | 管理员账号已创建 | 1.打开管理后台 2.输入用户名密码 3.点击登录 | 登录成功，角色为admin |

---

## 8. AI实现提示词

### 8.1 后端代码生成提示词

```markdown
## 任务
实现认证模块的后端API

## 技术栈
- Nuxt v4 (Nitro)
- Drizzle ORM
- PostgreSQL
- TypeScript
- jose (JWT处理)
- zod (验证)

## 数据库
使用Drizzle ORM，Schema定义在 server/db/schema/users.ts

## 需要实现的API
1. POST /api/auth/login - 微信小程序登录
2. POST /api/auth/admin-login - 管理员登录
3. POST /api/auth/refresh - 刷新Token
4. POST /api/auth/phone - 绑定手机号
5. GET /api/auth/me - 获取当前用户
6. POST /api/auth/logout - 退出登录

## 实现要求
1. 使用jose库处理JWT（SignJWT, jwtVerify）
2. accessToken有效期7天，refreshToken有效期30天
3. refreshToken只能使用一次，使用后生成新的
4. 微信登录调用微信API换取openid和手机号
5. 新用户自动创建point_accounts
6. 新用户自动生成member_no（格式: ZA-XXXXX）
7. 所有API使用统一的错误响应格式
8. 使用zod进行请求参数验证
9. 敏感信息（密码等）不能返回给前端

## 微信API调用
```typescript
// 获取openid
const wxRes = await $fetch(
  `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
)

// 获取手机号（需要session_key解密）
// 需要后端调用微信解密接口
```

## 文件输出
- server/api/auth/login.post.ts
- server/api/auth/admin-login.post.ts
- server/api/auth/refresh.post.ts
- server/api/auth/phone.post.ts
- server/api/auth/me.get.ts
- server/api/auth/logout.post.ts
- server/services/auth.service.ts
- server/utils/jwt.ts
- server/middleware/auth.ts
```

### 8.2 小程序端代码生成提示词

```markdown
## 任务
实现小程序端登录页面

## 技术栈
- Uniapp
- Vue 3
- Wot Design Uni
- TypeScript

## 页面文件
src/pages/login/index.vue

## 实现要求
1. 页面样式美观，包含logo和欢迎语
2. 使用微信授权按钮获取手机号
3. 调用 wx.login() 和 wx.getPhoneNumber()
4. 登录成功后保存token到storage
5. 处理登录失败的情况（错误提示）
6. 包含用户协议链接
7. 使用Wot Design组件美化

## API调用
```typescript
// 登录
POST /api/auth/login
Body: { code, phoneCode, nickname?, avatarUrl? }
```

## Token处理
- 登录成功后保存 token, refreshToken, userInfo
- 在request拦截器中自动添加token
- 401时自动刷新token
- 刷新失败时跳转登录页

## 输出文件
- src/pages/login/index.vue
- src/utils/auth.ts (登录相关工具函数)
- src/utils/request.ts (请求封装，包含token刷新逻辑)
```

### 8.3 Review检查清单

**后端Review**:
- [ ] 所有API都有zod验证
- [ ] 错误处理使用统一的createError
- [ ] JWT secret使用环境变量
- [ ] 微信API调用有错误处理
- [ ] 新用户自动创建积分账户
- [ ] 会员编号格式正确
- [ ] refreshToken实现了一次性使用

**前端Review**:
- [ ] 登录按钮样式正确
- [ ] 错误处理有toast提示
- [ ] token存储到storage
- [ ] 实现了token刷新拦截器
- [ ] 刷新失败跳转登录页
- [ ] 页面适配不同屏幕
