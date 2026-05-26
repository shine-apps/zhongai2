# 意见反馈模块规范

> **文件**: phase3/feedback.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

意见反馈模块为用户提供反馈渠道，支持：
- 用户提交意见反馈
- 反馈类型分类（功能建议、Bug反馈、投诉举报等）
- 管理员处理反馈
- 反馈状态跟踪
- 反馈统计分析

### 1.2 业务价值

- 收集用户意见改进产品
- 及时发现和处理问题
- 提升用户满意度
- 建立用户沟通渠道

### 1.3 依赖关系

- 依赖: 用户模块(user)、认证模块(auth)
- 被依赖: 无

### 1.4 反馈类型

| 类型 | 编码 | 说明 | 处理优先级 |
|------|------|------|------------|
| 功能建议 | suggestion | 产品功能改进建议 | P2 |
| Bug反馈 | bug | 功能异常或错误报告 | P1 |
| 投诉举报 | complaint | 违规内容或行为举报 | P0 |
| 使用咨询 | question | 使用问题咨询 | P2 |
| 其他反馈 | other | 其他类型反馈 | P3 |

---

## 2. 数据模型

### 2.1 反馈表 feedbacks

```sql
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,                  -- 反馈类型
  title VARCHAR(100) NOT NULL,                -- 标题
  content TEXT NOT NULL,                      -- 内容
  images VARCHAR(500)[],                      -- 图片URL列表
  contact_info VARCHAR(100),                  -- 联系方式（可选）
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending/processing/resolved/closed
  priority VARCHAR(10) DEFAULT 'normal',      -- 优先级: high/normal/low
  assigned_to UUID REFERENCES users(id),      -- 处理人
  response TEXT,                              -- 管理员回复
  response_time TIMESTAMPTZ,                  -- 回复时间
  resolved_time TIMESTAMPTZ,                  -- 解决时间
  user_rating INT,                            -- 用户评分(1-5)
  user_rating_note VARCHAR(200),              -- 用户评分备注
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_feedbacks_user ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_type ON feedbacks(type);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_priority ON feedbacks(priority);
CREATE INDEX idx_feedbacks_created ON feedbacks(created_at);
```

### 2.2 TypeScript类型

```typescript
// 反馈类型
type FeedbackType = 'suggestion' | 'bug' | 'complaint' | 'question' | 'other'

// 反馈状态
type FeedbackStatus = 'pending' | 'processing' | 'resolved' | 'closed'

// 优先级
type FeedbackPriority = 'high' | 'normal' | 'low'

// 反馈
interface Feedback {
  id: string
  userId: string
  type: FeedbackType
  title: string
  content: string
  images: string[]
  contactInfo: string | null
  status: FeedbackStatus
  priority: FeedbackPriority
  assignedTo: string | null
  response: string | null
  responseTime: string | null
  resolvedTime: string | null
  userRating: number | null
  userRatingNote: string | null
  createdAt: string
  updatedAt: string
}

// 反馈详情（含用户信息）
interface FeedbackDetail extends Feedback {
  user: {
    id: string
    nickname: string
    avatarUrl: string | null
    phone: string
  }
}

// 创建反馈请求
interface CreateFeedbackRequest {
  type: FeedbackType
  title: string
  content: string
  images?: string[]
  contactInfo?: string
}

// 处理反馈请求
interface ProcessFeedbackRequest {
  status: FeedbackStatus
  response?: string
  priority?: FeedbackPriority
  assignedTo?: string
}

// 用户评分请求
interface RateFeedbackRequest {
  rating: number  // 1-5
  note?: string
}

// 反馈统计
interface FeedbackStats {
  total: number
  pending: number
  processing: number
  resolved: number
  closed: number
  byType: Record<FeedbackType, number>
  avgRating: number
}
```

---

## 3. API接口

### 3.1 提交反馈

**接口**: `POST /api/feedbacks`  
**描述**: 用户提交意见反馈  
**权限**: 登录用户  
**状态**: [TODO]

**请求体**:
```json
{
  "type": "bug",
  "title": "签到功能异常",
  "content": "在活动详情页点击签到按钮后，页面显示空白...",
  "images": ["https://cdn.example.com/feedback/1.png"],
  "contactInfo": "13800138000"
}
```

**成功响应** (201):
```json
{
  "code": 0,
  "message": "提交成功",
  "data": {
    "id": "uuid",
    "type": "bug",
    "title": "签到功能异常",
    "status": "pending",
    "createdAt": "2026-05-26T10:00:00Z"
  }
}
```

### 3.2 获取我的反馈列表

**接口**: `GET /api/feedbacks/my`  
**描述**: 获取用户提交的反馈列表  
**权限**: 登录用户  
**状态**: [TODO]

**查询参数**:
```
?status=pending&page=1&pageSize=20
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
        "type": "bug",
        "title": "签到功能异常",
        "status": "resolved",
        "createdAt": "2026-05-26T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

### 3.3 获取反馈详情

**接口**: `GET /api/feedbacks/:id`  
**描述**: 获取反馈详情  
**权限**: 登录用户（本人或管理员）  
**状态**: [TODO]

### 3.4 用户评分反馈

**接口**: `POST /api/feedbacks/:id/rate`  
**描述**: 用户对已解决的反馈进行评分  
**权限**: 登录用户（本人）  
**状态**: [TODO]

**请求体**:
```json
{
  "rating": 5,
  "note": "问题已解决，感谢处理"
}
```

### 3.5 管理后台 - 获取反馈列表

**接口**: `GET /api/admin/feedbacks`  
**描述**: 获取所有反馈列表  
**权限**: 管理员  
**状态**: [TODO]

**查询参数**:
```
?type=bug&status=pending&priority=high&page=1&pageSize=20
```

### 3.6 管理后台 - 获取反馈详情

**接口**: `GET /api/admin/feedbacks/:id`  
**描述**: 获取反馈详情（含用户信息）  
**权限**: 管理员  
**状态**: [TODO]

### 3.7 管理后台 - 处理反馈

**接口**: `PATCH /api/admin/feedbacks/:id`  
**描述**: 处理反馈（回复、修改状态等）  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "status": "processing",
  "response": "感谢您的反馈，我们正在排查问题...",
  "priority": "high",
  "assignedTo": "admin-uuid"
}
```

### 3.8 管理后台 - 解决反馈

**接口**: `PATCH /api/admin/feedbacks/:id/resolve`  
**描述**: 标记反馈为已解决  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "response": "问题已修复，请更新APP版本后重试"
}
```

### 3.9 管理后台 - 关闭反馈

**接口**: `PATCH /api/admin/feedbacks/:id/close`  
**描述**: 关闭反馈  
**权限**: 管理员  
**状态**: [TODO]

### 3.10 管理后台 - 反馈统计

**接口**: `GET /api/admin/feedbacks/stats`  
**描述**: 获取反馈统计数据  
**权限**: 管理员  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "pending": 20,
    "processing": 10,
    "resolved": 60,
    "closed": 10,
    "byType": {
      "suggestion": 30,
      "bug": 40,
      "complaint": 10,
      "question": 15,
      "other": 5
    },
    "avgRating": 4.5
  }
}
```

---

## 4. 业务逻辑

### 4.1 状态流转

```
用户提交反馈
    │
    ▼
┌─────────────┐
│   pending   │  待处理
└──────┬──────┘
       │
       │ 管理员开始处理
       ▼
┌─────────────┐
│ processing  │  处理中
└──────┬──────┘
       │
       ├──────────────────────┐
       │                      │
       │ 问题已解决            │ 无法解决/无效反馈
       │                      │
       ▼                      ▼
┌─────────────┐        ┌─────────────┐
│  resolved   │        │   closed    │
│  (已解决)   │        │  (已关闭)   │
└──────┬──────┘        └─────────────┘
       │
       │ 用户评分
       ▼
┌─────────────┐
│ 用户评分完成 │
└─────────────┘
```

### 4.2 优先级判定

```typescript
// 根据反馈类型自动设置优先级
function determinePriority(type: FeedbackType): FeedbackPriority {
  switch (type) {
    case 'complaint':
      return 'high'    // 投诉举报高优先级
    case 'bug':
      return 'normal'  // Bug反馈普通优先级
    case 'suggestion':
      return 'low'     // 功能建议低优先级
    default:
      return 'normal'
  }
}
```

### 4.3 投诉举报特殊处理

```typescript
// 投诉举报需要特殊处理流程
async function handleComplaint(feedback: Feedback): Promise<void> {
  // 1. 立即通知管理员
  await notificationService.notifyAdmin({
    type: 'complaint',
    title: '收到新的投诉举报',
    content: feedback.title,
    priority: 'high'
  })
  
  // 2. 设置高优先级
  await db.update(feedbacks)
    .set({ priority: 'high' })
    .where(eq(feedbacks.id, feedback.id))
  
  // 3. 记录处理日志
  await createFeedbackLog(feedback.id, 'created', '投诉举报已提交，等待处理')
}
```

### 4.4 评分统计

```typescript
// 计算平均评分
async function calculateAvgRating(): Promise<number> {
  const ratings = await db.select({ rating: feedbacks.userRating })
    .from(feedbacks)
    .where(and(
      eq(feedbacks.status, 'resolved'),
      isNotNull(feedbacks.userRating)
    ))
  
  if (ratings.length === 0) return 0
  
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
  return sum / ratings.length
}
```

---

## 5. 安全要求

### 5.1 内容安全

| 检查项 | 实现方式 | 说明 |
|--------|----------|------|
| 敏感词过滤 | 本地词库检测 | 标题和内容敏感词检测 |
| 图片审核 | 微信图片审核 | 上传图片自动审核 |
| 投诉举报 | 特殊处理流程 | 高优先级+立即通知 |

### 5.2 权限控制

```typescript
// 反馈详情权限检查
function checkFeedbackPermission(userId: string, feedback: Feedback, isAdmin: boolean): boolean {
  // 用户本人可查看自己的反馈
  if (feedback.userId === userId) return true
  // 管理员可查看所有反馈
  if (isAdmin) return true
  return false
}
```

### 5.3 数据验证

| 字段 | 规则 | 错误提示 |
|------|------|----------|
| title | 必填, 5-100字符 | 标题长度需在5-100字符之间 |
| content | 必填, 20-2000字符 | 内容长度需在20-2000字符之间 |
| type | 必填, 有效枚举值 | 请选择正确的反馈类型 |
| images | 最多5张 | 最多上传5张图片 |
| rating | 1-5 | 评分需在1-5之间 |

---

## 6. 前端实现要求

### 6.1 反馈提交页面

**页面**: `/pages/feedback/create.vue`

```
┌─────────────────────────────────┐
│  意见反馈                        │
├─────────────────────────────────┤
│  反馈类型                        │
│  ┌───────────────────────────┐  │
│  │ [功能建议] [Bug反馈]       │  │
│  │ [投诉举报] [使用咨询]      │  │
│  │ [其他反馈]                │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  标题                            │
│  ┌───────────────────────────┐  │
│  │ 请输入标题                │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  详细描述                        │
│  ┌───────────────────────────┐  │
│  │ 请详细描述您的问题或建议   │  │
│  │                           │  │
│  │                           │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  图片上传（最多5张）             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─┐   │
│  │ img │ │ img │ │ img │ │+│   │
│  └─────┘ └─────┘ └─────┘ └─┘   │
├─────────────────────────────────┤
│  联系方式（可选）                │
│  ┌───────────────────────────┐  │
│  │ 手机号/微信号             │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  [提交反馈]                      │
└─────────────────────────────────┘
```

### 6.2 我的反馈列表页面

**页面**: `/pages/feedback/my.vue`

```
┌─────────────────────────────────┐
│  我的反馈                        │
├─────────────────────────────────┤
│  [全部] [待处理] [处理中] [已解决]│ ← Tab切换
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Bug反馈                    │  │
│  │ 签到功能异常               │  │
│  │ 状态: 已解决    05/26      │  │
│  │ [查看详情] [评分]          │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 功能建议                   │  │
│  │ 希望增加活动筛选功能       │  │
│  │ 状态: 处理中    05/25      │  │
│  │ [查看详情]                 │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.3 反馈详情页面

**页面**: `/pages/feedback/detail.vue`

```
┌─────────────────────────────────┐
│  反馈详情                        │
├─────────────────────────────────┤
│  类型: Bug反馈                   │
│  状态: 已解决                    │
│  提交时间: 2026-05-26 10:00      │
├─────────────────────────────────┤
│  标题: 签到功能异常              │
├─────────────────────────────────┤
│  详细描述:                       │
│  在活动详情页点击签到按钮后，    │
│  页面显示空白，无法完成签到...  │
├─────────────────────────────────┤
│  图片:                           │
│  ┌─────┐ ┌─────┐                │
│  │ img │ │ img │                │
│  └─────┘ └─────┘                │
├─────────────────────────────────┤
│  管理员回复:                     │
│  问题已修复，请更新APP版本后    │
│  重试。感谢您的反馈！           │
│  回复时间: 2026-05-26 12:00     │
├─────────────────────────────────┤
│  您的评分:                       │
│  ⭐⭐⭐⭐⭐  非常满意            │
│  [修改评分]                      │
└─────────────────────────────────┘
```

### 6.4 评分弹窗组件

**组件**: `components/FeedbackRatingDialog.vue`

```vue
<template>
  <wd-popup v-model="visible" position="bottom">
    <view class="rating-dialog">
      <view class="dialog-title">请为本次反馈处理评分</view>
      
      <view class="rating-stars">
        <view 
          v-for="i in 5" 
          :key="i" 
          class="star"
          :class="{ active: i <= rating }"
          @click="rating = i"
        >
          ⭐
        </view>
      </view>
      
      <wd-input 
        v-model="note"
        placeholder="请输入评分备注（可选）"
        type="textarea"
      />
      
      <view class="dialog-actions">
        <wd-button @click="visible = false">取消</wd-button>
        <wd-button type="primary" @click="submit">提交评分</wd-button>
      </view>
    </view>
  </wd-popup>
</template>
```

### 6.5 管理后台反馈管理

**组件**: `components/FeedbackManage.vue`

| 功能 | 组件 | 说明 |
|------|------|------|
| 反馈列表 | `el-table` | 所有反馈记录 |
| 类型筛选 | `el-select` | 反馈类型筛选 |
| 状态筛选 | `el-select` | 处理状态筛选 |
| 优先级筛选 | `el-select` | 优先级筛选 |
| 处理弹窗 | `el-dialog` | 回复和处理反馈 |
| 统计概览 | `el-statistic` | 反馈统计数据 |

---

## 7. TDD测试用例

### 7.1 单元测试

```typescript
// tests/unit/feedback.service.test.ts
describe('FeedbackService', () => {
  describe('createFeedback', () => {
    it('✅ GREEN: 应成功创建反馈', async () => {
      mockDb.insert.mockReturnThis()
      mockDb.values.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ id: 'feedback-uuid' }])
      
      const result = await service.createFeedback('user-uuid', {
        type: 'bug',
        title: '测试标题',
        content: '测试内容详细描述...'
      })
      
      expect(result.id).toBeDefined()
    })

    it('✅ RED: 投诉举报应设置高优先级', async () => {
      await service.createFeedback('user-uuid', {
        type: 'complaint',
        title: '投诉举报',
        content: '违规内容举报...'
      })
      
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'high'
        })
      )
    })
  })

  describe('processFeedback', () => {
    it('✅ RED: 非管理员不能处理反馈', async () => {
      await expect(
        service.processFeedback('feedback-uuid', {}, 'normal-user-uuid')
      ).rejects.toThrow('无权操作')
    })

    it('✅ GREEN: 管理员可处理反馈', async () => {
      mockDb.query.feedbacks.findFirst.mockResolvedValue({
        id: 'feedback-uuid',
        status: 'pending'
      })
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ status: 'processing' }])
      
      const result = await service.processFeedback('feedback-uuid', {
        status: 'processing',
        response: '正在处理...'
      }, 'admin-uuid')
      
      expect(result.status).toBe('processing')
    })
  })

  describe('rateFeedback', () => {
    it('✅ RED: 非本人不能评分', async () => {
      mockDb.query.feedbacks.findFirst.mockResolvedValue({
        userId: 'other-user-uuid'
      })
      
      await expect(
        service.rateFeedback('feedback-uuid', 5, 'my-user-uuid')
      ).rejects.toThrow('无权操作')
    })

    it('✅ GREEN: 本人可评分', async () => {
      mockDb.query.feedbacks.findFirst.mockResolvedValue({
        userId: 'user-uuid',
        status: 'resolved'
      })
      mockDb.update.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ userRating: 5 }])
      
      const result = await service.rateFeedback('feedback-uuid', 5, 'user-uuid')
      
      expect(result.userRating).toBe(5)
    })

    it('✅ RED: 未解决不能评分', async () => {
      mockDb.query.feedbacks.findFirst.mockResolvedValue({
        userId: 'user-uuid',
        status: 'processing'
      })
      
      await expect(
        service.rateFeedback('feedback-uuid', 5, 'user-uuid')
      ).rejects.toThrow('反馈未解决，暂不能评分')
    })
  })
})
```

### 7.2 集成测试

```typescript
// tests/integration/feedback.api.test.ts
describe('Feedback API', () => {
  describe('POST /api/feedbacks', () => {
    it('✅ GREEN: 登录用户可提交反馈', async () => {
      const res = await app.request('/api/feedbacks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: 'bug',
          title: '测试反馈',
          content: '详细描述内容...'
        })
      })
      
      expect(res.status).toBe(201)
    })

    it('✅ RED: 未登录不能提交', async () => {
      const res = await app.request('/api/feedbacks', {
        method: 'POST',
        body: JSON.stringify(validFeedback)
      })
      
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/feedbacks/my', () => {
    it('✅ GREEN: 返回用户的反馈列表', async () => {
      const res = await app.request('/api/feedbacks/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.data).toHaveProperty('list')
    })
  })

  describe('PATCH /api/admin/feedbacks/:id', () => {
    it('✅ RED: 非管理员不能处理', async () => {
      const res = await app.request('/api/admin/feedbacks/uuid', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ status: 'processing' })
      })
      
      expect(res.status).toBe(403)
    })
  })
})
```

---

## 8. AI实现提示词

### 8.1 后端代码生成提示词

```markdown
## 任务
实现意见反馈模块的后端API

## 技术栈
- Nuxt v4 (Nitro)
- Drizzle ORM
- PostgreSQL
- TypeScript

## 需要实现的API
1. POST /api/feedbacks - 提交反馈
2. GET /api/feedbacks/my - 获取我的反馈
3. GET /api/feedbacks/:id - 获取反馈详情
4. POST /api/feedbacks/:id/rate - 用户评分
5. GET /api/admin/feedbacks - 获取反馈列表
6. GET /api/admin/feedbacks/:id - 获取反馈详情
7. PATCH /api/admin/feedbacks/:id - 处理反馈
8. PATCH /api/admin/feedbacks/:id/resolve - 解决反馈
9. PATCH /api/admin/feedbacks/:id/close - 关闭反馈
10. GET /api/admin/feedbacks/stats - 反馈统计

## 状态流转
pending → processing → resolved → 用户评分
pending → processing → closed

## 优先级规则
- complaint: high
- bug: normal
- suggestion: low
- 其他: normal

## 输出文件
- server/api/feedbacks/index.post.ts
- server/api/feedbacks/my.get.ts
- server/api/feedbacks/[id].get.ts
- server/api/feedbacks/[id]/rate.post.ts
- server/api/admin/feedbacks/index.get.ts
- server/api/admin/feedbacks/[id].get.ts
- server/api/admin/feedbacks/[id].patch.ts
- server/api/admin/feedbacks/[id]/resolve.patch.ts
- server/api/admin/feedbacks/[id]/close.patch.ts
- server/api/admin/feedbacks/stats.get.ts
- server/services/feedback.service.ts
```

### 8.2 小程序端代码生成提示词

```markdown
## 任务
实现小程序端意见反馈页面

## 技术栈
- Uniapp
- Vue 3
- Wot Design Uni
- TypeScript

## 页面文件
1. src/pages/feedback/create.vue - 反馈提交页
2. src/pages/feedback/my.vue - 我的反馈页
3. src/pages/feedback/detail.vue - 反馈详情页
4. src/components/FeedbackRatingDialog.vue - 评分弹窗

## 反馈提交页要求
1. 反馈类型选择
2. 标题和内容输入
3. 图片上传（最多5张）
4. 联系方式（可选）
5. 提交按钮

## API调用
- POST /api/feedbacks
- GET /api/feedbacks/my
- GET /api/feedbacks/:id
- POST /api/feedbacks/:id/rate

## 输出文件
- src/pages/feedback/create.vue
- src/pages/feedback/my.vue
- src/pages/feedback/detail.vue
- src/components/FeedbackRatingDialog.vue
```

---

## 9. 相关文档

- [用户模块](../phase1/user.spec.md)
- [认证模块](../phase1/auth.spec.md)
- [消息通知](../shared/notification.spec.md)