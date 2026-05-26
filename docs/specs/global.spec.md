# 全局规范

> **文件**: global.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26

---

## 1. 概述

### 1.1 规范目的

本文件定义了众爱联盟项目开发中通用的技术规范、编码约定和最佳实践，适用于所有模块。

### 1.2 适用范围

- 后端项目（server/）
- 管理后台项目（app/）
- 小程序项目（uniapp/）

---

## 2. 项目初始化规范

### 2.1 后端项目初始化

```bash
# 创建项目
mkdir zhongai-server && cd zhongai-server
npx nuxi@latest init . --force
pnpm install

# 安装依赖
pnpm add drizzle-orm pg zod jose bcryptjs uuid
pnpm add -D drizzle-kit @types/pg @types/bcryptjs @types/uuid
pnpm add @element-plus/nuxt
pnpm add @wangeditor/editor @wangeditor/editor-for-vue

# 安装工具库
pnpm add consola date-fns
```

### 2.2 数据库迁移

```bash
# 生成迁移文件
pnpm drizzle-kit generate

# 执行迁移
pnpm drizzle-kit migrate

# 重置数据库（开发环境）
pnpm drizzle-kit drop
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 2.3 小程序项目初始化

```bash
# 创建项目
pnpm create uni zhongai-uniapp -t wot-starter-v2
cd zhongai-uniapp
pnpm install

# 安装富文本渲染
pnpm add mp-html

# 安装其他依赖
pnpm add pinia @vueuse/core dayjs
```

---

## 3. 编码规范

### 3.1 TypeScript配置

**tsconfig.json（后端）**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "skipLibCheck": true
  }
}
```

### 3.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `user-service.ts` |
| 目录名 | kebab-case | `activity-list/` |
| 类名 | PascalCase | `UserService` |
| 函数名 | camelCase | `getUserById` |
| 常量名 | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| 枚举名 | PascalCase | `UserStatus` |
| 枚举值 | SCREAMING_SNAKE | `UserStatus.ACTIVE` |
| 接口名 | PascalCase | `UserInfo` |
| 数据库表名 | snake_case | `point_transactions` |
| 数据库字段 | snake_case | `created_at` |
| API路由 | kebab-case | `/api/point-transactions` |

---

## 4. 目录结构规范

### 4.1 后端目录结构

```
server/
├── nuxt.config.ts                   # Nuxt 配置
├── drizzle.config.ts                # Drizzle ORM 配置
├── package.json
├── app/                             # Nuxt 应用目录
│   ├── layouts/
│   ├── middleware/
│   └── pages/
├── server/
│   ├── api/                         # API 路由
│   │   ├── auth/
│   │   ├── users/
│   │   └── ...
│   ├── services/                    # 业务逻辑层
│   ├── db/
│   │   └── schema/
│   ├── middleware/
│   ├── utils/
│   └── types/
└── scripts/
```

### 4.2 小程序目录结构

```
uniapp/
├── src/
│   ├── pages/
│   ├── components/
│   ├── composables/
│   ├── services/
│   ├── stores/
│   ├── styles/
│   ├── types/
│   └── utils/
├── package.json
└── vite.config.ts
```

---

## 5. API规范

### 5.1 统一响应格式

```typescript
// 成功响应
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// 错误响应
{
  "code": 400,
  "message": "参数错误",
  "data": null
}
```

### 5.2 错误码定义

| 错误码 | 说明 | HTTP状态码 |
|--------|------|------------|
| 0 | 成功 | 200 |
| 400 | 请求参数错误 | 400 |
| 401 | 未授权 | 401 |
| 403 | 无权限 | 403 |
| 404 | 资源不存在 | 404 |
| 409 | 资源冲突 | 409 |
| 422 | 业务校验失败 | 422 |
| 500 | 服务器内部错误 | 500 |

### 5.3 API路由命名

- 列表查询: `GET /api/[模块]` -> `index.get.ts`
- 创建: `POST /api/[模块]` -> `index.post.ts`
- 详情: `GET /api/[模块]/:id` -> `[id].get.ts`
- 更新: `PATCH /api/[模块]/:id` -> `[id].patch.ts`
- 删除: `DELETE /api/[模块]/:id` -> `[id].delete.ts`

---

## 6. 数据库规范

### 6.1 表命名规范

- 表名使用 `snake_case`
- 使用复数形式: `users`, `activities`, `point_transactions`
- 关联表使用 `主表_从表`: `activity_registrations`

### 6.2 字段命名规范

| 字段类型 | 命名 | 示例 |
|----------|------|------|
| 主键 | `id` | UUID |
| 外键 | `[表名]_id` | `user_id` |
| 创建时间 | `created_at` | TIMESTAMPTZ |
| 更新时间 | `updated_at` | TIMESTAMPTZ |
| 软删除 | `deleted_at` | TIMESTAMPTZ |
| 状态字段 | `[类型]_status` | `order_status` |

### 6.3 Schema定义规范

```typescript
// 正确示例
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

---

## 7. 组件规范

### 7.1 后端组件规范

```typescript
// 正确的API路由结构
import { z } from 'zod'
import { requireAuth } from '~/server/middleware/auth'
import { createError } from 'h3'
import { success } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // 1. 权限检查
    await requireAuth(event)
    
    // 2. 参数解析
    const query = getQuery(event)
    
    // 3. 业务逻辑
    const result = await doSomething()
    
    // 4. 返回响应
    return success(result)
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})
```

### 7.2 前端组件规范

```vue
<!-- 正确的页面结构 -->
<template>
  <view class="page">
    <!-- 状态组件 -->
    <wd-skeleton v-if="loading" />
    
    <!-- 内容组件 -->
    <template v-else>
      <list-component
        v-for="item in list"
        :key="item.id"
        :data="item"
        @click="handleClick(item)"
      />
      
      <!-- 空状态 -->
      <wd-empty v-if="!list.length" description="暂无数据" />
      
      <!-- 加载更多 -->
      <wd-loadmore :status="loadStatus" />
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 类型定义
interface ListItem {
  id: string
  title: string
}

// 状态
const loading = ref(true)
const list = ref<ListItem[]>([])
const loadStatus = ref<'loading' | 'finished' | 'error'>('loading')

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  try {
    loading.value = true
    const res = await fetchList()
    list.value = res.data.list
  } catch (error) {
    // 错误处理
  } finally {
    loading.value = false
  }
}
</script>
```

---

## 8. 安全规范

### 8.1 认证与授权

```typescript
// 认证中间件
export const requireAuth = async (event: H3Event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  const payload = await verifyToken(token)
  if (!payload) {
    throw createError({ statusCode: 401, message: 'Invalid token' })
  }
  
  event.context.user = payload
}

// 管理员权限中间件
export const requireAdmin = async (event: H3Event) => {
  await requireAuth(event)
  if (event.context.user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
}
```

### 8.2 数据验证

```typescript
import { z } from 'zod'

// 验证规则
export const loginSchema = z.object({
  code: z.string().min(1, '微信登录code不能为空'),
  phoneCode: z.string().min(1, '手机号授权code不能为空'),
  nickname: z.string().max(50).optional(),
  avatarUrl: z.string().url().optional(),
})

export const createActivitySchema = z.object({
  title: z.string().min(1).max(100),
  category: z.enum(['elder_care', 'education', 'env', 'disaster', 'other']),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  checkinRadius: z.number().min(10).max(1000).default(200),
  maxParticipants: z.number().int().positive().nullable().optional(),
  rewardPoints: z.number().int().min(0),
})
```

### 8.3 敏感信息处理

```typescript
// 正确: 使用环境变量
const jwtSecret = process.env.NUXT_JWT_SECRET
const wechatAppId = process.env.NUXT_WECHAT_APP_ID

// 错误: 硬编码敏感信息
const jwtSecret = 'your-secret-key'
```

---

## 9. TDD测试规范

> **核心原则**：本项目采用 **TDD（Test-Driven Development，测试驱动开发）** 范式。所有业务代码必须先编写测试，再编写实现。

### 9.1 TDD 开发循环

每个功能模块的开发严格遵循 **红 → 绿 → 重构** 循环：

```
🔴 RED ────▶ 🟢 GREEN ────▶ 🔵 REFACTOR ────▶ 下一个测试
编写测试     AI生成实现      重构优化
(测试失败)   (测试通过)      (测试仍通过)
```

**强制规则**：
- 🔴 **禁止在没有测试的情况下编写业务代码**
- 🔴 **禁止提交无法通过的测试（除非是RED阶段的预期失败）**
- 🔴 **禁止使用 `it.skip` 或 `test.skip` 跳过测试**

### 9.2 测试框架配置

**Vitest 配置** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/services/**/*.ts', 'server/utils/**/*.ts'],
      exclude: ['server/**/*.test.ts', 'server/**/*.d.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    setupFiles: ['./server/services/__tests__/helpers/setup.ts']
  }
})
```

### 9.3 测试命名规范

使用 **should_预期行为_when_条件** 格式：

```typescript
// ✅ 正确的测试命名
describe('PointsService', () => {
  describe('grantPoints', () => {
    it('should_grant_points_successfully_when_valid_request', async () => {
      // ...
    })

    it('should_throw_error_when_amount_is_negative', async () => {
      // ...
    })

    it('should_throw_error_when_insufficient_balance_when_spending', async () => {
      // ...
    })
  })
})

// ❌ 错误的测试命名
it('test1', () => { /* ... */ })
it('grantPoints', () => { /* ... */ })
it('should work', () => { /* ... */ })
```

### 9.4 测试结构规范（AAA模式）

所有测试用例使用 **Arrange-Act-Assert** 模式：

```typescript
it('should_grant_points_successfully_when_valid_request', async () => {
  // Arrange - 准备测试数据
  const userId = 'test-user-uuid'
  const amount = 10
  mockDb.query.mockResolvedValueOnce({ rows: [{ balance: 0 }] })

  // Act - 执行被测方法
  const result = await service.grantPoints(userId, amount)

  // Assert - 验证结果
  expect(result.balance).toBe(10)
  expect(mockDb.insert).toHaveBeenCalledWith(
    expect.objectContaining({ amount: 10 })
  )
})
```

### 9.5 Mock规范

```typescript
// server/services/__tests__/helpers/mocks.ts
import { vi } from 'vitest'

// 数据库Mock
export const mockDb = {
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  query: vi.fn(),
  transaction: vi.fn((fn) => fn(mockDb)),
}

// 微信APIMock
export const mockWechatApi = {
  code2Session: vi.fn(),
  getPhoneNumber: vi.fn(),
}
```

### 9.6 测试数据Fixtures

```typescript
// server/services/__tests__/helpers/fixtures.ts
import type { User, Activity, PointAccount } from '~/server/db/schema'

export const mockUser: User = {
  id: 'test-user-uuid',
  openid: 'test-openid',
  phone: '13800138000',
  nickname: '测试用户',
  avatarUrl: 'https://example.com/avatar.jpg',
  role: 'volunteer',
  status: 'active',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

export const mockActivity: Activity = {
  id: 'test-activity-uuid',
  title: '测试活动',
  category: 'elder_care',
  startTime: new Date('2026-06-01T09:00:00'),
  endTime: new Date('2026-06-01T12:00:00'),
  status: 'published',
  rewardPoints: 2,
  maxParticipants: 30,
  currentParticipants: 0,
  organizerId: 'test-admin-uuid',
  createdAt: new Date('2026-05-20'),
  updatedAt: new Date('2026-05-20'),
}
```

### 9.7 TDD与AI协作提示词模板

#### 生成测试（RED阶段）

```markdown
## 任务
基于规范生成测试代码（TDD RED阶段）

## 规范文件
[粘贴 spec.md 相关章节]

## 要求
1. 使用 Vitest 框架
2. 测试文件位置: server/services/__tests__/[模块].service.test.ts
3. 覆盖规范中定义的所有业务场景
4. 使用 mock 模拟数据库和外部API
5. 测试命名: should_预期行为_when_条件
6. 使用 AAA（Arrange-Act-Assert）模式
7. 此时实现代码不存在，测试应该全部失败

## 输出
- 完整的 .test.ts 文件
```

#### 生成实现（GREEN阶段）

```markdown
## 任务
生成最小实现代码使测试通过（TDD GREEN阶段）

## 失败的测试
[粘贴测试代码]

## 规范文件
[粘贴 spec.md 相关章节]

## 要求
1. 仅实现让测试通过的最小代码
2. 不要过度设计
3. 使用 Drizzle ORM
4. 类型定义完整

## 输出
- server/services/[模块].service.ts
```

### 9.8 测试覆盖率要求

| 模块 | 行覆盖率 | 分支覆盖率 | 函数覆盖率 |
|------|----------|------------|------------|
| Service层 | ≥ 80% | ≥ 70% | ≥ 80% |
| 工具函数 | ≥ 90% | ≥ 80% | ≥ 90% |
| 验证逻辑 | 100% | 100% | 100% |
| API路由 | ≥ 60% | ≥ 50% | ≥ 60% |

### 9.9 CI/CD集成

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test              # 运行所有测试
      - run: pnpm test:coverage     # 生成覆盖率报告
      - run: pnpm test:ci           # CI模式（失败时停止）
```

---

## 10. Git规范

### 10.1 分支命名

| 分支类型 | 命名规范 | 示例 |
|----------|----------|------|
| 功能分支 | feature/[模块]-[功能名] | `feature/auth-wechat-login` |
| Bug修复分支 | fix/[模块]-[问题描述] | `fix/points-calculation-error` |
| 发布分支 | release/v[版本号] | `release/v1.0.0` |
| 热修复分支 | hotfix/[问题描述] | `hotfix/login-crash` |

### 10.2 Commit规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

---

## 11. AI实现提示词

### 11.1 项目初始化提示词

```markdown
## 任务
初始化众爱联盟后端项目

## 技术栈
- Nuxt v4
- Drizzle ORM
- PostgreSQL
- Element Plus
- WangEditor V5

## 要求
1. 创建标准Nuxt项目结构
2. 配置Drizzle ORM
3. 配置Element Plus
4. 配置环境变量
5. 创建数据库连接

## 输出
- nuxt.config.ts
- drizzle.config.ts
- .env.example
- server/db/index.ts
```

> **积分系统说明**：本项目积分仅作为个人公益信誉展示，不可消耗、不可兑换。积分累计值用于排行榜排序和荣誉等级评定。

### 11.2 通用Review检查清单

- [ ] 代码结构符合目录规范
- [ ] 类型定义完整，无any
- [ ] 错误处理完善
- [ ] 敏感信息使用环境变量
- [ ] 数据库操作使用ORM
- [ ] API响应格式统一
- [ ] 命名符合规范
- [ ] 测试覆盖率达标
