# 爱心集市模块规范

> **文件**: phase2/market.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

爱心集市模块为志愿者提供一个资源互助平台，包括：
- 发布招聘/求职信息
- 发布闲置物品置换
- 帖子分类浏览与搜索
- 帖子收藏与联系
- 管理员审核机制

### 1.2 业务价值

- 促进志愿者之间的资源互助
- 提供招聘求职渠道
- 闲置物品循环利用
- 增强社区活跃度

### 1.3 依赖关系

- 依赖: 用户模块(user)、认证模块(auth)
- 被依赖: 消息通知模块(notification)

### 1.4 帖子类型

| 类型 | 编码 | 说明 |
|------|------|------|
| 招聘 | job | 企业/个人发布招聘信息 |
| 求职 | resume | 个人发布求职简历 |
| 闲置 | idle | 闲置物品置换或赠送 |

---

## 2. 数据模型

### 2.1 帖子表 market_posts

```sql
CREATE TABLE market_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,                    -- job/resume/idle
  title VARCHAR(100) NOT NULL,                  -- 标题
  content TEXT NOT NULL,                        -- 内容
  images VARCHAR(500)[],                        -- 图片数组
  contact_info VARCHAR(200),                    -- 联系方式
  location VARCHAR(100),                        -- 地点（求职/招聘用）
  price DECIMAL(10,2),                          -- 价格（闲置用，可为0表示赠送）
  status VARCHAR(20) DEFAULT 'pending',          -- pending/approved/rejected
  view_count INT DEFAULT 0,                     -- 浏览次数
  favorite_count INT DEFAULT 0,                 -- 收藏次数
  reviewed_by UUID REFERENCES users(id),        -- 审核人
  review_note VARCHAR(200),                     -- 审核备注
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_market_posts_type ON market_posts(type);
CREATE INDEX idx_market_posts_status ON market_posts(status);
CREATE INDEX idx_market_posts_user_id ON market_posts(user_id);
CREATE INDEX idx_market_posts_created_at ON market_posts(created_at DESC);
```

### 2.2 收藏表 market_favorites

```sql
CREATE TABLE market_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES market_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_market_favorites_user_id ON market_favorites(user_id);
```

### 2.3 TypeScript类型

```typescript
// 帖子类型
type MarketPostType = 'job' | 'resume' | 'idle'

// 帖子状态
type MarketPostStatus = 'pending' | 'approved' | 'rejected'

// 帖子
interface MarketPost {
  id: string
  userId: string
  type: MarketPostType
  title: string
  content: string
  images: string[]
  contactInfo: string | null
  location: string | null
  price: number | null
  status: MarketPostStatus
  viewCount: number
  favoriteCount: number
  user?: {
    id: string
    nickname: string
    avatarUrl: string | null
  }
  isFavorited?: boolean
  createdAt: string
  updatedAt: string
}

// 创建帖子请求
interface CreateMarketPostRequest {
  type: MarketPostType
  title: string
  content: string
  images?: string[]
  contactInfo?: string
  location?: string
  price?: number
}

// 帖子列表查询参数
interface MarketPostListQuery {
  page?: number
  pageSize?: number
  type?: MarketPostType
  keyword?: string
  status?: MarketPostStatus
}

// 审核请求
interface ReviewMarketPostRequest {
  status: 'approved' | 'rejected'
  reviewNote?: string
}
```

---

## 3. API接口

### 3.1 获取帖子列表

**接口**: `GET /api/market/posts`  
**描述**: 获取帖子列表（分页、筛选）  
**权限**: 公开（只返回approved状态的帖子）  
**状态**: [TODO]

**查询参数**:
```
?page=1&pageSize=20&type=job&keyword=招聘
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
        "type": "job",
        "title": "招聘志愿者助理",
        "content": "工作内容...",
        "images": ["https://..."],
        "contactInfo": "138****1234",
        "location": "上海市",
        "viewCount": 128,
        "favoriteCount": 5,
        "user": {
          "id": "uuid",
          "nickname": "张三",
          "avatarUrl": "https://..."
        },
        "isFavorited": false,
        "createdAt": "2026-05-26T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pageSize": 20,
      "totalPages": 3
    }
  }
}
```

### 3.2 获取帖子详情

**接口**: `GET /api/market/posts/:id`  
**描述**: 获取帖子详情（同时增加浏览次数）  
**权限**: 公开  
**状态**: [TODO]

### 3.3 创建帖子

**接口**: `POST /api/market/posts`  
**描述**: 创建新帖子（需要审核）  
**权限**: 登录用户  
**状态**: [TODO]

**请求体**:
```json
{
  "type": "job",
  "title": "招聘志愿者助理",
  "content": "详细描述...",
  "images": ["https://..."],
  "contactInfo": "13800138000",
  "location": "上海市"
}
```

### 3.4 删除帖子

**接口**: `DELETE /api/market/posts/:id`  
**描述**: 删除自己的帖子  
**权限**: 帖子作者  
**状态**: [TODO]

### 3.5 收藏/取消收藏

**接口**: `POST /api/market/posts/:id/favorite`  
**描述**: 收藏帖子  
**权限**: 登录用户  
**状态**: [TODO]

**接口**: `DELETE /api/market/posts/:id/favorite`  
**描述**: 取消收藏  
**权限**: 登录用户  
**状态**: [TODO]

### 3.6 获取我的帖子

**接口**: `GET /api/market/posts/my`  
**描述**: 获取当前用户发布的帖子  
**权限**: 登录用户  
**状态**: [TODO]

### 3.7 获取我的收藏

**接口**: `GET /api/market/favorites`  
**描述**: 获取当前用户收藏的帖子  
**权限**: 登录用户  
**状态**: [TODO]

### 3.8 管理员审核帖子

**接口**: `GET /api/admin/market/posts`  
**描述**: 获取待审核帖子列表  
**权限**: 管理员  
**状态**: [TODO]

**接口**: `PATCH /api/admin/market/posts/:id/review`  
**描述**: 审核帖子  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "status": "approved",
  "reviewNote": "审核通过"
}
```

---

## 4. 业务逻辑

### 4.1 帖子发布流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  用户创建    │───▶│  提交审核    │───▶│  管理员审核  │───▶│   发布上线   │
│   帖子      │    │  (pending)  │    │             │    │ (approved)  │
└─────────────┘    └─────────────┘    └──────┬──────┘    └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │   审核拒绝    │
                                       │  (rejected) │
                                       └─────────────┘
```

**流程说明**:
1. 用户填写帖子内容并提交
2. 帖子进入待审核状态(pending)
3. 管理员审核帖子内容
4. 审核通过后帖子对外可见
5. 审核拒绝后用户可修改重新提交

### 4.2 浏览计数机制

**防刷机制**:
```typescript
// 同一用户5分钟内多次访问只计1次
const VIEW_COOLDOWN = 5 * 60 * 1000 // 5分钟

// Redis缓存用户浏览记录
await redis.setex(`market:view:${postId}:${userId}`, 300, '1')
```

### 4.3 收藏机制

**幂等设计**:
- 同一用户重复收藏返回成功但不重复计数
- 使用数据库UNIQUE约束保证数据一致性
- 收藏/取消收藏使用事务保证计数准确

### 4.4 联系方式脱敏

**列表页脱敏**:
```typescript
// 手机号脱敏: 13800138000 -> 138****8000
function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 微信脱敏: wx_abc123 -> wx_****23
function maskWechat(wx: string): string {
  if (wx.length <= 4) return wx
  return wx.substring(0, 2) + '****' + wx.substring(wx.length - 2)
}
```

**详情页完整显示**: 登录用户查看详情页显示完整联系方式

---

## 5. 安全要求

### 5.1 内容安全

| 检查项 | 实现方式 | 说明 |
|--------|----------|------|
| 敏感词过滤 | 本地词库+云检测 | 标题和内容敏感词检测 |
| 图片审核 | 微信图片审核接口 | 自动检测违规图片 |
| 联系方式 | 格式校验 | 手机号/微信格式验证 |
| 防刷限制 | 频率控制 | 单用户每日发帖限制5条 |

### 5.2 权限控制

```typescript
// 帖子权限检查
function checkPostPermission(userId: string, post: MarketPost) {
  // 作者本人可删除
  if (post.userId === userId) return 'owner'
  // 管理员可操作
  if (isAdmin(userId)) return 'admin'
  return 'none'
}
```

### 5.3 数据验证规则

| 字段 | 规则 | 错误提示 |
|------|------|----------|
| title | 必填, 5-100字符 | 标题长度需在5-100字符之间 |
| content | 必填, 20-2000字符 | 内容长度需在20-2000字符之间 |
| images | 最多9张 | 最多上传9张图片 |
| contactInfo | 必填 | 请填写联系方式 |
| price | 闲置必填, ≥0 | 价格不能为负数 |

---

## 6. 前端实现

### 6.1 小程序端页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 集市首页 | /pages/market/index | 分类Tab+帖子列表 |
| 帖子详情 | /pages/market/detail | 帖子详情+联系方式 |
| 发布帖子 | /pages/market/create | 表单提交页面 |
| 我的帖子 | /pages/market/my-posts | 用户发布的帖子 |
| 我的收藏 | /pages/market/favorites | 用户收藏的帖子 |

### 6.2 组件设计

**MarketPostCard组件**:
```vue
<template>
  <view class="post-card" @click="goDetail">
    <view class="post-header">
      <wd-tag :type="typeColor">{{ typeText }}</wd-tag>
      <text class="time">{{ formatTime(post.createdAt) }}</text>
    </view>
    <view class="post-title">{{ post.title }}</view>
    <view class="post-content" v-html="post.content"></view>
    <wd-image-preview v-if="post.images.length" :urls="post.images" />
    <view class="post-footer">
      <view class="user">
        <wd-avatar :src="post.user.avatarUrl" />
        <text>{{ post.user.nickname }}</text>
      </view>
      <view class="stats">
        <text class="iconfont icon-view">{{ post.viewCount }}</text>
        <text class="iconfont icon-fav">{{ post.favoriteCount }}</text>
      </view>
    </view>
  </view>
</template>
```

### 6.3 管理后台页面

| 页面 | 组件 | 功能 |
|------|------|------|
| 帖子审核 | MarketPostReview.vue | 审核列表+审核操作 |
| 帖子管理 | MarketPostManage.vue | 全部帖子管理 |

**审核列表组件**:
```vue
<template>
  <div class="review-list">
    <el-table :data="posts">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="type" label="类型" />
      <el-table-column prop="user.nickname" label="发布者" />
      <el-table-column prop="createdAt" label="提交时间" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="showDetail(row)">查看</el-button>
          <el-button type="success" @click="approve(row)">通过</el-button>
          <el-button type="danger" @click="reject(row)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
```

---

## 7. TDD测试用例

### 7.1 单元测试

**帖子服务测试**:
```typescript
// tests/unit/market/post.service.test.ts
describe('MarketPostService', () => {
  describe('createPost', () => {
    it('✅ RED: 应拒绝标题少于5字符的帖子', async () => {
      const input = { title: '短', content: '内容'.repeat(20) }
      await expect(service.createPost(input)).rejects.toThrow('标题长度需在5-100字符之间')
    })

    it('✅ GREEN: 应成功创建帖子并返回pending状态', async () => {
      const input = { title: '招聘志愿者助理', content: '详细描述'.repeat(10), type: 'job' }
      const post = await service.createPost(input)
      expect(post.status).toBe('pending')
      expect(post.id).toBeDefined()
    })
  })

  describe('reviewPost', () => {
    it('✅ RED: 非管理员不能审核帖子', async () => {
      await expect(service.reviewPost(postId, 'approved', normalUserId))
        .rejects.toThrow('无权操作')
    })

    it('✅ GREEN: 管理员审核通过后帖子状态变为approved', async () => {
      await service.reviewPost(postId, 'approved', adminUserId)
      const post = await service.getPost(postId)
      expect(post.status).toBe('approved')
    })
  })

  describe('favoritePost', () => {
    it('✅ RED: 重复收藏不应增加收藏数', async () => {
      await service.favoritePost(postId, userId)
      await service.favoritePost(postId, userId)
      const post = await service.getPost(postId)
      expect(post.favoriteCount).toBe(1)
    })
  })
})
```

### 7.2 集成测试

```typescript
// tests/integration/market.api.test.ts
describe('Market API', () => {
  describe('POST /api/market/posts', () => {
    it('✅ RED-GREEN-REFACTOR: 完整发帖流程', async () => {
      // RED: 未登录不能发帖
      const res1 = await request(app).post('/api/market/posts').send(validPost)
      expect(res1.status).toBe(401)

      // GREEN: 登录后成功发帖
      const res2 = await request(app)
        .post('/api/market/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(validPost)
      expect(res2.status).toBe(201)
      expect(res2.body.data.status).toBe('pending')

      // REFACTOR: 验证数据库状态
      const post = await db.query.marketPosts.findFirst({ where: eq(id, res2.body.data.id) })
      expect(post).toBeDefined()
    })
  })
})
```

### 7.3 E2E测试

```typescript
// tests/e2e/market.spec.ts
test('用户发帖到审核完整流程', async ({ page }) => {
  // 用户发布帖子
  await page.goto('/pages/market/create')
  await page.fill('[name="title"]', '招聘志愿者助理')
  await page.fill('[name="content"]', '工作内容详细描述...')
  await page.click('button[type="submit"]')
  
  // 验证提交成功提示
  await expect(page.locator('.success-toast')).toContainText('提交成功')
  
  // 管理员审核
  await page.goto('/admin/market/review')
  await page.click('text=招聘志愿者助理')
  await page.click('button:has-text("通过")')
  
  // 验证帖子已上线
  await page.goto('/pages/market/index')
  await expect(page.locator('.post-card')).toContainText('招聘志愿者助理')
})
```

---

## 8. AI实现提示词

### 8.1 后端API生成

```prompt
基于以下规范生成Nitro API代码：

文件: server/api/market/posts/index.post.ts
功能: 创建爱心集市帖子

要求:
1. 使用Drizzle ORM操作PostgreSQL
2. 使用zod进行参数验证
3. 实现敏感词过滤
4. 返回标准化响应
5. 包含详细注释

数据表: market_posts (见spec)
验证规则:
- title: 5-100字符
- content: 20-2000字符
- type: enum('job', 'resume', 'idle')
- images: 最多9个URL

参考global.spec.md中的响应格式规范。
```

### 8.2 前端页面生成

```prompt
基于以下规范生成Uniapp页面代码：

文件: pages/market/create.vue
功能: 发布爱心集市帖子

UI框架: Wot Design Uni (wot-starter-v2)
要求:
1. 表单字段: type(选择器), title(输入), content(多行文本), images(图片上传), contactInfo, location, price
2. type为idle时显示price字段
3. 表单验证提示
4. 提交后跳转我的帖子页面
5. 使用TypeScript

参考market.spec.md中的接口定义。
```

### 8.3 管理后台生成

```prompt
基于以下规范生成Nuxt管理后台页面：

文件: pages/admin/market/review.vue
功能: 帖子审核页面

UI框架: Element Plus
要求:
1. 表格展示待审核帖子
2. 点击行查看详情弹窗
3. 审核操作: 通过/拒绝+备注
4. 分页功能
5. 实时刷新

API端点:
- GET /api/admin/market/posts?status=pending
- PATCH /api/admin/market/posts/:id/review
```

---

## 9. 实现检查清单

### Phase 2 实现顺序

| 序号 | 模块 | 优先级 | 依赖 |
|------|------|--------|------|
| 1 | 数据表创建 | P0 | - |
| 2 | 帖子CRUD API | P0 | 1 |
| 3 | 审核功能 | P0 | 2 |
| 4 | 收藏功能 | P1 | 2 |
| 5 | 小程序发布页 | P1 | 3 |
| 6 | 小程序列表/详情 | P1 | 3 |
| 7 | 管理后台审核页 | P1 | 3 |
| 8 | 浏览计数优化 | P2 | 6 |
| 9 | 搜索功能 | P2 | 6 |

---

## 10. 相关文档

- [用户模块](../phase1/user.spec.md)
- [认证模块](../phase1/auth.spec.md)
- [消息通知](../shared/notification.spec.md)
- [全局规范](../global.spec.md)