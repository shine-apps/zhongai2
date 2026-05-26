# 众爱联盟公益积分平台 — AI SDD 实施方案

> **版本**: v1.0  
> **日期**: 2026-05-26  
> **方法论**: AI Specification-Driven Development (AI SDD)  
> **目标**: 基于详细设计文档，通过AI辅助实现规范驱动开发

---

## 目录

- [1. AI SDD 方法论概述](#1-ai-sdd-方法论概述)
- [2. 规范文件体系](#2-规范文件体系)
- [3. 实施阶段规划](#3-实施阶段规划)
- [4. AI 提示词规范](#4-ai-提示词规范)
- [5. 代码生成规范](#5-代码生成规范)
- [6. 质量保障流程](#6-质量保障流程)
- [7. 附录：规范模板](#7-附录规范模板)

---

## 1. AI SDD 方法论概述

### 1.1 什么是 AI SDD

AI SDD（AI Specification-Driven Development）是一种结合AI辅助的规范驱动开发方法，并深度融合 **TDD（Test-Driven Development，测试驱动开发）** 范式：

```
┌──────────────────────────────────────────────────────────────────┐
│                   AI SDD + TDD 工作流程                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  需求文档 ──▶ 详细设计 ──▶ 规范文件 ──▶ 编写测试 ──▶ AI生成实现 ──▶ Review │
│     │           │           │           │           │           │      │
│     ▼           ▼           ▼           ▼           ▼           ▼      │
│  产品经理    架构师      AI工程师    开发/AI    AI Agent    开发工程师  │
│                                                                  │
│  核心原则：                                                      │
│  1. 规范即代码（Spec as Code）                                   │
│  2. 测试先行（Test First）— 先写测试，再写实现                    │
│  3. AI生成代码必须通过已有测试                                    │
│  4. 每个功能模块都有对应的规范文件 + 测试文件                      │
│  5. 红 → 绿 → 重构 的TDD循环贯穿始终                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 核心原则

| 原则 | 说明 | 实践方式 |
|------|------|----------|
| **规范先行** | 任何代码实现前必须有规范文件 | 每个功能模块对应一个 `.spec.md` 文件 |
| **测试先行** | 任何实现代码前必须有测试用例 | 严格遵循 TDD 红→绿→重构 循环 |
| **AI辅助生成** | 利用AI根据规范和测试生成实现代码 | 使用结构化提示词指导AI生成 |
| **人机协作** | AI生成 + 人工Review + 迭代优化 | 代码Review Checklist |
| **可追溯性** | 规范 ↔ 测试 ↔ 代码 三向追溯 | 规范文件中包含TDD测试用例 |
| **持续更新** | 规范、测试、代码同步维护 | 代码变更必须同步更新规范和测试 |

### 1.3 项目结构

```
zhongai-platform/
├── specs/                          # 规范文件目录
│   ├── README.md                   # 规范体系说明
│   ├── global.spec.md              # 全局规范
│   ├── phase1/                     # Phase 1 规范
│   │   ├── auth.spec.md
│   │   ├── user.spec.md
│   │   ├── activity.spec.md
│   │   ├── checkin.spec.md
│   │   ├── donation.spec.md
│   │   └── points.spec.md
│   ├── phase2/                     # Phase 2 规范
│   │   ├── ranking.spec.md
│   │   ├── market.spec.md
│   │   └── banner.spec.md
│   ├── phase3/                     # Phase 3 规范
│   │   ├── mall.spec.md
│   │   ├── order.spec.md
│   │   └── stats.spec.md
│   └── shared/                     # 共享规范
│       ├── database.spec.md
│       ├── api.spec.md
│       └── notification.spec.md
├── server/                         # 后端项目
│   └── ...
├── app/                            # 管理后台
│   └── ...
└── uniapp/                         # 小程序项目
    └── ...
```

---

## 2. 规范文件体系

### 2.1 规范文件格式

每个 `.spec.md` 文件必须包含以下章节：

```markdown
# [模块名称] 规范

## 1. 概述
- 功能描述
- 业务价值
- 依赖关系

## 2. 数据模型
- 数据库表结构
- TypeScript类型定义
- 验证规则

## 3. API接口
- 接口列表
- 请求/响应格式
- 错误码定义

## 4. 业务逻辑
- 核心流程
- 状态机
- 边界条件

## 5. 安全要求
- 权限控制
- 数据验证
- 防护措施

## 6. 测试要求
- 单元测试覆盖点
- 集成测试场景
- E2E测试用例

## 7. AI实现提示词
- 代码生成提示词
- Review检查清单
```

### 2.2 规范文件示例

以 `auth.spec.md` 为例：

```markdown
# 认证模块规范

## 1. 概述

### 1.1 功能描述
实现微信小程序手机快捷登录，包含：
- 微信登录凭证换取
- 手机号绑定
- JWT Token生成与刷新

### 1.2 业务价值
- 提供无感登录体验
- 确保用户身份真实性（手机号绑定）
- 支持Token自动刷新

### 1.3 依赖关系
- 依赖: 用户模块 (user)
- 被依赖: 所有需要登录的模块

## 2. 数据模型

### 2.1 数据库表
```sql
-- 见详细设计文档 3.2.1 用户表
-- 关键字段: openid, phone, role, status
```

### 2.2 TypeScript类型
```typescript
// 登录请求
interface LoginRequest {
  code: string;           // 微信wx.login code
  phoneCode: string;      // 微信getPhoneNumber code
  nickname?: string;
  avatarUrl?: string;
}

// 登录响应
interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}
```

## 3. API接口

### 3.1 POST /api/auth/login
**描述**: 微信小程序登录

**请求体**:
```json
{
  "code": "string",
  "phoneCode": "string",
  "nickname": "string?",
  "avatarUrl": "string?"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 604800,
    "user": { /* UserInfo */ }
  }
}
```

**错误码**:
- 400: 参数错误
- 401: 微信登录失败
- 422: 手机号获取失败

## 4. 业务逻辑

### 4.1 登录流程
```
1. 接收 wx.login code 和 getPhoneNumber code
2. 调用微信接口换取 openid 和手机号
3. 查询或创建用户
4. 生成 JWT Token (access + refresh)
5. 返回 Token 和用户信息
```

### 4.2 Token刷新流程
```
1. 接收 refreshToken
2. 验证 refreshToken 有效性
3. 生成新的 accessToken
4. 返回新 Token
```

## 5. 安全要求

- JWT Secret 必须 256位以上
- Token 有效期: access 7天, refresh 30天
- 微信敏感信息加密传输
- 防止重放攻击（code一次性使用）

## 6. 测试要求

### 6.1 单元测试
- [ ] 微信API调用成功/失败处理
- [ ] Token生成与验证
- [ ] 用户创建与查询

### 6.2 集成测试
- [ ] 完整登录流程
- [ ] Token刷新流程
- [ ] 并发登录处理

## 7. AI实现提示词

### 7.1 代码生成提示词
```
基于以下规范实现认证模块：

技术栈: Nuxt v4 + Drizzle ORM + JWT

要求:
1. 实现 POST /api/auth/login 接口
2. 实现 POST /api/auth/refresh 接口
3. 使用 jose 库处理 JWT
4. 错误处理使用统一响应格式
5. 包含完整的类型定义

输出:
- server/api/auth/login.post.ts
- server/api/auth/refresh.post.ts
- server/services/auth.service.ts
- server/utils/jwt.ts
```

### 7.2 Review检查清单
- [ ] 所有接口都有类型定义
- [ ] 错误处理完整
- [ ] 敏感信息没有硬编码
- [ ] 日志记录适当
```

---

## 3. 实施阶段规划

### 3.1 Phase 1 — MVP 基础双轨框架（4周）

#### Week 1: 项目基础设施

**目标**: 搭建项目框架，完成认证模块

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| 后端项目初始化 | `global.spec.md` | Nuxt项目结构 | 架构师 |
| 数据库Schema | `database.spec.md` | Drizzle Schema | 架构师 |
| 认证模块 | `auth.spec.md` | 登录/刷新API | 后端负责人 |
| 用户模块 | `user.spec.md` | 用户CRUD API | 后端负责人 |
| 小程序项目初始化 | `global.spec.md` | Uniapp项目结构 | 前端负责人 |
| 登录页 | `auth.spec.md` | 登录页面 | 前端负责人 |

**Week 1 交付物检查清单**:
- [ ] 后端项目可运行 (`pnpm dev` 正常启动)
- [ ] 数据库迁移脚本可执行
- [ ] 登录API测试通过
- [ ] 小程序登录页可正常登录

#### Week 2: 活动管理模块

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| 活动模块后端 | `activity.spec.md` | 活动CRUD API | 后端开发 |
| 活动报名模块 | `activity.spec.md` | 报名API | 后端开发 |
| 首页开发 | `activity.spec.md` | 首页+活动列表 | 前端开发 |
| 活动详情页 | `activity.spec.md` | 活动详情+报名 | 前端开发 |

#### Week 3: 签到与积分

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| 签到模块 | `checkin.spec.md` | GPS签到API | 后端开发 |
| 积分模块 | `points.spec.md` | 积分发放逻辑 | 后端开发 |
| 签到页 | `checkin.spec.md` | 签到打卡页面 | 前端开发 |
| 积分页 | `points.spec.md` | 积分展示页面 | 前端开发 |

#### Week 4: 捐助与管理后台

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| 捐助模块 | `donation.spec.md` | 捐助API+审核 | 后端开发 |
| 管理后台框架 | `global.spec.md` | Element Plus布局 | 前端开发 |
| 用户管理 | `user.spec.md` | 用户管理页面 | 前端开发 |
| 活动管理 | `activity.spec.md` | 活动管理页面 | 前端开发 |
| 捐助审核 | `donation.spec.md` | 捐助审核页面 | 前端开发 |

### 3.2 Phase 2 — 积分消耗与资源互助（3周）

#### Week 5: 排行榜

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| 排行榜模块 | `ranking.spec.md` | 排行榜API | 后端开发 |
| 排行榜页面 | `ranking.spec.md` | 排行榜UI | 前端开发 |

#### Week 6: 爱心集市

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| 集市模块 | `market.spec.md` | 集市API+审核 | 后端开发 |
| 集市页面 | `market.spec.md` | 集市列表/发布 | 前端开发 |

#### Week 7: 首页完善

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| Banner模块 | `banner.spec.md` | Banner API | 后端开发 |
| 统计模块 | `stats.spec.md` | 统计API | 后端开发 |
| 首页完善 | `banner.spec.md` | Banner+统计 | 前端开发 |

### 3.3 Phase 3 — 积分商城与激励闭环（3周）

#### Week 8: 积分商城

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| 商品模块 | `mall.spec.md` | 商品管理API | 后端开发 |
| 商城页面 | `mall.spec.md` | 商品列表/详情 | 前端开发 |

#### Week 9: 订单系统

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| 订单模块 | `order.spec.md` | 订单API | 后端开发 |
| 订单页面 | `order.spec.md` | 下单/订单列表 | 前端开发 |

#### Week 10: 完善与优化

| 任务 | 规范文件 | AI生成内容 | 人工Review |
|------|----------|------------|------------|
| 消息通知 | `notification.spec.md` | 消息通知模块 | 全栈开发 |
| 数据统计 | `stats.spec.md` | 数据报表 | 后端开发 |
| 管理后台完善 | - | 各模块管理页 | 前端开发 |
| 整体优化 | - | 性能优化 | 全团队 |

---

## 4. AI 提示词规范

### 4.1 代码生成提示词模板

#### 后端API生成模板

```markdown
## 任务
实现 [模块名称] 的后端API

## 技术栈
- 框架: Nuxt v4 (Nitro)
- ORM: Drizzle ORM
- 数据库: PostgreSQL
- 语言: TypeScript

## 规范文件
[粘贴对应 .spec.md 的相关章节]

## 要求
1. 文件位置: server/api/[模块]/[接口].ts
2. 使用 Drizzle ORM 进行数据库操作
3. 统一响应格式: { code, message, data }
4. 包含完整的类型定义
5. 错误处理使用 createError
6. 权限检查使用自定义 middleware

## 输出格式
为每个接口生成:
1. API 路由文件
2. Service 层文件（如逻辑复杂）
3. 类型定义
4. 简要的使用说明

## 示例
[提供一个类似功能的代码示例]
```

#### 前端页面生成模板

```markdown
## 任务
实现 [页面名称] 页面

## 技术栈
- 框架: Uniapp + Vue3
- UI库: Wot Design Uni
- 状态管理: Pinia

## 规范文件
[粘贴对应 .spec.md 的相关章节]

## 设计要求
[粘贴UI设计图或描述]

## 要求
1. 文件位置: src/pages/[路径]/[页面].vue
2. 使用 Composition API
3. 使用 Wot Design 组件
4. 响应式布局适配
5. 包含加载状态和空状态
6. 错误处理（toast提示）

## API接口
[列出需要调用的API]

## 输出格式
1. 完整的 .vue 文件
2. 使用的类型定义
3. 必要的 composables
```

### 4.2 Review提示词模板

```markdown
## 任务
Review以下代码是否符合规范

## 规范要求
[粘贴规范文件的关键要求]

## 待Review代码
[粘贴代码]

## 检查项
- [ ] 代码结构清晰
- [ ] 类型定义完整
- [ ] 错误处理完善
- [ ] 安全考虑充分
- [ ] 性能优化到位
- [ ] 符合编码规范

## 输出格式
1. 通过/不通过 总体评价
2. 具体问题列表（行号+问题+建议）
3. 改进后的代码（如有）
```

### 4.3 测试生成提示词模板

```markdown
## 任务
为 [模块名称] 生成测试代码

## 待测试代码
[粘贴代码]

## 测试要求
- 单元测试使用 Vitest
- 测试覆盖率 > 80%
- 包含正常和异常场景

## 输出格式
1. 测试文件代码
2. 测试用例说明
```

---

## 5. 代码生成规范

### 5.1 后端代码规范

#### 文件结构
```
server/
├── api/                    # API路由（自动注册）
│   └── [模块]/
│       ├── index.get.ts    # 列表查询
│       ├── index.post.ts   # 创建
│       └── [id].get.ts     # 详情
├── services/               # 业务逻辑层
│   └── [模块].service.ts
├── db/
│   └── schema/
│       └── [表].ts         # Drizzle Schema
├── middleware/             # 中间件
│   └── auth.ts
├── utils/                  # 工具函数
│   └── response.ts
└── types/                  # 类型定义
    └── [模块].d.ts
```

#### API路由模板
```typescript
// server/api/users/index.get.ts
import { getUsers } from '~/server/services/user.service'
import { createPaginatedResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  // 1. 权限检查
  await requireAuth(event)
  
  // 2. 参数解析与验证
  const query = getQuery(event)
  const { page = 1, pageSize = 10, keyword } = await validateQuery(query, {
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(10),
    keyword: z.string().optional(),
  })
  
  // 3. 业务逻辑
  const { list, total } = await getUsers({ page, pageSize, keyword })
  
  // 4. 响应
  return createPaginatedResponse(list, total, page, pageSize)
})
```

### 5.2 前端代码规范

#### 文件结构
```
src/
├── pages/                  # 页面
│   └── [模块]/
│       ├── list.vue
│       └── detail.vue
├── components/             # 组件
│   └── [模块]/
│       └── [组件].vue
├── composables/            # 组合式函数
│   └── use[功能].ts
├── services/               # API服务
│   └── [模块].ts
├── stores/                 # Pinia状态
│   └── [模块].ts
└── types/                  # 类型定义
    └── [模块].d.ts
```

#### 页面组件模板
```vue
<!-- src/pages/activity/list.vue -->
<template>
  <view class="activity-list">
    <!-- 搜索栏 -->
    <wd-search v-model="keyword" @search="handleSearch" />
    
    <!-- 分类筛选 -->
    <wd-tabs v-model="activeCategory">
      <wd-tab title="全部" />
      <wd-tab title="慰问老人" />
      <!-- ... -->
    </wd-tabs>
    
    <!-- 列表 -->
    <scroll-view scroll-y @scrolltolower="loadMore">
      <activity-card
        v-for="item in list"
        :key="item.id"
        :activity="item"
        @click="goToDetail(item.id)"
      />
      <wd-loadmore :status="loadStatus" />
      <wd-empty v-if="!list.length && !loading" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useActivityList } from '@/composables/useActivity'

const { list, loading, loadStatus, keyword, activeCategory, loadMore, refresh } = useActivityList()

onMounted(() => {
  refresh()
})

const handleSearch = () => {
  refresh()
}

const goToDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/activity/detail?id=${id}` })
}
</script>
```

---

## 6. 质量保障流程（TDD驱动）

### 6.1 TDD + AI 代码生成流程

本项目采用 **TDD（测试驱动开发）** 作为核心开发范式，与AI SDD深度融合。每个功能模块的开发严格遵循 **红 → 绿 → 重构** 循环：

```
┌──────────────────────────────────────────────────────────────────────┐
│                    TDD + AI SDD 开发循环                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ 🔴 RED   │───▶│ 🟢 GREEN │───▶│ 🔵 REFACTOR│──▶▶│ ✅ REVIEW │──┐  │
│  │ 编写测试  │    │ AI生成实现│    │ 重构优化  │    │ 人工Review │  │  │
│  │ 测试失败  │    │ 测试通过  │    │ 测试仍通过│    │ 代码合并   │  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │  │
│       ▲                                                          │  │
│       └──────────────────── 下一个测试用例 ───────────────────────┘  │
│                                                                      │
│  详细步骤：                                                          │
│  1. 🔴 RED   — 阅读规范，编写测试用例，运行测试（必须失败）           │
│  2. 🟢 GREEN — 将测试和规范作为提示词，AI生成最小实现代码             │
│  3. 🔵 REFACTOR — AI/人工优化代码结构，确保测试仍然通过               │
│  4. ✅ REVIEW — 人工Review代码质量和测试覆盖率                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 TDD 实践规则

| 规则 | 说明 | 强制程度 |
|------|------|----------|
| **测试先行** | 编写任何业务代码前，必须先编写对应的测试 | 🔴 强制 |
| **最小实现** | AI生成的代码仅需让当前失败的测试通过 | 🔴 强制 |
| **测试隔离** | 每个测试用例独立运行，不依赖执行顺序 | 🔴 强制 |
| **测试命名** | 使用 `should_预期行为_when_条件` 格式 | 🟡 建议 |
| **快速反馈** | 单个测试执行时间 < 100ms | 🟡 建议 |
| **覆盖率门槛** | Service层 ≥ 80%，工具函数 ≥ 90% | 🔴 强制 |
| **禁止跳过测试** | 不允许使用 `it.skip` 或 `test.skip` | 🔴 强制 |

### 6.3 TDD 与 AI 协作流程

#### Step 1: 🔴 RED — 编写失败测试

```markdown
## AI提示词：生成测试代码

基于以下规范生成测试代码（此时实现代码不存在，测试应该失败）：

规范文件: [粘贴 spec.md 相关章节]

要求:
1. 使用 Vitest 框架
2. 测试文件位置: server/services/__tests__/[模块].service.test.ts
3. 测试必须覆盖规范中定义的所有业务场景
4. 使用 mock 模拟数据库操作
5. 测试命名使用 should_预期行为_when_条件 格式

测试用例清单（来自规范）:
- [ ] 正常场景1
- [ ] 正常场景2
- [ ] 异常场景1
- [ ] 边界条件1
```

#### Step 2: 🟢 GREEN — AI生成最小实现

```markdown
## AI提示词：生成实现代码

以下测试目前失败，请生成最小实现代码使测试通过：

测试文件: [粘贴测试代码或路径]

规范文件: [粘贴 spec.md 相关章节]

要求:
1. 仅实现让测试通过的最小代码
2. 不要过度设计或添加额外功能
3. 使用 Drizzle ORM 操作数据库
4. 错误处理使用统一格式
5. 类型定义完整

输出:
- server/services/[模块].service.ts
- server/api/[模块]/[接口].ts
```

#### Step 3: 🔵 REFACTOR — 重构优化

```markdown
## AI提示词：重构代码

以下代码已通过所有测试，请进行重构优化：

实现代码: [粘贴代码]
测试代码: [粘贴测试代码]

重构要求:
1. 消除重复代码
2. 提取公共方法
3. 优化命名
4. 添加必要注释
5. 确保所有测试仍然通过
```

#### Step 4: ✅ REVIEW — 人工审查

```markdown
## Review检查清单

- [ ] 所有测试通过（pnpm test）
- [ ] 测试覆盖率达标（pnpm test:coverage）
- [ ] 无跳过的测试（it.skip）
- [ ] 测试命名清晰（should_xxx_when_xxx）
- [ ] 实现代码无冗余
- [ ] 类型定义完整
- [ ] 错误处理完善
```

### 6.4 代码Review检查清单

#### 后端代码Review清单

| 检查项 | 检查内容 | 通过标准 |
|--------|----------|----------|
| **TDD合规** | 是否先有测试再有实现 | 测试文件创建时间早于实现文件 |
| **测试覆盖** | 所有业务场景都有测试 | 覆盖率 ≥ 80% |
| **类型安全** | 所有函数参数和返回值都有类型定义 | 无any类型 |
| **错误处理** | 所有异常都有捕获和处理 | 使用统一错误格式 |
| **权限控制** | 敏感操作有权限检查 | 使用auth中间件 |
| **数据验证** | 所有输入数据都经过验证 | 使用zod验证 |
| **SQL安全** | 无SQL注入风险 | 使用Drizzle参数化 |
| **性能** | 无N+1查询问题 | 使用relations预加载 |
| **日志** | 关键操作有日志记录 | 使用consola |

#### 前端代码Review清单

| 检查项 | 检查内容 | 通过标准 |
|--------|----------|----------|
| **TDD合规** | 组件行为有测试覆盖 | 核心组件有单元测试 |
| **类型安全** | 所有props和data都有类型 | 使用TS严格模式 |
| **错误处理** | API调用有错误处理 | 使用try-catch |
| **加载状态** | 异步操作有loading状态 | 使用skeleton |
| **空状态** | 列表为空时显示空状态 | 使用empty组件 |
| **响应式** | 布局适配不同屏幕 | 使用rpx单位 |
| **性能** | 列表使用虚拟滚动 | 大数据量优化 |

### 6.5 测试策略

| 测试类型 | 工具 | 覆盖目标 | TDD阶段 | 责任人 |
|----------|------|----------|---------|--------|
| 单元测试 | Vitest | Service层 ≥ 80% | 🔴 RED | AI生成 + 人工补充 |
| API测试 | Vitest + supertest | 所有API正常+异常 | 🔴 RED | AI生成 + 人工补充 |
| E2E测试 | Playwright | 核心用户流程 | 🟢 GREEN后 | QA工程师 |
| 性能测试 | k6 | 关键API响应时间 | 🔵 REFACTOR | 架构师 |

### 6.6 测试文件结构

```
server/
├── services/
│   └── __tests__/
│       ├── auth.service.test.ts
│       ├── activity.service.test.ts
│       ├── checkin.service.test.ts
│       ├── donation.service.test.ts
│       ├── points.service.test.ts
│       ├── market.service.test.ts
│       ├── mall.service.test.ts
│       ├── notification.service.test.ts
│       └── helpers/
│           ├── setup.ts              # 测试环境初始化
│           ├── fixtures.ts           # 测试数据
│           └── mocks.ts              # 数据库Mock
├── api/
│   └── __tests__/
│       ├── auth.test.ts
│       ├── activities.test.ts
│       └── ...
└── vitest.config.ts

uniapp/
├── src/
│   └── __tests__/
│       ├── composables/
│       │   └── useActivity.test.ts
│       ├── services/
│       │   └── auth.test.ts
│       └── utils/
│           └── format.test.ts
└── vitest.config.ts
```

---

## 7. 附录：规范模板

### 7.1 规范文件模板

```markdown
# [模块名] 规范

## 1. 概述

### 1.1 功能描述
[一句话描述功能]

### 1.2 业务价值
[为什么需要这个功能]

### 1.3 依赖关系
- 依赖: [依赖的模块]
- 被依赖: [依赖本模块的模块]

## 2. 数据模型

### 2.1 数据库表
```typescript
// Drizzle Schema
export const tableName = pgTable('table_name', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ... 字段定义
})
```

### 2.2 TypeScript类型
```typescript
interface Entity {
  id: string
  // ... 字段
}
```

## 3. API接口

### 3.1 [接口名称]
- **方法**: GET/POST/PUT/DELETE
- **路径**: /api/[路径]
- **权限**: 公开/登录/管理员

**请求**:
```json
{
  "field": "type"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

**错误码**:
- 400: 参数错误
- 401: 未授权
- ...

## 4. 业务逻辑

### 4.1 [流程名称]
```
1. 步骤1
2. 步骤2
3. 步骤3
```

### 4.2 状态机
```
[状态A] --事件1--> [状态B]
[状态B] --事件2--> [状态C]
```

## 5. 安全要求

- [ ] 权限检查点1
-