# 统计模块规范

> **文件**: phase2/stats.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

统计模块为平台提供全面的数据统计和分析能力，支持：
- 平台整体数据概览（用户数、活动数、捐助金额等）
- 活动参与统计（签到率、满意度等）
- 用户活跃度分析（活跃用户数、留存率等）
- 捐助数据统计（捐助金额、捐助人数等）
- 时间维度分析（日、周、月、年）

### 1.2 业务价值

- 为运营决策提供数据支持
- 展示平台影响力和社会贡献
- 发现用户行为规律，优化运营策略
- 支持活动效果评估

### 1.3 依赖关系

- 依赖: 所有业务模块（user、activity、checkin、donation、points）
- 被依赖: 管理后台首页

### 1.4 统计维度

| 维度 | 数据源 | 说明 |
|------|----------|------|
| 用户统计 | users表 | 注册数、活跃数、新增数 |
| 活动统计 | activities表 | 发布数、进行中、已完成 |
| 签到统计 | checkins表 | 签到次数、签到率 |
| 捐助统计 | donations表 | 捐助金额、捐助人数 |
| 积分统计 | point_accounts表 | 积分分布、荣誉等级分布 |

---

## 2. 数据模型

### 2.1 统计快照表 stats_snapshots

用于存储定时统计结果，避免实时计算压力：

```sql
CREATE TABLE stats_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type VARCHAR(30) NOT NULL,        -- 快照类型: daily/weekly/monthly
  snapshot_date DATE NOT NULL,               -- 快照日期
  metrics JSONB NOT NULL,                    -- 统计指标JSON
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_stats_snapshots_unique 
  ON stats_snapshots(snapshot_type, snapshot_date);
```

### 2.2 统计指标JSON结构

```json
{
  "users": {
    "total": 1000,
    "newToday": 50,
    "activeToday": 200,
    "activeWeek": 500,
    "activeMonth": 800
  },
  "activities": {
    "total": 100,
    "published": 20,
    "ongoing": 30,
    "completed": 50
  },
  "checkins": {
    "total": 500,
    "today": 30,
    "week": 150,
    "month": 400
  },
  "donations": {
    "totalAmount": 50000.00,
    "totalCount": 200,
    "todayAmount": 1000.00,
    "todayCount": 5
  },
  "points": {
    "totalDistributed": 10000,
    "avgActivityPoints": 50,
    "avgDonationPoints": 30,
    "honorDistribution": {
      "bronze": 100,
      "silver": 50,
      "gold": 20,
      "diamond": 5
    }
  }
}
```

### 2.3 TypeScript类型

```typescript
// 快照类型
type SnapshotType = 'daily' | 'weekly' | 'monthly'

// 用户统计
interface UserStats {
  total: number
  newToday: number
  newWeek: number
  newMonth: number
  activeToday: number
  activeWeek: number
  activeMonth: number
}

// 活动统计
interface ActivityStats {
  total: number
  published: number
  ongoing: number
  completed: number
  avgParticipants: number
  avgCheckinRate: number
}

// 签到统计
interface CheckinStats {
  total: number
  today: number
  week: number
  month: number
  avgPerActivity: number
}

// 捐助统计
interface DonationStats {
  totalAmount: number
  totalCount: number
  todayAmount: number
  todayCount: number
  avgAmount: number
  topDonors: TopDonor[]
}

// 积分统计
interface PointsStats {
  totalDistributed: number
  avgActivityPoints: number
  avgDonationPoints: number
  honorDistribution: Record<string, number>
}

// 综合统计响应
interface StatsOverview {
  users: UserStats
  activities: ActivityStats
  checkins: CheckinStats
  donations: DonationStats
  points: PointsStats
  updatedAt: string
}

// 趋势数据
interface TrendData {
  date: string
  value: number
}

// 趋势响应
interface TrendResponse {
  metric: string
  period: 'day' | 'week' | 'month'
  data: TrendData[]
}
```

---

## 3. API接口

### 3.1 获取统计概览

**接口**: `GET /api/admin/stats/overview`  
**描述**: 获取平台综合统计数据  
**权限**: 管理员  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "users": {
      "total": 1000,
      "newToday": 50,
      "activeToday": 200
    },
    "activities": {
      "total": 100,
      "ongoing": 30,
      "completed": 50
    },
    "checkins": {
      "total": 500,
      "today": 30
    },
    "donations": {
      "totalAmount": 50000.00,
      "totalCount": 200
    },
    "points": {
      "totalDistributed": 10000,
      "avgActivityPoints": 50
    },
    "updatedAt": "2026-05-26T10:00:00Z"
  }
}
```

### 3.2 获取用户趋势

**接口**: `GET /api/admin/stats/trend/users`  
**描述**: 获取用户增长趋势  
**权限**: 管理员  
**状态**: [TODO]

**查询参数**:
```
?period=week&metric=newUsers
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "metric": "newUsers",
    "period": "week",
    "data": [
      { "date": "2026-05-20", "value": 30 },
      { "date": "2026-05-21", "value": 45 },
      { "date": "2026-05-22", "value": 50 },
      { "date": "2026-05-23", "value": 35 },
      { "date": "2026-05-24", "value": 40 },
      { "date": "2026-05-25", "value": 55 },
      { "date": "2026-05-26", "value": 50 }
    ]
  }
}
```

### 3.3 获取捐助趋势

**接口**: `GET /api/admin/stats/trend/donations`  
**描述**: 获取捐助金额趋势  
**权限**: 管理员  
**状态**: [TODO]

### 3.4 获取活动趋势

**接口**: `GET /api/admin/stats/trend/activities`  
**描述**: 获取活动参与趋势  
**权限**: 管理员  
**状态**: [TODO]

### 3.5 获取排行榜统计

**接口**: `GET /api/admin/stats/ranking`  
**描述**: 获取各榜单TOP10统计  
**权限**: 管理员  
**状态**: [TODO]

### 3.6 获取活动详情统计

**接口**: `GET /api/admin/stats/activity/:id`  
**描述**: 获取单个活动的详细统计  
**权限**: 管理员  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "activityId": "uuid",
    "title": "养老院慰问",
    "participants": 50,
    "checkins": 45,
    "checkinRate": 0.9,
    "avgPoints": 2,
    "totalPoints": 90,
    "satisfactionRate": 0.95,
    "participantDistribution": {
      "byGender": { "male": 20, "female": 30 },
      "byAge": { "18-25": 15, "26-35": 20, "36-50": 10, "50+": 5 },
      "byHonorLevel": { "bronze": 20, "silver": 15, "gold": 10 }
    }
  }
}
```

### 3.7 小程序端统计展示

**接口**: `GET /api/stats/public`  
**描述**: 获取公开统计数据（用于小程序首页展示）  
**权限**: 公开  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalUsers": 1000,
    "totalActivities": 100,
    "totalDonations": 50000.00,
    "totalCheckins": 500,
    "totalVolunteerHours": 2000
  }
}
```

---

## 4. 业务逻辑

### 4.1 统计计算逻辑

**用户统计计算**:
```typescript
async function calculateUserStats(): Promise<UserStats> {
  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  return {
    total: await db.select().from(users).count(),
    newToday: await db.select().from(users)
      .where(gte(users.createdAt, todayStart)).count(),
    newWeek: await db.select().from(users)
      .where(gte(users.createdAt, weekStart)).count(),
    newMonth: await db.select().from(users)
      .where(gte(users.createdAt, monthStart)).count(),
    activeToday: await db.select().from(users)
      .where(gte(users.lastActiveAt, todayStart)).count(),
    activeWeek: await db.select().from(users)
      .where(gte(users.lastActiveAt, weekStart)).count(),
    activeMonth: await db.select().from(users)
      .where(gte(users.lastActiveAt, monthStart)).count(),
  }
}
```

**捐助统计计算**:
```typescript
async function calculateDonationStats(): Promise<DonationStats> {
  const approvedDonations = await db.select()
    .from(donations)
    .where(eq(donations.status, 'approved'))

  const totalAmount = approvedDonations.reduce((sum, d) => sum + d.amount, 0)
  
  return {
    totalAmount,
    totalCount: approvedDonations.length,
    avgAmount: totalAmount / approvedDonations.length || 0,
    todayAmount: await calculateTodayDonationAmount(),
    todayCount: await calculateTodayDonationCount(),
    topDonors: await getTopDonors(10)
  }
}
```

### 4.2 快照生成流程

```
定时任务触发（每日凌晨1点）
    │
    ▼
计算各项统计指标
    │
    ▼
生成JSON格式数据
    │
    ▼
存入stats_snapshots表
    │
    ▼
更新Redis缓存
```

**定时任务配置**:
```typescript
// server/tasks/stats-snapshot.ts
export default defineTask({
  name: 'stats:snapshot:daily',
  schedule: '0 1 * * *',  // 每日凌晨1点
  handler: async () => {
    const metrics = await calculateAllMetrics()
    
    await db.insert(statsSnapshots).values({
      snapshotType: 'daily',
      snapshotDate: new Date(),
      metrics: metrics
    })
    
    // 更新缓存
    await redis.set('stats:overview:latest', JSON.stringify(metrics), 'EX', 3600)
  }
})
```

### 4.3 趋势数据生成

```typescript
async function generateTrendData(
  metric: string,
  period: 'day' | 'week' | 'month',
  days: number = 30
): Promise<TrendData[]> {
  const snapshots = await db.select()
    .from(statsSnapshots)
    .where(gte(statsSnapshots.snapshotDate, subDays(new Date(), days)))
    .orderBy(statsSnapshots.snapshotDate)

  return snapshots.map(s => ({
    date: format(s.snapshotDate, 'yyyy-MM-dd'),
    value: s.metrics[metric] || 0
  }))
}
```

---

## 5. 安全要求

### 5.1 权限控制

- 管理后台统计接口需要管理员权限
- 公开统计接口只返回汇总数据，不暴露敏感信息
- 用户个人数据统计需要本人或管理员权限

### 5.2 数据脱敏

- 公开统计不显示具体用户信息
- 年龄分布使用区间而非具体年龄
- 地区分布使用城市级别

### 5.3 缓存安全

- 统计数据缓存设置合理过期时间
- 避免缓存穿透和缓存击穿
- 使用Redis锁防止并发计算

---

## 6. 前端实现要求

### 6.1 管理后台统计页面

**页面**: `/pages/admin/stats/index.vue`

```
┌─────────────────────────────────────────────────────┐
│  数据统计概览                    更新时间: 10:00     │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 用户总数  │ │ 活动总数  │ │ 签到总数  │ │捐助总额  ││
│  │  1000    │ │   100    │ │   500    │ │ ¥50000  ││
│  │ ↑50今日  │ │ ↑5今日   │ │ ↑30今日  │ │ ↑¥1000 ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────────────────┤
│  用户增长趋势                                        │
│  ┌───────────────────────────────────────────────┐  │
│  │          📈 折线图                            │  │
│  │  50 ─┬─────────────────────────────────────  │  │
│  │      │      /\                              │  │
│  │  30 ─┤     /  \    /\                       │  │
│  │      │    /    \  /  \                      │  │
│  │  10 ─┴───/──────\/────\──────────────────  │  │
│  │      05/20 05/22 05/24 05/26               │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  荣誉等级分布                                        │
│  ┌───────────────────────────────────────────────┐  │
│  │  🌱 新手: 825人 (82.5%)                      │  │
│  │  🥉 铜牌: 100人 (10.0%)                      │  │
│  │  🥈 银牌: 50人  (5.0%)                       │  │
│  │  🥇 金牌: 20人  (2.0%)                       │  │
│  │  💎 钗石: 5人   (0.5%)                       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 6.2 统计卡片组件

**组件**: `components/StatsCard.vue`

```vue
<template>
  <div class="stats-card">
    <div class="card-header">
      <el-icon :size="24"><component :is="icon" /></el-icon>
      <span class="title">{{ title }}</span>
    </div>
    <div class="card-body">
      <div class="main-value">
        <span class="value">{{ formatValue(value) }}</span>
        <span class="unit">{{ unit }}</span>
      </div>
      <div class="sub-value" v-if="subValue">
        <span :class="trendClass">{{ trendIcon }} {{ subValue }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: number
  unit?: string
  subValue?: string
  icon: string
  trend?: 'up' | 'down' | 'same'
}>()
</script>
```

### 6.3 趋势图表组件

**组件**: `components/TrendChart.vue`

```vue
<template>
  <div class="trend-chart">
    <div class="chart-header">
      <span class="title">{{ title }}</span>
      <el-radio-group v-model="period" size="small">
        <el-radio-button label="day">日</el-radio-button>
        <el-radio-button label="week">周</el-radio-button>
        <el-radio-button label="month">月</el-radio-button>
      </el-radio-group>
    </div>
    <div class="chart-body">
      <v-chart :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import VChart from 'vue-echarts'

const props = defineProps<{
  title: string
  data: TrendData[]
}>()

const chartOption = computed(() => ({
  xAxis: {
    type: 'category',
    data: props.data.map(d => d.date)
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    type: 'line',
    data: props.data.map(d => d.value),
    smooth: true,
    areaStyle: { opacity: 0.3 }
  }]
}))
</script>
```

### 6.4 小程序首页统计展示

**组件**: `components/PublicStats.vue`

```vue
<template>
  <view class="public-stats">
    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-value">{{ totalUsers }}</text>
        <text class="stat-label">志愿者</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ totalActivities }}</text>
        <text class="stat-label">公益活动</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ formatMoney(totalDonations) }}</text>
        <text class="stat-label">捐助金额</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ totalCheckins }}</text>
        <text class="stat-label">签到人次</text>
      </view>
    </view>
  </view>
</template>
```

---

## 7. TDD测试用例

### 7.1 单元测试

```typescript
// tests/unit/stats.service.test.ts
describe('StatsService', () => {
  describe('calculateUserStats', () => {
    it('✅ RED: 应正确计算用户总数', async () => {
      mockDb.select.mockReturnThis()
      mockDb.from.mockResolvedValue([{ count: 1000 }])
      
      const stats = await service.calculateUserStats()
      
      expect(stats.total).toBe(1000)
    })

    it('✅ GREEN: 应正确计算今日新增用户', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValue([{ count: 50 }])
      
      const stats = await service.calculateUserStats()
      
      expect(stats.newToday).toBe(50)
    })
  })

  describe('calculateDonationStats', () => {
    it('✅ GREEN: 应正确计算捐助总额', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValue([
        { amount: 1000 },
        { amount: 2000 },
        { amount: 500 }
      ])
      
      const stats = await service.calculateDonationStats()
      
      expect(stats.totalAmount).toBe(3500)
    })

    it('✅ GREEN: 应正确计算平均捐助金额', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValue([
        { amount: 1000 },
        { amount: 2000 }
      ])
      
      const stats = await service.calculateDonationStats()
      
      expect(stats.avgAmount).toBe(1500)
    })
  })

  describe('generateTrendData', () => {
    it('✅ GREEN: 应返回正确格式的趋势数据', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValue([
        { snapshotDate: '2026-05-20', metrics: { newUsers: 30 } },
        { snapshotDate: '2026-05-21', metrics: { newUsers: 45 } }
      ])
      
      const trend = await service.generateTrendData('newUsers', 'day', 7)
      
      expect(trend).toHaveLength(2)
      expect(trend[0].date).toBe('2026-05-20')
      expect(trend[0].value).toBe(30)
    })
  })
})
```

### 7.2 集成测试

```typescript
// tests/integration/stats.api.test.ts
describe('Stats API', () => {
  describe('GET /api/admin/stats/overview', () => {
    it('✅ RED: 非管理员不能访问', async () => {
      const res = await app.request('/api/admin/stats/overview', {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      expect(res.status).toBe(403)
    })

    it('✅ GREEN: 管理员可获取统计概览', async () => {
      const res = await app.request('/api/admin/stats/overview', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.data).toHaveProperty('users')
      expect(body.data).toHaveProperty('activities')
    })
  })

  describe('GET /api/stats/public', () => {
    it('✅ GREEN: 公开接口无需认证', async () => {
      const res = await app.request('/api/stats/public')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.data).toHaveProperty('totalUsers')
    })
  })
})
```

---

## 8. AI实现提示词

### 8.1 后端代码生成提示词

```markdown
## 任务
实现统计模块的后端API和定时任务

## 技术栈
- Nuxt v4 (Nitro)
- Drizzle ORM
- PostgreSQL
- Redis
- TypeScript

## 需要实现的API
1. GET /api/admin/stats/overview - 统计概览
2. GET /api/admin/stats/trend/users - 用户趋势
3. GET /api/admin/stats/trend/donations - 捐助趋势
4. GET /api/admin/stats/trend/activities - 活动趋势
5. GET /api/admin/stats/ranking - 排行榜统计
6. GET /api/admin/stats/activity/:id - 活动详情统计
7. GET /api/stats/public - 公开统计

## 定时任务
- 每日凌晨1点生成统计快照
- 存入stats_snapshots表
- 更新Redis缓存

## Service方法
```typescript
// server/services/stats.service.ts

calculateUserStats(): Promise<UserStats>
calculateActivityStats(): Promise<ActivityStats>
calculateDonationStats(): Promise<DonationStats>
calculatePointsStats(): Promise<PointsStats>
generateTrendData(metric: string, period: string, days: number): Promise<TrendData[]>
getActivityDetailStats(activityId: string): Promise<ActivityDetailStats>
```

## 输出文件
- server/api/admin/stats/overview.get.ts
- server/api/admin/stats/trend/[type].get.ts
- server/api/admin/stats/activity/[id].get.ts
- server/api/stats/public.get.ts
- server/services/stats.service.ts
- server/tasks/stats-snapshot.ts
```

### 8.2 管理后台代码生成提示词

```markdown
## 任务
实现管理后台统计页面

## 技术栈
- Nuxt v4
- Element Plus
- ECharts
- TypeScript

## 页面文件
1. pages/admin/stats/index.vue - 统计概览页
2. components/StatsCard.vue - 统计卡片组件
3. components/TrendChart.vue - 趋势图表组件

## 统计概览页要求
1. 顶部4个统计卡片（用户、活动、签到、捐助）
2. 用户增长趋势折线图
3. 捐助金额趋势折线图
4. 荣誉等级分布饼图
5. 时间筛选（日/周/月）

## API调用
- GET /api/admin/stats/overview
- GET /api/admin/stats/trend/users
- GET /api/admin/stats/trend/donations

## 输出文件
- pages/admin/stats/index.vue
- components/StatsCard.vue
- components/TrendChart.vue
```

---

## 9. 相关文档

- [用户模块](../phase1/user.spec.md)
- [活动模块](../phase1/activity.spec.md)
- [捐助模块](../phase1/donation.spec.md)
- [积分模块](../phase1/points.spec.md)
- [排行榜模块](../phase2/ranking.spec.md)