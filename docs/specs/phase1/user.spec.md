# 用户模块规范

> **文件**: phase1/user.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

用户模块管理众爱联盟平台的所有用户信息，包括：
- 用户信息查询与更新
- 实名认证（姓名+身份证号）
- 用户角色管理（志愿者/领队/管理员）
- 用户状态管理（正常/冻结）
- 个人公益信誉档案展示

### 1.2 业务价值

- 建立完整的用户档案体系
- 确保用户身份真实性（实名认证）
- 区分不同权限等级的用户
- 展示个人公益贡献和信誉

### 1.3 依赖关系

- 依赖: 认证模块(auth)、积分模块(points)
- 被依赖: 活动模块、签到模块、捐助模块等

### 1.4 用户角色体系

```
┌─────────────────────────────────────────────────────────────┐
│                      用户角色体系                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │  volunteer  │    │    leader   │    │    admin    │   │
│  │   志愿者     │───▶│    领队     │───▶│   管理员    │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                  │                  │            │
│         │                  │                  │            │
│   · 报名活动          · 创建活动         · 所有权限       │
│   · 签到              · 审核签到         · 用户管理       │
│   · 捐助              · 发放积分         · 系统配置       │
│   · 发帖              · 管理活动         · 数据统计       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 数据模型

### 2.1 用户表 users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) UNIQUE NOT NULL,          -- 微信OpenID
  union_id VARCHAR(64) UNIQUE,                  -- 微信UnionID
  phone VARCHAR(20) UNIQUE,                      -- 手机号
  nickname VARCHAR(50),                         -- 微信昵称
  avatar_url VARCHAR(500),                       -- 头像URL
  username VARCHAR(50) UNIQUE,                   -- 用户名（管理员登录用）
  password_hash VARCHAR(255),                   -- 密码哈希（管理员）
  real_name VARCHAR(50),                        -- 真实姓名
  id_card_no VARCHAR(18),                       -- 身份证号（加密存储）
  real_name_verified BOOLEAN DEFAULT false,      -- 实名认证状态
  member_no VARCHAR(20) UNIQUE,                  -- 会员编号（如 ZA-00001）
  role VARCHAR(20) DEFAULT 'volunteer',         -- 角色：volunteer/leader/admin
  status VARCHAR(20) DEFAULT 'active',          -- 状态：active/frozen
  honor_level INT DEFAULT 0,                    -- 荣誉等级（0-4）
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

### 2.2 TypeScript类型

```typescript
// 用户基础信息
interface User {
  id: string
  phone: string | null           // 脱敏显示：138****1234
  nickname: string | null
  avatarUrl: string | null
  memberNo: string | null        // 会员编号
  role: UserRole
  status: UserStatus
  realNameVerified: boolean
  honorLevel: number
  createdAt: string
}

// 用户详情（本人查看）
interface UserDetail extends User {
  realName: string | null        // 实名认证姓名
  idCardNo: string | null        // 身份证号（脱敏）
  openid: string | null
  unionId: string | null
  updatedAt: string
}

// 用户角色
type UserRole = 'volunteer' | 'leader' | 'admin'

// 用户状态
type UserStatus = 'active' | 'frozen'

// 荣誉等级
type HonorLevel = 0 | 1 | 2 | 3 | 4

// 荣誉等级配置
interface HonorLevelConfig {
  level: HonorLevel
  name: string
  icon: string
  minPoints: number
  description: string
}

// 更新用户请求
interface UpdateUserRequest {
  nickname?: string
  avatarUrl?: string
}

// 实名认证请求
interface RealNameVerifyRequest {
  realName: string
  idCardNo: string
}

// 用户列表查询参数
interface UserListQuery {
  page?: number
  pageSize?: number
  role?: UserRole
  status?: UserStatus
  keyword?: string
  realNameVerified?: boolean
}

// 管理员更新用户请求
interface AdminUpdateUserRequest {
  role?: UserRole
  status?: UserStatus
  honorLevel?: HonorLevel
}
```

---

## 3. API接口

### 3.1 获取当前用户信息

**接口**: `GET /api/users/me`  
**描述**: 获取当前登录用户的详细信息  
**权限**: 登录用户  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "138****1234",
    "nickname": "志愿者小王",
    "avatarUrl": "https://...",
    "memberNo": "ZA-00001",
    "role": "volunteer",
    "status": "active",
    "realNameVerified": true,
    "realName": "王小明",
    "idCardNo": "310***********1234",
    "honorLevel": 2,
    "createdAt": "2026-05-26T10:00:00Z",
    "updatedAt": "2026-05-26T10:00:00Z"
  }
}
```

### 3.2 更新当前用户信息

**接口**: `PATCH /api/users/me`  
**描述**: 更新当前用户信息（昵称、头像）  
**权限**: 登录用户  
**状态**: [TODO]

**请求体**:
```json
{
  "nickname": "新昵称",
  "avatarUrl": "https://new-avatar.jpg"
}
```

### 3.3 实名认证

**接口**: `POST /api/users/me/realname`  
**描述**: 提交实名认证信息  
**权限**: 登录用户  
**状态**: [TODO]

**请求体**:
```json
{
  "realName": "王小明",
  "idCardNo": "310101199001011234"
}
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "实名认证成功",
  "data": {
    "realNameVerified": true,
    "realName": "王小明",
    "idCardNo": "310***********1234"
  }
}
```

**错误响应**:
- 400: 身份证号格式错误
- 409: 该身份证号已被其他用户认证

### 3.4 获取用户列表（管理员）

**接口**: `GET /api/admin/users`  
**描述**: 获取用户列表（分页、筛选）  
**权限**: 管理员  
**状态**: [TODO]

**查询参数**:
```
?page=1&pageSize=20&role=volunteer&status=active&keyword=小王&realNameVerified=true
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "uuid",
        "phone": "138****1234",
        "nickname": "志愿者小王",
        "avatarUrl": "https://...",
        "memberNo": "ZA-00001",
        "role": "volunteer",
        "status": "active",
        "realNameVerified": true,
        "honorLevel": 2,
        "createdAt": "2026-05-26T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
}
```

### 3.5 获取用户详情（管理员）

**接口**: `GET /api/admin/users/:id`  
**描述**: 获取指定用户的详细信息  
**权限**: 管理员  
**状态**: [TODO]

### 3.6 更新用户信息（管理员）

**接口**: `PATCH /api/admin/users/:id`  
**描述**: 管理员更新用户信息（角色、状态、荣誉等级）  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "role": "leader",
  "status": "active",
  "honorLevel": 3
}
```

### 3.7 冻结/解冻用户（管理员）

**接口**: `POST /api/admin/users/:id/freeze`  
**描述**: 冻结用户账号  
**权限**: 管理员  
**状态**: [TODO]

**接口**: `POST /api/admin/users/:id/unfreeze`  
**描述**: 解冻用户账号  
**权限**: 管理员  
**状态**: [TODO]

### 3.8 获取荣誉等级配置

**接口**: `GET /api/users/honor-levels`  
**描述**: 获取荣誉等级配置列表  
**权限**: 公开  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "level": 0, "name": "新手上路", "icon": "🌱", "minPoints": 0, "description": "刚开始公益之旅" },
    { "level": 1, "name": "铜牌志愿者", "icon": "🥉", "minPoints": 10, "description": "累计获得10积分" },
    { "level": 2, "name": "银牌志愿者", "icon": "🥈", "minPoints": 50, "description": "累计获得50积分" },
    { "level": 3, "name": "金牌志愿者", "icon": "🥇", "minPoints": 100, "description": "累计获得100积分" },
    { "level": 4, "name": "钻石志愿者", "icon": "💎", "minPoints": 200, "description": "累计获得200积分" }
  ]
}
```

---

## 4. 业务逻辑

### 4.1 会员编号生成规则

```typescript
async function generateMemberNo(): Promise<string> {
  // 格式: ZA-XXXXX（5位数字，从00001开始）
  const count = await db.select({ count: count() }).from(users)
  const nextNo = count + 1
  return `ZA-${nextNo.toString().padStart(5, '0')}`
}
```

### 4.2 实名认证流程

```
1. 用户提交真实姓名和身份证号
2. 后端验证身份证号格式（18位，校验位正确）
3. 检查身份证号是否已被其他用户认证
4. 加密存储身份证号（AES-256-GCM）
5. 标记 real_name_verified = true
6. 发送实名认证成功通知
```

### 4.3 身份证号加密存储

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ENCRYPTION_KEY = process.env.ID_CARD_ENCRYPTION_KEY // 32字节
const IV_LENGTH = 16

function encryptIdCard(idCard: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(idCard, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

function decryptIdCard(encrypted: string): string {
  const [ivHex, authTagHex, encryptedData] = encrypted.split(':')
  const decipher = createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(ivHex, 'hex')
  )
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

function maskIdCard(idCard: string): string {
  // 310101199001011234 -> 310***********1234
  return idCard.slice(0, 3) + '*'.repeat(12) + idCard.slice(-4)
}
```

### 4.4 荣誉等级计算

```typescript
function calculateHonorLevel(totalPoints: number): HonorLevel {
  if (totalPoints >= 200) return 4  // 钻石
  if (totalPoints >= 100) return 3  // 金牌
  if (totalPoints >= 50) return 2   // 银牌
  if (totalPoints >= 10) return 1   // 铜牌
  return 0  // 新手上路
}

async function updateUserHonorLevel(userId: string): Promise<void> {
  const account = await getPointAccount(userId)
  const totalPoints = account.activityPointsTotal + account.donationPointsTotal
  const newLevel = calculateHonorLevel(totalPoints)
  
  await db.update(users)
    .set({ honorLevel: newLevel, updatedAt: new Date() })
    .where(eq(users.id, userId))
}
```

### 4.5 用户状态流转

```
┌─────────┐     ┌─────────┐
│ active  │────▶│ frozen  │
│  正常   │冻结  │  冻结   │
└─────────┘     └─────────┘
     ▲                │
     │解冻             │
     └────────────────┘
```

---

## 5. 安全要求

### 5.1 权限控制

| 接口 | 权限要求 |
|------|----------|
| GET /api/users/me | 登录用户（只能查看自己） |
| PATCH /api/users/me | 登录用户（只能修改自己） |
| POST /api/users/me/realname | 登录用户 |
| GET /api/admin/users | 管理员 |
| GET /api/admin/users/:id | 管理员 |
| PATCH /api/admin/users/:id | 管理员 |
| POST /api/admin/users/:id/freeze | 管理员 |
| POST /api/admin/users/:id/unfreeze | 管理员 |

### 5.2 数据保护

- 身份证号必须加密存储
- 手机号脱敏显示（138****1234）
- 普通用户只能查看自己的完整信息
- 管理员查看用户列表时敏感信息脱敏

### 5.3 实名认证规则

- 每个身份证号只能绑定一个账号
- 实名认证后不可修改（如需修改联系管理员）
- 实名认证信息仅用于身份验证，不对外展示

---

## 6. 前端实现要求

### 6.1 个人中心页

```
┌─────────────────────────────────┐
│  个人中心                        │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ [头像]                     │  │
│  │ 志愿者小王                 │  │
│  │ 会员编号: ZA-00001         │  │
│  │ 🥈 银牌志愿者              │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  📊 我的公益                     │
│  ┌──────────┬──────────┐       │
│  │ 活动积分  │ 捐助积分  │       │
│  │   50     │   30     │       │
│  └──────────┴──────────┘       │
├─────────────────────────────────┤
│  📋 功能列表                     │
│  ┌───────────────────────────┐  │
│  │ 实名认证      [已认证 >]  │  │
│  │ 我的活动      [>]         │  │
│  │ 我的捐助      [>]         │  │
│  │ 我的帖子      [>]         │  │
│  │ 设置          [>]         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.2 实名认证页

```
┌─────────────────────────────────┐
│  实名认证              [保存]    │
├─────────────────────────────────┤
│                                 │
│  真实姓名                       │
│  ┌───────────────────────────┐  │
│  │ 请输入真实姓名             │  │
│  └───────────────────────────┘  │
│                                 │
│  身份证号                       │
│  ┌───────────────────────────┐  │
│  │ 请输入18位身份证号         │  │
│  └───────────────────────────┘  │
│                                 │
│  ⚠️ 实名认证后不可修改          │
│                                 │
└─────────────────────────────────┘
```

---

## 7. TDD测试用例

> **TDD流程**: 先编写以下测试（🔴RED），再编写实现代码（🟢GREEN），最后重构（🔵REFACTOR）

### 7.1 单元测试（UserService）

**测试文件**: `server/services/__tests__/user.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserService } from '~/server/services/user.service'
import { mockDb } from '../helpers/mocks'
import { mockUser } from '../helpers/fixtures'

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new UserService()
  })

  describe('getUserById', () => {
    it('should_return_user_when_exists', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([mockUser])

      const result = await service.getUserById(mockUser.id)

      expect(result.id).toBe(mockUser.id)
      expect(result.phone).toBe('138****1234') // 脱敏
    })

    it('should_return_null_when_not_exists', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([])

      const result = await service.getUserById('not-exist')

      expect(result).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should_update_nickname_and_avatar', async () => {
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ ...mockUser, nickname: '新昵称' }])

      const result = await service.updateUser(mockUser.id, {
        nickname: '新昵称',
        avatarUrl: 'https://new.jpg',
      })

      expect(result.nickname).toBe('新昵称')
    })
  })

  describe('verifyRealName', () => {
    it('should_verify_successfully_when_valid_idcard', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([]) // 未认证过
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()

      const result = await service.verifyRealName(mockUser.id, {
        realName: '王小明',
        idCardNo: '310101199001011234',
      })

      expect(result.realNameVerified).toBe(true)
    })

    it('should_throw_error_when_idcard_already_used', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ id: 'other-user' }])

      await expect(
        service.verifyRealName(mockUser.id, {
          realName: '王小明',
          idCardNo: '310101199001011234',
        })
      ).rejects.toThrow('该身份证号已被认证')
    })

    it('should_throw_error_when_invalid_idcard_format', async () => {
      await expect(
        service.verifyRealName(mockUser.id, {
          realName: '王小明',
          idCardNo: '123456', // 无效格式
        })
      ).rejects.toThrow('身份证号格式错误')
    })
  })

  describe('calculateHonorLevel', () => {
    it('should_return_level_0_when_points_0', () => {
      expect(service.calculateHonorLevel(0)).toBe(0)
    })

    it('should_return_level_1_when_points_10', () => {
      expect(service.calculateHonorLevel(10)).toBe(1)
    })

    it('should_return_level_4_when_points_200', () => {
      expect(service.calculateHonorLevel(200)).toBe(4)
    })
  })

  describe('freezeUser', () => {
    it('should_freeze_active_user', async () => {
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ ...mockUser, status: 'frozen' }])

      const result = await service.freezeUser(mockUser.id)

      expect(result.status).toBe('frozen')
    })
  })
})
```

---

## 8. AI实现提示词

### 8.1 后端代码生成提示词

```markdown
## 任务
实现用户模块的后端API

## 技术栈
- Nuxt v4
- Drizzle ORM
- PostgreSQL
- TypeScript
- crypto (AES加密)

## 需要实现的API
1. GET /api/users/me - 获取当前用户信息
2. PATCH /api/users/me - 更新当前用户信息
3. POST /api/users/me/realname - 实名认证
4. GET /api/admin/users - 用户列表（管理员）
5. GET /api/admin/users/:id - 用户详情（管理员）
6. PATCH /api/admin/users/:id - 更新用户（管理员）
7. POST /api/admin/users/:id/freeze - 冻结用户
8. POST /api/admin/users/:id/unfreeze - 解冻用户
9. GET /api/users/honor-levels - 荣誉等级配置

## 实现要求
1. 身份证号使用AES-256-GCM加密存储
2. 手机号脱敏显示（138****1234）
3. 身份证号脱敏显示（310***********1234）
4. 会员编号自动生成（ZA-XXXXX格式）
5. 荣誉等级基于总积分自动计算
6. 实名认证检查身份证号唯一性
7. 使用zod验证请求参数

## 输出文件
- server/api/users/me.get.ts
- server/api/users/me.patch.ts
- server/api/users/me/realname.post.ts
- server/api/admin/users/index.get.ts
- server/api/admin/users/[id].get.ts
- server/api/admin/users/[id].patch.ts
- server/api/admin/users/[id]/freeze.post.ts
- server/api/admin/users/[id]/unfreeze.post.ts
- server/api/users/honor-levels.get.ts
- server/services/user.service.ts
- server/utils/encryption.ts (加密工具)
```

### 8.2 Review检查清单

- [ ] 身份证号加密存储
- [ ] 敏感信息脱敏显示
- [ ] 实名认证检查唯一性
- [ ] 荣誉等级计算正确
- [ ] 会员编号格式正确
- [ ] 权限控制完整
