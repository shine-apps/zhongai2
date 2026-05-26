# 活动模块规范

> **文件**: phase1/activity.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

活动模块是众爱联盟平台的核心功能之一，用于管理公益活动的全生命周期：
- 活动创建、编辑、发布
- 活动报名与取消
- 活动签到（GPS定位/扫码）
- 活动相册管理
- 活动积分发放

### 1.2 业务价值

- 为志愿者提供丰富的公益活动选择
- 通过签到机制确保活动真实性
- 积分激励机制提升志愿者参与度
- 活动相册记录公益足迹

### 1.3 依赖关系

- 依赖: 用户模块(auth)、积分模块(points)
- 被依赖: 签到模块(checkin)、消息通知模块(notification)

### 1.4 业务流程图

```
┌─────────────────────────────────────────────────────────────┐
│                      活动生命周期                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  draft ──发布──> published ──开始──> ongoing ──结束──> completed │
│    │              │                │                │       │
│    │              │                │                │       │
│    │              ▼                ▼                ▼       │
│    │           [取消]          [签到]          [发放积分]   │
│    │                                                 │       │
│    └─────────────────────────────────────────────────┘       │
│                          [取消]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 数据模型

### 2.1 活动表 activities

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,                    -- 活动标题
  category VARCHAR(30) NOT NULL,                  -- 分类
  description TEXT,                                -- 活动详情（富文本HTML）
  cover_image VARCHAR(500),                        -- 封面图
  start_time TIMESTAMPTZ NOT NULL,                -- 开始时间
  end_time TIMESTAMPTZ NOT NULL,                  -- 结束时间
  location VARCHAR(200),                           -- 活动地点
  latitude DECIMAL(10,7),                          -- 纬度
  longitude DECIMAL(10,7),                         -- 经度
  checkin_radius INT DEFAULT 200,                 -- 签到有效半径（米）
  max_participants INT,                            -- 最大参与人数（null不限）
  current_participants INT DEFAULT 0,              -- 当前报名人数
  reward_points INT NOT NULL,                      -- 活动积分奖励
  status VARCHAR(20) DEFAULT 'draft',              -- 状态
  organizer_id UUID NOT NULL REFERENCES users(id),-- 发起人
  published_at TIMESTAMPTZ,                        -- 发布时间
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 活动分类枚举
-- elder_care: 慰问老人
-- education: 爱心助学
-- env: 环保活动
-- disaster: 抗灾救援
-- other: 其他
```

### 2.2 活动报名表 activity_registrations

```sql
CREATE TABLE activity_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',           -- pending/approved/rejected/cancelled
  remark VARCHAR(200),                             -- 报名备注
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(activity_id, user_id)                     -- 防止重复报名
);

-- 报名状态枚举
-- pending: 待审核（目前直接通过）
-- approved: 已通过
-- rejected: 已拒绝
-- cancelled: 已取消
```

### 2.3 TypeScript类型

```typescript
// 活动基本信息
interface Activity {
  id: string
  title: string
  category: ActivityCategory
  description: string | null
  coverImage: string | null
  startTime: string
  endTime: string
  location: string | null
  latitude: number | null
  longitude: number | null
  checkinRadius: number
  maxParticipants: number | null
  currentParticipants: number
  rewardPoints: number
  status: ActivityStatus
  organizerId: string
  organizerName?: string
  organizerAvatar?: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

// 活动分类
type ActivityCategory = 'elder_care' | 'education' | 'env' | 'disaster' | 'other'

// 活动状态
type ActivityStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'

// 报名信息
interface Registration {
  id: string
  activityId: string
  userId: string
  status: RegistrationStatus
  remark: string | null
  user?: {
    id: string
    nickname: string
    avatarUrl: string | null
    phone: string
    realName: string | null
  }
  createdAt: string
  updatedAt: string
}

type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

// 创建活动请求
interface CreateActivityRequest {
  title: string
  category: ActivityCategory
  description?: string
  coverImage?: string
  startTime: string
  endTime: string
  location?: string
  latitude?: number
  longitude?: number
  checkinRadius?: number
  maxParticipants?: number | null
  rewardPoints: number
}

// 更新活动请求
interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  status?: ActivityStatus
}

// 报名请求
interface RegisterActivityRequest {
  remark?: string
}

// 活动列表查询参数
interface ActivityListQuery {
  page?: number
  pageSize?: number
  category?: ActivityCategory
  status?: ActivityStatus
  keyword?: string
  startDate?: string
  endDate?: string
}
```

---

## 3. API接口

### 3.1 获取活动列表

**接口**: `GET /api/activities`  
**描述**: 获取活动列表（分页、筛选）  
**权限**: 公开  
**状态**: [TODO]

**查询参数**:
```
?page=1&pageSize=10&category=elder_care&status=published&keyword=养老院
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
        "title": "养老院慰问活动",
        "category": "elder_care",
        "description": "<p>...</p>",
        "coverImage": "https://...",
        "startTime": "2026-06-01T09:00:00Z",
        "endTime": "2026-06-01T12:00:00Z",
        "location": "阳光养老院",
        "latitude": 30.5728,
        "longitude": 104.0668,
        "checkinRadius": 200,
        "maxParticipants": 30,
        "currentParticipants": 15,
        "rewardPoints": 2,
        "status": "published",
        "organizerId": "uuid",
        "organizerName": "管理员",
        "publishedAt": "2026-05-20T10:00:00Z",
        "createdAt": "2026-05-20T09:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pageSize": 10,
      "totalPages": 5
    }
  }
}
```

### 3.2 获取活动详情

**接口**: `GET /api/activities/:id`  
**描述**: 获取活动详情  
**权限**: 公开  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "uuid",
    "title": "养老院慰问活动",
    "category": "elder_care",
    "description": "<p>活动内容...</p>",
    "coverImage": "https://...",
    "startTime": "2026-06-01T09:00:00Z",
    "endTime": "2026-06-01T12:00:00Z",
    "location": "阳光养老院",
    "latitude": 30.5728,
    "longitude": 104.0668,
    "checkinRadius": 200,
    "maxParticipants": 30,
    "currentParticipants": 15,
    "rewardPoints": 2,
    "status": "published",
    "organizerId": "uuid",
    "organizerName": "管理员",
    "organizerAvatar": "https://...",
    "publishedAt": "2026-05-20T10:00:00Z",
    "createdAt": "2026-05-20T09:00:00Z",
    "updatedAt": "2026-05-26T10:00:00Z"
  }
}
```

### 3.3 创建活动

**接口**: `POST /api/activities`  
**描述**: 创建新活动  
**权限**: 领队/管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "title": "养老院慰问活动",
  "category": "elder_care",
  "description": "<p>活动内容...</p>",
  "coverImage": "https://...",
  "startTime": "2026-06-01T09:00:00",
  "endTime": "2026-06-01T12:00:00",
  "location": "阳光养老院",
  "latitude": 30.5728,
  "longitude": 104.0668,
  "checkinRadius": 200,
  "maxParticipants": 30,
  "rewardPoints": 2
}
```

**成功响应** (201):
```json
{
  "code": 0,
  "message": "活动创建成功",
  "data": {
    "id": "uuid",
    "status": "draft"
  }
}
```

### 3.4 更新活动

**接口**: `PATCH /api/activities/:id`  
**描述**: 更新活动信息  
**权限**: 发起人/管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "title": "养老院慰问活动（更新）",
  "description": "<p>更新后的内容...</p>"
}
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "活动更新成功"
}
```

### 3.5 发布活动

**接口**: `POST /api/activities/:id/publish`  
**描述**: 发布活动（草稿 -> 已发布）  
**权限**: 发起人/管理员  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "活动发布成功"
}
```

### 3.6 取消活动

**接口**: `POST /api/activities/:id/cancel`  
**描述**: 取消活动  
**权限**: 发起人/管理员  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "活动已取消"
}
```

### 3.7 报名活动

**接口**: `POST /api/activities/:id/register`  
**描述**: 报名参加活动  
**权限**: 登录用户  
**状态**: [TODO]

**请求体**:
```json
{
  "remark": "想参加照顾老人"
}
```

**成功响应** (201):
```json
{
  "code": 0,
  "message": "报名成功",
  "data": {
    "registrationId": "uuid",
    "status": "pending"
  }
}
```

### 3.8 取消报名

**接口**: `DELETE /api/activities/:id/register`  
**描述**: 取消报名  
**权限**: 报名用户  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "已取消报名"
}
```

### 3.9 获取报名列表

**接口**: `GET /api/activities/:id/registrations`  
**描述**: 获取活动的报名列表  
**权限**: 发起人/管理员  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "uuid",
        "userId": "uuid",
        "status": "pending",
        "remark": "想参加",
        "user": {
          "id": "uuid",
          "nickname": "志愿者小王",
          "avatarUrl": "https://...",
          "phone": "138****1234"
        },
        "createdAt": "2026-05-26T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  }
}
```

### 3.10 获取我的报名

**接口**: `GET /api/activities/:id/registration/me`  
**描述**: 获取当前用户对该活动的报名状态  
**权限**: 登录用户  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "uuid",
    "status": "pending",
    "remark": "想参加",
    "createdAt": "2026-05-26T10:00:00Z"
  }
}
```

### 3.11 删除活动

**接口**: `DELETE /api/activities/:id`  
**描述**: 删除活动（仅草稿状态可删除）  
**权限**: 发起人/管理员  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "活动已删除"
}
```

---

## 4. 业务逻辑

### 4.1 活动状态流转

```
                    ┌──────────────────────────────────┐
                    │                                  │
                    ▼                                  │
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌────────────┐
│  draft  │───▶│ published │───▶│ ongoing  │───▶│ completed │
└─────────┘    └───────────┘    └───────────┘    └────────────┘
     │               │                │               │
     │               │                │               │
     │               ▼                ▼               │
     │            [取消]          [取消]               │
     │               │                │               │
     │               ▼                ▼               │
     │          ┌─────────────────────────┐          │
     │          │       cancelled         │          │
     │          └─────────────────────────┘          │
     │                                                    │
     ▼                                                    │
┌─────────┐                                               │
│ [删除]  │ ←── 仅draft状态可删除                         │
└─────────┘                                               │
```

### 4.2 报名规则

| 规则 | 说明 |
|------|------|
| 已登录用户 | 可报名任何已发布活动 |
| 未登录用户 | 先跳转登录，登录后报名 |
| 重复报名 | 同一用户不能重复报名同一活动 |
| 名额限制 | 报名人数达到上限时不可报名 |
| 时间限制 | 活动已开始或已取消后不可报名 |
| 自己创建 | 活动发起人不能报名自己创建的活动 |

```typescript
async function canRegister(activityId: string, userId: string): Promise<boolean> {
  const activity = await getActivityById(activityId)
  
  // 检查活动状态
  if (!['published', 'ongoing'].includes(activity.status)) {
    throw new Error('活动已结束或已取消')
  }
  
  // 检查发起人
  if (activity.organizerId === userId) {
    throw new Error('不能报名自己创建的活动')
  }
  
  // 检查名额
  if (activity.maxParticipants && activity.currentParticipants >= activity.maxParticipants) {
    throw new Error('报名人数已满')
  }
  
  // 检查是否已报名
  const existing = await getRegistration(activityId, userId)
  if (existing) {
    throw new Error('已报名该活动')
  }
  
  return true
}
```

### 4.3 积分发放规则（信誉累计）

| 触发时机 | 发放条件 | 积分类型 | 说明 |
|----------|----------|----------|------|
| 活动完成 | 领队确认签到 | 活动积分 | 积分累计到用户信誉档案，不可消耗 |

```typescript
async function grantActivityPoints(
  activityId: string,
  userId: string,
  checkinId: string
): Promise<void> {
  const activity = await getActivityById(activityId)
  
  // 发放积分（信誉累计）
  await pointsService.grantPoints(userId, {
    type: 'activity',
    amount: activity.rewardPoints,
    source: 'checkin',
    sourceId: checkinId,
    description: `参与「${activity.title}」活动签到`
  })
  
  // 标记积分已发放（防止重复发放）
  await markCheckinPointsGranted(checkinId, true)
  
  // 发送积分获得通知（展示性质）
  await notificationService.sendNotification(userId, {
    type: 'points',
    title: '获得活动积分',
    content: `恭喜！参与「${activity.title}」活动获得${activity.rewardPoints}个活动积分`,
    data: { activityId, points: activity.rewardPoints }
  })
}
```

### 4.4 活动分类配置

| 分类 | 编码 | 图标 | 说明 |
|------|------|------|------|
| 慰问老人 | elder_care | 🧓 | 养老院探访、陪伴服务 |
| 爱心助学 | education | 📚 | 支教、捐书、辅导 |
| 环保活动 | env | 🌿 | 清洁、植树、环保宣传 |
| 抗灾救援 | disaster | 🚑 | 灾害响应、物资运输 |
| 其他 | other | 🎯 | 其他类型公益活动 |

---

## 5. 安全要求

### 5.1 权限控制

| 接口 | 权限要求 |
|------|----------|
| GET /api/activities | 公开 |
| GET /api/activities/:id | 公开 |
| POST /api/activities | 领队/管理员 |
| PATCH /api/activities/:id | 发起人/管理员 |
| POST /api/activities/:id/publish | 发起人/管理员 |
| POST /api/activities/:id/cancel | 发起人/管理员 |
| POST /api/activities/:id/register | 登录用户 |
| DELETE /api/activities/:id/register | 报名用户本人 |
| GET /api/activities/:id/registrations | 发起人/管理员 |
| DELETE /api/activities/:id | 发起人/管理员 |

### 5.2 数据验证

```typescript
import { z } from 'zod'

export const createActivitySchema = z.object({
  title: z.string()
    .min(1, '活动标题不能为空')
    .max(100, '活动标题不能超过100字'),
  
  category: z.enum(['elder_care', 'education', 'env', 'disaster', 'other']),
  
  description: z.string().max(20000, '活动详情不能超过20000字').optional(),
  
  coverImage: z.string().url().optional().or(z.literal('')),
  
  startTime: z.string()
    .datetime()
    .refine(time => new Date(time) > new Date(), '活动开始时间必须晚于当前时间'),
  
  endTime: z.string()
    .datetime()
    .refine(time => new Date(time) > new Date(time), '活动结束时间必须晚于开始时间'),
  
  location: z.string().max(200).optional(),
  
  latitude: z.number().min(-90).max(90).optional(),
  
  longitude: z.number().min(-180).max(180).optional(),
  
  checkinRadius: z.number().int().min(10).max(1000).default(200),
  
  maxParticipants: z.number().int().positive().nullable().optional(),
  
  rewardPoints: z.number().int().min(0).max(100),
})
```

### 5.3 富文本安全

- 允许的HTML标签: p, h1-h6, img, ul, ol, li, a, strong, em, table, tr, td, th
- 图片必须使用https
- 禁止javascript:协议
- 图片最大宽度: 100%

---

## 6. 前端实现要求

### 6.1 活动列表页

```
┌─────────────────────────────────┐
│  🔍 搜索活动                     │
├─────────────────────────────────┤
│  分类 (横向滚动):               │
│  [全部] [慰问老人] [爱心助学]     │
│  [环保活动] [抗灾救援] [其他]    │
├─────────────────────────────────┤
│  活动列表:                      │
│  ┌───────────────────────────┐  │
│  │ [封面图]                  │  │
│  │ 🏷 养老院慰问              │  │
│  │ 📅 06/01 09:00-12:00     │  │
│  │ 📍 阳光养老院              │  │
│  │ 👥 已报名 15/30人          │  │
│  │ 💰 完成+2活动积分           │  │
│  │        [报名] / [已满]     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.2 活动详情页

```
┌─────────────────────────────────┐
│ ◀ 返回                         │
├─────────────────────────────────┤
│ [封面图]                        │
├─────────────────────────────────┤
│ 养老院慰问活动                   │
│ 📅 2026-06-01 09:00-12:00      │
│ 📍 阳光养老院 (距离1.2km)        │
│ 👥 已报名 15/30人               │
│ 💰 完成可获得2个活动积分          │
├─────────────────────────────────┤
│ [活动详情] [报名须知]            │
├─────────────────────────────────┤
│ <富文本内容>                    │
│                                │
│ <img src="..." />              │
│                                │
│ <p>活动内容...</p>              │
│                                │
├─────────────────────────────────┤
│ [取消]        [立即报名]         │
└─────────────────────────────────┘
```

### 6.3 组件使用

| 页面 | Wot Design 组件 |
|------|----------------|
| 搜索栏 | `wd-search` |
| 分类筛选 | `wd-tabs` / `wd-tab` |
| 活动卡片 | `wd-card` + 自定义 |
| 轮播图 | `wd-swiper` |
| 按钮 | `wd-button` |
| 加载状态 | `wd-skeleton` / `wd-loading` |
| 空状态 | `wd-empty` |
| 地图 | `wd-map` (腾讯/高德/百度) |

### 6.4 富文本渲染

```vue
<template>
  <view class="activity-detail">
    <rich-content :content="activity.description" />
  </view>
</template>

<script setup>
import RichContent from '@/components/RichContent.vue'

// 使用 mp-html 渲染富文本
// RichContent 组件内部使用 mp-html
</script>
```

---

## 7. TDD测试用例

> **TDD流程**: 先编写以下测试（🔴RED），再编写实现代码（🟢GREEN），最后重构（🔵REFACTOR）

### 7.1 单元测试（ActivityService）

**测试文件**: `server/services/__tests__/activity.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ActivityService } from '~/server/services/activity.service'
import { mockDb } from '../helpers/mocks'
import { mockActivity, mockUser } from '../helpers/fixtures'

describe('ActivityService', () => {
  let service: ActivityService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ActivityService()
  })

  describe('createActivity', () => {
    it('should_create_activity_with_draft_status_when_valid_data', async () => {
      // Arrange
      const data = {
        title: '测试活动',
        category: 'elder_care' as const,
        startTime: '2026-06-01T09:00:00Z',
        endTime: '2026-06-01T12:00:00Z',
        rewardPoints: 2,
      }
      mockDb.insert.mockReturnThis()
      mockDb.values.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ id: 'new-uuid', status: 'draft' }])

      // Act
      const result = await service.createActivity(data, mockUser.id)

      // Assert
      expect(result.status).toBe('draft')
      expect(mockDb.insert).toHaveBeenCalledWith(expect.objectContaining({
        title: '测试活动',
        organizerId: mockUser.id,
      }))
    })

    it('should_throw_error_when_title_is_empty', async () => {
      await expect(
        service.createActivity({ title: '', category: 'elder_care', startTime: '2026-06-01T09:00:00Z', endTime: '2026-06-01T12:00:00Z', rewardPoints: 2 }, mockUser.id)
      ).rejects.toThrow('活动标题不能为空')
    })

    it('should_throw_error_when_end_time_before_start_time', async () => {
      await expect(
        service.createActivity({
          title: '测试活动',
          category: 'elder_care',
          startTime: '2026-06-01T12:00:00Z',
          endTime: '2026-06-01T09:00:00Z',
          rewardPoints: 2,
        }, mockUser.id)
      ).rejects.toThrow('结束时间必须晚于开始时间')
    })
  })

  describe('publishActivity', () => {
    it('should_publish_activity_when_status_is_draft', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ ...mockActivity, status: 'draft' }])
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()

      // Act
      await service.publishActivity(mockActivity.id)

      // Assert
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        status: 'published',
        publishedAt: expect.any(Date),
      }))
    })

    it('should_throw_error_when_status_is_not_draft', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ ...mockActivity, status: 'published' }])

      // Act & Assert
      await expect(
        service.publishActivity(mockActivity.id)
      ).rejects.toThrow('只有草稿状态的活动可以发布')
    })
  })

  describe('registerActivity', () => {
    it('should_register_successfully_when_valid', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ ...mockActivity, status: 'published', currentParticipants: 5, maxParticipants: 30 }])
      mockDb.where.mockResolvedValueOnce([]) // 无重复报名
      mockDb.insert.mockReturnThis()
      mockDb.values.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ id: 'reg-uuid' }])
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()

      // Act
      const result = await service.registerActivity(mockActivity.id, mockUser.id)

      // Assert
      expect(result.registrationId).toBeDefined()
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        currentParticipants: 6,
      }))
    })

    it('should_throw_error_when_already_registered', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ ...mockActivity, status: 'published' }])
      mockDb.where.mockResolvedValueOnce([{ id: 'existing-reg' }]) // 已报名

      // Act & Assert
      await expect(
        service.registerActivity(mockActivity.id, mockUser.id)
      ).rejects.toThrow('已报名该活动')
    })

    it('should_throw_error_when_full', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ ...mockActivity, status: 'published', currentParticipants: 30, maxParticipants: 30 }])
      mockDb.where.mockResolvedValueOnce([])

      // Act & Assert
      await expect(
        service.registerActivity(mockActivity.id, mockUser.id)
      ).rejects.toThrow('报名人数已满')
    })
  })

  describe('cancelRegistration', () => {
    it('should_cancel_registration_and_decrement_count', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ id: 'reg-uuid', status: 'pending' }])
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()

      // Act
      await service.cancelRegistration(mockActivity.id, mockUser.id)

      // Assert
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        status: 'cancelled',
      }))
    })
  })

  describe('deleteActivity', () => {
    it('should_delete_when_status_is_draft', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ ...mockActivity, status: 'draft' }])
      mockDb.delete.mockReturnThis()

      // Act
      await service.deleteActivity(mockActivity.id)

      // Assert
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should_throw_error_when_status_is_not_draft', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ ...mockActivity, status: 'published' }])

      // Act & Assert
      await expect(
        service.deleteActivity(mockActivity.id)
      ).rejects.toThrow('只有草稿状态的活动可以删除')
    })
  })
})
```

### 7.2 积分发放测试

```typescript
describe('grantActivityPoints', () => {
  it('should_grant_points_when_checkin_confirmed', async () => {
    // Arrange
    mockDb.select.mockReturnThis()
    mockDb.where.mockResolvedValueOnce([{ ...mockActivity, rewardPoints: 2 }])
    mockDb.update.mockReturnThis()
    mockDb.set.mockReturnThis()

    // Act
    await service.grantActivityPoints(mockActivity.id, mockUser.id, 'checkin-uuid')

    // Assert
    expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
      activity_points_balance: expect.any(Number),
    }))
  })

  it('should_not_grant_points_when_already_granted', async () => {
    // Arrange
    mockDb.select.mockReturnThis()
    mockDb.where.mockResolvedValueOnce([{ pointsGranted: true }])

    // Act & Assert
    await expect(
      service.grantActivityPoints(mockActivity.id, mockUser.id, 'checkin-uuid')
    ).rejects.toThrow('积分已发放')
  })

  it('should_revert_points_when_checkin_cancelled', async () => {
    // Arrange
    mockDb.select.mockReturnThis()
    mockDb.where.mockResolvedValueOnce([{ pointsGranted: true, amount: 2 }])
    mockDb.update.mockReturnThis()
    mockDb.set.mockReturnThis()

    // Act
    await service.revertActivityPoints('checkin-uuid')

    // Assert
    expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
      activity_points_balance: expect.any(Number),
    }))
  })
})
```

---

## 8. AI实现提示词

### 8.1 后端API生成提示词

```markdown
## 任务
实现活动模块的后端API

## 技术栈
- Nuxt v4 (Nitro)
- Drizzle ORM
- PostgreSQL
- TypeScript
- zod

## Schema文件
- server/db/schema/activities.ts
- server/db/schema/activity-registrations.ts

## 需要实现的API
1. GET /api/activities - 活动列表（分页+筛选）
2. GET /api/activities/:id - 活动详情
3. POST /api/activities - 创建活动
4. PATCH /api/activities/:id - 更新活动
5. POST /api/activities/:id/publish - 发布活动
6. POST /api/activities/:id/cancel - 取消活动
7. POST /api/activities/:id/register - 报名活动
8. DELETE /api/activities/:id/register - 取消报名
9. GET /api/activities/:id/registrations - 报名列表
10. GET /api/activities/:id/registration/me - 我的报名状态
11. DELETE /api/activities/:id - 删除活动

## 实现要求
1. 活动列表支持分类、状态、关键词筛选
2. 报名时检查：活动状态、名额限制、重复报名
3. 报名成功后更新current_participants
4. 删除活动仅允许草稿状态
5. 发布、取消需要权限检查（发起人/管理员）
6. 活动详情需要关联发起人信息
7. 报名列表需要关联用户信息（昵称、头像、手机号脱敏）
8. 使用zod进行参数验证
9. 返回统一响应格式

## 权限要求
- 公开接口: 列表、详情
- 登录用户: 报名、取消报名、我的报名
- 领队/管理员: 创建、更新、发布、取消、删除、报名列表

## 输出文件
- server/api/activities/index.get.ts
- server/api/activities/index.post.ts
- server/api/activities/[id].get.ts
- server/api/activities/[id].patch.ts
- server/api/activities/[id].delete.ts
- server/api/activities/[id]/publish.post.ts
- server/api/activities/[id]/cancel.post.ts
- server/api/activities/[id]/register.post.ts
- server/api/activities/[id]/register.delete.ts
- server/api/activities/[id]/registrations.get.ts
- server/api/activities/[id]/registration/me.get.ts
- server/services/activity.service.ts
```

### 8.2 小程序页面生成提示词

```markdown
## 任务
实现小程序端活动相关页面

## 技术栈
- Uniapp
- Vue 3
- Wot Design Uni
- mp-html (富文本渲染)
- TypeScript

## 页面文件
1. src/pages/activity/list.vue - 活动列表页
2. src/pages/activity/detail.vue - 活动详情页
3. src/pages/activity/register.vue - 活动报名页
4. src/pages/activity/create.vue - 创建活动页（领队）
5. src/components/ActivityCard.vue - 活动卡片组件
6. src/components/RichContent.vue - 富文本渲染组件

## 列表页要求
1. 顶部搜索框
2. 分类Tab筛选
3. 活动卡片列表（下拉刷新、上拉加载）
4. 点击跳转到详情页
5. 未登录用户点击报名跳转登录

## 详情页要求
1. 封面图展示
2. 活动时间、地点
3. 报名人数显示
4. 积分奖励说明
5. 富文本活动详情（使用mp-html渲染）
6. 底部报名按钮

## 报名页要求
1. 活动信息展示
2. 报名须知
3. 备注输入框
4. 提交报名
5. 报名成功/失败提示

## API调用
- GET /api/activities - 活动列表
- GET /api/activities/:id - 活动详情
- POST /api/activities/:id/register - 报名
- GET /api/activities/:id/registration/me - 我的报名状态

## 组件使用
- wd-search
- wd-tabs
- wd-card
- wd-button
- wd-loading
- wd-empty
- mp-html (富文本)
```

### 8.3 Review检查清单

**后端Review**:
- [ ] 所有API都有zod验证
- [ ] 权限检查正确
- [ ] 报名逻辑完整（状态、名额、重复检查）
- [ ] currentParticipants更新正确
- [ ] 错误码正确（400、401、403、404、409、422）
- [ ] 分页逻辑正确

**前端Review**:
- [ ] 列表页有搜索、分类筛选
- [ ] 有下拉刷新、上拉加载
- [ ] 有加载状态、空状态
- [ ] 详情页富文本正常渲染
- [ ] 报名流程完整
- [ ] 错误处理有提示
