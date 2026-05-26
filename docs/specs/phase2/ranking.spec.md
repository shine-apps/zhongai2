# 排行榜模块规范

> **文件**: phase2/ranking.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

排行榜模块是众爱联盟平台的重要激励展示功能，通过展示用户在活动参与、公益捐助等方面的排名，激发用户参与热情，营造良性竞争氛围：
- 活动积分榜：展示用户参与活动获得的积分排名
- 捐助大爱榜：展示用户捐助金额排名
- 活跃之星：展示用户活跃度的综合排名
- 时间维度：支持周榜、月榜、总榜切换

### 1.2 业务价值

- 激励用户积极参与活动和捐助
- 增强用户之间的良性竞争
- 展示平台活跃度和影响力
- 为优秀志愿者提供荣誉感

### 1.3 依赖关系

- 依赖: 用户模块(user)、积分模块(points)、活动模块(activity)、签到模块(checkin)
- 被依赖: 无

### 1.4 排行榜类型

| 榜单 | 排序依据 | 说明 |
|------|----------|------|
| 活动积分榜 | 活动积分累计 | 参与公益活动获得的积分 |
| 捐助大爱榜 | 捐助金额总计 | 捐款捐物的总价值 |
| 活跃之星 | 综合活跃度分数 | 参与次数的综合评估 |

---

## 2. 数据模型

### 2.1 依赖表结构

**积分账户表 point_accounts**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID |
| activity_points_total | INT | 活动积分累计 |
| donation_points_total | INT | 捐助积分累计 |
| total_points | INT | 总积分 |

**积分流水表 point_transactions**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID |
| point_type | VARCHAR | 类型：activity/donation |
| amount | INT | 积分数量 |
| source_type | VARCHAR | 来源类型 |
| created_at | TIMESTAMPTZ | 创建时间 |

**用户表 users**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户ID |
| nickname | VARCHAR | 用户昵称 |
| avatar_url | VARCHAR | 用户头像 |
| last_active_at | TIMESTAMPTZ | 最后活跃时间 |

### 2.2 排行榜缓存结构（Redis）

**活动积分榜**
```
Key: ranking:activity:{period}
Type: Sorted Set
Score: 活动积分
Member: user_id
TTL: 1小时
period取值: week, month, all
```

**捐助大爱榜**
```
Key: ranking:donation:{period}
Type: Sorted Set
Score: 捐助金额（元）
Member: user_id
TTL: 1小时
```

**活跃之星榜**
```
Key: ranking:active:{period}
Type: Sorted Set
Score: 活跃度分数
Member: user_id
TTL: 1小时
```

### 2.3 TypeScript类型

```typescript
// 榜单类型
type RankingType = 'activity' | 'donation' | 'active'

// 时间维度
type RankingPeriod = 'week' | 'month' | 'all'

// 排行榜条目
interface RankingItem {
  rank: number
  userId: string
  nickname: string
  avatarUrl: string | null
  score: number
  change: number  // 排名变化
  isTop3: boolean
}

// 捐助榜单额外字段
interface DonationRankingItem extends RankingItem {
  donationCount: number
}

// 活跃榜单额外字段
interface ActiveRankingItem extends RankingItem {
  checkinCount: number
  activityCount: number
}

// 排行榜响应
interface RankingResponse {
  type: RankingType
  period: RankingPeriod
  total: number
  page: number
  pageSize: number
  myRank: RankingItem | null
  list: RankingItem[]
}

// 活跃度计算公式
const ACTIVE_SCORE_FORMULA = {
  checkin: 10,      // 每次签到
  activity: 20,      // 每次参与活动
  donation: 30,      // 每次捐助
}
```

---

## 3. API接口

### 3.1 获取活动积分榜

**接口**: `GET /api/rankings/activity`  
**描述**: 获取活动积分排行榜  
**权限**: 公开  
**状态**: [TODO]

**查询参数**:
```
?period=all&page=1&pageSize=20
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "type": "activity",
    "period": "all",
    "total": 1000,
    "page": 1,
    "pageSize": 20,
    "myRank": {
      "rank": 15,
      "userId": "uuid",
      "nickname": "热心志愿者",
      "avatarUrl": "https://...",
      "score": 50,
      "change": 3,
      "isTop3": false
    },
    "list": [
      {
        "rank": 1,
        "userId": "uuid",
        "nickname": "志愿之星",
        "avatarUrl": "https://...",
        "score": 250,
        "change": 0,
        "isTop3": true
      }
    ]
  }
}
```

### 3.2 获取捐助大爱榜

**接口**: `GET /api/rankings/donation`  
**描述**: 获取捐助金额排行榜  
**权限**: 公开  
**状态**: [TODO]

**查询参数**:
```
?period=all&page=1&pageSize=20
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "type": "donation",
    "period": "all",
    "total": 500,
    "page": 1,
    "pageSize": 20,
    "myRank": {
      "rank": 8,
      "userId": "uuid",
      "nickname": "热心志愿者",
      "avatarUrl": "https://...",
      "score": 5000.00,
      "donationCount": 10,
      "change": 1,
      "isTop3": false
    },
    "list": [
      {
        "rank": 1,
        "userId": "uuid",
        "nickname": "大爱无疆",
        "avatarUrl": "https://...",
        "score": 50000.00,
        "donationCount": 50,
        "change": 0,
        "isTop3": true
      }
    ]
  }
}
```

### 3.3 获取活跃之星榜

**接口**: `GET /api/rankings/active`  
**描述**: 获取活跃度排行榜  
**权限**: 公开  
**状态**: [TODO]

**查询参数**:
```
?period=week&page=1&pageSize=20
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "type": "active",
    "period": "week",
    "total": 800,
    "page": 1,
    "pageSize": 20,
    "myRank": {
      "rank": 25,
      "userId": "uuid",
      "nickname": "热心志愿者",
      "avatarUrl": "https://...",
      "score": 120,
      "checkinCount": 5,
      "activityCount": 3,
      "change": -2,
      "isTop3": false
    },
    "list": [
      {
        "rank": 1,
        "userId": "uuid",
        "nickname": "活跃达人",
        "avatarUrl": "https://...",
        "score": 580,
        "checkinCount": 15,
        "activityCount": 8,
        "change": 0,
        "isTop3": true
      }
    ]
  }
}
```

---

## 4. 业务逻辑

### 4.1 排行榜计算规则

**活动积分榜计算**:
```typescript
async function calculateActivityRanking(period: RankingPeriod): Promise<RankingItem[]> {
  const startDate = getPeriodStartDate(period)
  
  const query = db.select({
    userId: pointTransactions.userId,
    totalPoints: sql`SUM(${pointTransactions.amount})`
  })
    .from(pointTransactions)
    .where(and(
      eq(pointTransactions.pointType, 'activity'),
      startDate ? gte(pointTransactions.createdAt, startDate) : undefined
    ))
    .groupBy(pointTransactions.userId)
    .orderBy(desc('totalPoints'))
  
  return query
}
```

**捐助大爱榜计算**:
```typescript
async function calculateDonationRanking(period: RankingPeriod): Promise<DonationRankingItem[]> {
  const startDate = getPeriodStartDate(period)
  
  const query = db.select({
    userId: donations.userId,
    totalAmount: sql`SUM(${donations.amount})`,
    donationCount: sql`COUNT(${donations.id})`
  })
    .from(donations)
    .where(and(
      eq(donations.status, 'approved'),
      startDate ? gte(donations.createdAt, startDate) : undefined
    ))
    .groupBy(donations.userId)
    .orderBy(desc('totalAmount'))
  
  return query
}
```

**活跃度计算公式**:
```
活跃度分数 = 签到次数 × 10 + 参与活动数 × 20 + 捐助次数 × 30
```

### 4.2 缓存策略

**缓存更新策略**:
1. 定时更新：每小时全量更新一次排行榜
2. 实时更新：用户积分变动时，异步更新缓存
3. 懒加载：缓存不存在时，实时计算并写入缓存

**缓存更新代码**:
```typescript
class RankingCache {
  async updateActivityRanking(period: string, rankings: RankingItem[]) {
    const key = `ranking:activity:${period}`
    const pipe = redis.pipeline()
    
    pipe.delete(key)
    
    for (const rank of rankings) {
      pipe.zadd(key, rank.score, rank.userId)
    }
    
    pipe.expire(key, 3600)  // 1小时
    await pipe.exec()
  }
  
  async getRankingWithPagination(
    rankingType: string,
    period: string,
    page: number,
    pageSize: number
  ): Promise<RankingItem[]> {
    const key = `ranking:${rankingType}:${period}`
    
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    
    const results = await redis.zrevrange(key, start, end, 'WITHSCORES')
    
    return results.map((userId, score, index) => ({
      userId,
      score,
      rank: start + index + 1
    }))
  }
}
```

### 4.3 排名变化计算

```typescript
function calculateRankChange(currentRank: number, previousRank: number | null): number {
  if (previousRank === null) return 0
  return previousRank - currentRank
}

// 示例
// 上次第10名，现在第5名：change = 10 - 5 = 5（上升5名）
// 上次第5名，现在第10名：change = 5 - 10 = -5（下降5名）
```

### 4.4 排行榜流程图

```
用户请求排行榜
    │
    ▼
检查Redis缓存
    │
    ├── 缓存存在 ──▶ 直接返回缓存数据
    │
    └── 缓存缺失 ──▶ 查询数据库
                          │
                          ▼
                      计算排名数据
                          │
                          ▼
                      写入Redis缓存
                          │
                          ▼
                      返回数据
```

---

## 5. 安全要求

### 5.1 访问控制

- 排行榜列表为公开接口，无需认证
- 用户个人排名信息需要JWT认证
- 管理员可查看完整排名数据

### 5.2 防刷机制

- 排行榜数据基于真实业务数据计算，不可伪造
- 积分获取有严格业务逻辑，防止刷分
- 缓存层限制请求频率，防止缓存击穿

### 5.3 数据安全

- 用户敏感信息（手机号等）不在排行榜中展示
- 仅展示用户昵称、头像等公开信息
- 缓存数据设置合理的过期时间

---

## 6. 前端实现要求

### 6.1 排行榜页面

**页面**: `/pages/ranking/index.vue`

```
┌─────────────────────────────────┐
│  [活动榜] [捐助榜] [活跃榜]      │ ← Tab切换
│  [周榜] [月榜] [总榜]           │ ← 时间筛选
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 🥇 第1名                  │  │
│  │ [头像] 大爱无疆           │  │
│  │ 50000元        ↑ 0        │  │
│  └───────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  │
│  │ 🥈 第2名  │  │ 🥉 第3名  │  │
│  │ 热心人士  │  │ 志愿者A   │  │
│  │ 30000元  │  │ 20000元  │  │
│  └──────────┘  └──────────┘  │
├─────────────────────────────────┤
│  4. 爱心人士A  15000元  ↑ 2    │
│  5. 志愿者B    12000元  ↓ 1    │
│  6. 热心人C    10000元  → 0    │
│  ...                              │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 我的排名: 第15名           │  │
│  │ [头像] 我               │  │
│  │ 5000元  ↑ 3            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.2 排名列表组件

**组件**: `components/RankingList.vue`

```vue
<template>
  <view class="ranking-list">
    <!-- TOP3特殊展示 -->
    <view class="top3-container" v-if="showTop3">
      <view 
        v-for="item in top3List" 
        :key="item.rank" 
        class="top3-item"
        :class="`rank-${item.rank}`"
      >
        <text class="crown">{{ getCrown(item.rank) }}</text>
        <wd-avatar :src="item.avatarUrl" size="60px" />
        <text class="nickname">{{ item.nickname }}</text>
        <text class="score">{{ formatScore(item.score) }}</text>
        <RankingChange :change="item.change" />
      </view>
    </view>
    
    <!-- 普通排名列表 -->
    <view 
      v-for="item in restList" 
      :key="item.rank" 
      class="ranking-item"
    >
      <text class="rank">{{ item.rank }}</text>
      <wd-avatar :src="item.avatarUrl" size="40px" />
      <text class="nickname">{{ item.nickname }}</text>
      <text class="score">{{ formatScore(item.score) }}</text>
      <RankingChange :change="item.change" />
    </view>
    
    <wd-loading v-if="loading" />
    <wd-empty v-else-if="list.length === 0" description="暂无数据" />
  </view>
</template>
```

### 6.3 排名变化组件

**组件**: `components/RankingChange.vue`

```vue
<template>
  <view class="ranking-change" :class="changeClass">
    <wd-icon :name="changeIcon" size="14px" />
    <text v-if="change !== 0">{{ Math.abs(change) }}</text>
    <text v-else>0</text>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ change: number }>()

const changeClass = computed(() => {
  if (props.change > 0) return 'up'
  if (props.change < 0) return 'down'
  return 'same'
})

const changeIcon = computed(() => {
  if (props.change > 0) return 'arrow-up'
  if (props.change < 0) return 'arrow-down'
  return 'minus'
})
</script>

<style scoped>
.ranking-change.up { color: #07c160; }
.ranking-change.down { color: #fa5151; }
.ranking-change.same { color: #999; }
</style>
```

### 6.4 个人排名卡片

**组件**: `components/MyRankCard.vue`

```vue
<template>
  <view class="my-rank-card" v-if="myRank">
    <view class="card-header">
      <text class="title">我的排名</text>
    </view>
    <view class="card-body">
      <view class="rank-info">
        <text class="rank">第{{ myRank.rank }}名</text>
        <wd-avatar :src="userInfo.avatarUrl" size="50px" />
        <text class="nickname">{{ userInfo.nickname }}</text>
      </view>
      <view class="score-info">
        <text class="score-value">{{ formatScore(myRank.score) }}</text>
        <RankingChange :change="myRank.change" />
      </view>
    </view>
  </view>
</template>
```

### 6.5 管理后台排行榜管理

**组件**: `components/RankingManage.vue`

| 功能 | 组件 | 说明 |
|------|------|------|
| 榜单概览 | `el-statistic` | 各榜前三名 |
| 数据统计 | `el-table` | 用户积分统计 |
| 手动刷新 | `el-button` | 刷新缓存 |
| 历史排名 | `el-table` | 历史快照查询 |

---

## 7. TDD测试用例

> **TDD流程**: 先编写以下测试（🔴RED），再编写实现代码（🟢GREEN），最后重构（🔵REFACTOR）

### 7.1 单元测试（RankingService）

**测试文件**: `server/services/__tests__/ranking.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RankingService } from '~/server/services/ranking.service'
import { mockDb, mockRedis } from '../helpers/mocks'

describe('RankingService', () => {
  let service: RankingService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new RankingService()
  })

  describe('getActivityRanking', () => {
    it('✅ RED: 应从缓存返回数据', async () => {
      mockRedis.zrevrange.mockResolvedValue([
        ['user1', 100],
        ['user2', 80]
      ])
      
      const result = await service.getActivityRanking('all', 1, 20)
      
      expect(result.list).toHaveLength(2)
    })

    it('✅ GREEN: 缓存为空时应查询数据库', async () => {
      mockRedis.zrevrange.mockResolvedValue([])
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValue([
        { userId: 'user1', score: 100 },
        { userId: 'user2', score: 80 }
      ])
      
      const result = await service.getActivityRanking('all', 1, 20)
      
      expect(result.list).toHaveLength(2)
      expect(mockDb.select).toHaveBeenCalled()
    })
  })

  describe('calculateActiveScore', () => {
    it('✅ RED: 应正确计算活跃度分数', () => {
      const score = service.calculateActiveScore(5, 3, 2)
      // 5*10 + 3*20 + 2*30 = 50 + 60 + 60 = 170
      expect(score).toBe(170)
    })
  })

  describe('getRankChange', () => {
    it('✅ GREEN: 新用户排名变化为0', () => {
      expect(service.getRankChange(10, null)).toBe(0)
    })

    it('✅ GREEN: 排名上升返回正数', () => {
      // 上次第10名，现在第5名
      expect(service.getRankChange(5, 10)).toBe(5)
    })

    it('✅ GREEN: 排名下降返回负数', () => {
      // 上次第5名，现在第10名
      expect(service.getRankChange(10, 5)).toBe(-5)
    })
  })
})
```

### 7.2 集成测试

**测试文件**: `server/api/__tests__/ranking.test.ts`

```typescript
import { describe, it, expect } from 'vitest'

describe('GET /api/rankings/activity', () => {
  it('✅ GREEN: 返回排行榜数据', async () => {
    const res = await app.request('/api/rankings/activity?period=all')
    
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveProperty('list')
    expect(body.data).toHaveProperty('total')
  })

  it('✅ GREEN: 支持分页参数', async () => {
    const res = await app.request('/api/rankings/activity?page=2&pageSize=10')
    
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.page).toBe(2)
    expect(body.data.pageSize).toBe(10)
  })
})

describe('GET /api/rankings/activity (登录用户)', () => {
  it('✅ GREEN: 登录用户返回个人排名', async () => {
    const res = await app.request('/api/rankings/activity', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveProperty('myRank')
  })
})
```

### 7.3 E2E测试

```typescript
// tests/e2e/ranking.spec.ts
test('用户查看排行榜', async ({ page }) => {
  await page.goto('/pages/ranking/index')
  
  // 验证TOP3展示
  await expect(page.locator('.top3-container')).toBeVisible()
  await expect(page.locator('.top3-item').first()).toContainText('第1名')
  
  // 验证Tab切换
  await page.click('text=捐助榜')
  await expect(page.locator('.ranking-list')).toBeVisible()
  
  // 验证时间筛选
  await page.click('text=周榜')
  await expect(page.locator('.ranking-list')).toBeVisible()
})
```

---

## 8. AI实现提示词

### 8.1 后端代码生成提示词

```markdown
## 任务
实现排行榜模块的后端API和服务

## 技术栈
- Nuxt v4 (Nitro)
- Drizzle ORM
- PostgreSQL
- Redis
- TypeScript

## 需要实现的API
1. GET /api/rankings/activity - 活动积分榜
2. GET /api/rankings/donation - 捐助大爱榜
3. GET /api/rankings/active - 活跃之星榜

## Service方法
```typescript
// server/services/ranking.service.ts

// 获取活动积分榜
getActivityRanking(period: RankingPeriod, page: number, pageSize: number): Promise<RankingResponse>

// 获取捐助大爱榜
getDonationRanking(period: RankingPeriod, page: number, pageSize: number): Promise<RankingResponse>

// 获取活跃之星榜
getActiveRanking(period: RankingPeriod, page: number, pageSize: number): Promise<RankingResponse>

// 计算活跃度分数
calculateActiveScore(checkinCount: number, activityCount: number, donationCount: number): number

// 获取用户个人排名
getUserRank(userId: string, type: RankingType, period: RankingPeriod): Promise<RankingItem | null>

// 更新缓存
updateRankingCache(type: RankingType, period: RankingPeriod): Promise<void>
```

## 缓存策略
- 使用Redis Sorted Set存储排行榜
- TTL设置为1小时
- 定时任务每小时更新缓存

## 活跃度计算公式
```
活跃度分数 = 签到次数 × 10 + 参与活动数 × 20 + 捐助次数 × 30
```

## 输出文件
- server/api/rankings/activity.get.ts
- server/api/rankings/donation.get.ts
- server/api/rankings/active.get.ts
- server/services/ranking.service.ts
```

### 8.2 小程序端代码生成提示词

```markdown
## 任务
实现小程序端排行榜相关页面

## 技术栈
- Uniapp
- Vue 3
- Wot Design Uni
- TypeScript

## 页面文件
1. src/pages/ranking/index.vue - 排行榜首页
2. src/components/RankingList.vue - 排名列表组件
3. src/components/RankingChange.vue - 排名变化组件
4. src/components/MyRankCard.vue - 个人排名卡片

## 排行榜首页要求
1. 顶部Tab切换：活动榜/捐助榜/活跃榜
2. 时间筛选：周榜/月榜/总榜
3. TOP3特殊样式展示
4. 普通排名列表
5. 底部个人排名卡片（固定）

## API调用
- GET /api/rankings/activity?period={period}&page={page}
- GET /api/rankings/donation?period={period}&page={page}
- GET /api/rankings/active?period={period}&page={page}

## TOP3样式
- 第1名：🥇 金色
- 第2名：🥈 银色
- 第3名：🥉 铜色

## 输出文件
- src/pages/ranking/index.vue
- src/components/RankingList.vue
- src/components/RankingChange.vue
- src/components/MyRankCard.vue
```

### 8.3 Review检查清单

**后端Review**:
- [ ] 排行榜数据计算正确
- [ ] 缓存策略实现完整
- [ ] 分页逻辑正确
- [ ] 排名变化计算正确

**前端Review**:
- [ ] TOP3特殊样式正确
- [ ] Tab切换正常
- [ ] 个人排名卡片固定显示
- [ ] 排名变化箭头颜色正确

---

## 9. 相关文档

- [用户模块](../phase1/user.spec.md)
- [积分模块](../phase1/points.spec.md)
- [活动模块](../phase1/activity.spec.md)
- [签到模块](../phase1/checkin.spec.md)