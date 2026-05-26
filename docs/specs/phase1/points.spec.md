# 积分模块规范

> **文件**: phase1/points.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

积分模块是众爱联盟平台的核心信誉系统，采用"双积分制"：
- **活动积分**：通过参与公益活动获得，体现用户的志愿服务贡献
- **捐助积分**：通过捐款捐物获得，体现用户的爱心捐助贡献
- **积分仅作为个人信誉展示，不可消耗、不可兑换**
- 积分累计值用于排行榜排序和荣誉等级评定

### 1.2 业务价值

- 量化志愿者的公益贡献，建立个人公益信誉档案
- 激励用户持续参与公益活动
- 通过排行榜和荣誉等级展示公益成就
- 营造正向的公益社区氛围

### 1.3 积分流转图

```
┌─────────────────────────────────────────────────────────────┐
│                      公益信誉积分体系                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【积分获取】                                                │
│  ┌──────────────┐                                           │
│  │ 活动签到      │──────▶ 活动积分（累计展示）               │
│  │ 捐助审核通过  │──────▶ 捐助积分（累计展示）               │
│  └──────────────┘                                           │
│                                                             │
│  【信誉展示】                                                │
│  ┌──────────────────────────────────────────┐             │
│  │  用户                                      │             │
│  │  ├── 活动积分: 累计50分（参与25次活动）    │             │
│  │  ├── 捐助积分: 累计30分（捐助15次）        │             │
│  │  ├── 荣誉等级: 银牌志愿者 ⭐⭐             │             │
│  │  └── 排行榜: 全市第128名                   │             │
│  └──────────────────────────────────────────┘             │
│                                                             │
│  ⚠️ 积分仅用于信誉展示，不可消耗、不可兑换                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 数据模型

### 2.1 积分账户表 point_accounts

```sql
CREATE TABLE point_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  activity_points_total INT DEFAULT 0,        -- 活动积分累计（信誉值）
  donation_points_total INT DEFAULT 0,      -- 捐助积分累计（信誉值）
  total_points INT DEFAULT 0,               -- 总积分（用于排行榜）
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 积分流水表 point_transactions

```sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  point_type VARCHAR(20) NOT NULL,          -- activity / donation
  amount INT NOT NULL,                       -- 获得积分数量
  source_type VARCHAR(30) NOT NULL,          -- checkin / donation / admin_adjust
  source_id UUID,                           -- 关联来源ID
  description VARCHAR(200),                  -- 变动描述
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 说明：积分仅累计，不记录余额变化，只记录获得记录

-- 索引
CREATE INDEX idx_pt_user_id ON point_transactions(user_id);
CREATE INDEX idx_pt_point_type ON point_transactions(point_type);
CREATE INDEX idx_pt_source ON point_transactions(source_type, source_id);
CREATE INDEX idx_pt_created_at ON point_transactions(created_at DESC);
```

### 2.3 积分规则表 point_rules

```sql
CREATE TABLE point_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type VARCHAR(30) NOT NULL,           -- 规则类型
  point_type VARCHAR(20) NOT NULL,          -- 积分类型
  points_per_unit INT NOT NULL,             -- 每单位积分值
  unit_desc VARCHAR(50),                    -- 单位描述
  min_amount DECIMAL(12,2) DEFAULT 0,      -- 最低金额门槛
  max_amount DECIMAL(12,2),                 -- 最高金额限制
  is_active BOOLEAN DEFAULT true,            -- 是否启用
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 规则类型枚举
-- activity_checkin: 活动签到
-- donation_money: 捐款
-- donation_material: 捐物
```

### 2.4 TypeScript类型

```typescript
// 积分账户（信誉档案）
interface PointAccount {
  id: string
  userId: string
  activityPointsTotal: number    // 活动积分累计（信誉值）
  donationPointsTotal: number    // 捐助积分累计（信誉值）
  totalPoints: number            // 总积分 = 活动 + 捐助
  createdAt: string
  updatedAt: string
}

// 积分流水（获得记录）
interface PointTransaction {
  id: string
  userId: string
  pointType: PointType          // 'activity' | 'donation'
  amount: number                // 获得积分数量
  sourceType: SourceType
  sourceId: string | null
  description: string
  createdAt: string
}

// 积分类型
type PointType = 'activity' | 'donation'

// 来源类型（仅获取场景）
type SourceType = 'checkin' | 'donation' | 'admin_adjust'

// 积分规则
interface PointRule {
  id: string
  ruleType: string
  pointType: PointType
  pointsPerUnit: number
  unitDesc: string
  minAmount: number
  maxAmount: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 查询积分响应（信誉档案）
interface PointsResponse {
  activity: number      // 活动积分累计
  donation: number      // 捐助积分累计
  total: number         // 总积分
  honorLevel: number    // 荣誉等级
  rank?: number         // 排行榜名次（如有）
}

// 积分流水列表查询
interface TransactionListQuery {
  page?: number
  pageSize?: number
  pointType?: PointType
  changeType?: ChangeType
  startDate?: string
  endDate?: string
}
```

---

## 3. API接口

### 3.1 获取积分余额

**接口**: `GET /api/points/balance`  
**描述**: 获取当前用户的积分余额  
**权限**: 登录用户  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "activity": 50,      // 活动积分累计
    "donation": 30,      // 捐助积分累计
    "total": 80,         // 总积分
    "honorLevel": 2,     // 荣誉等级：银牌志愿者
    "rank": 128          // 全市排名
  }
}
```

### 3.2 获取积分流水

**接口**: `GET /api/points/transactions`  
**描述**: 获取积分流水记录（分页）  
**权限**: 登录用户  
**状态**: [TODO]

**查询参数**:
```
?page=1&pageSize=20&pointType=activity&changeType=earn
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
        "pointType": "activity",
        "changeType": "earn",
        "amount": 2,
        "balanceAfter": 30,
        "sourceType": "checkin",
        "sourceId": "checkin-uuid",
        "description": "参与「养老院慰问」活动签到",
        "createdAt": "2026-05-26T10:00:00Z"
      },
      {
        "id": "uuid",
        "pointType": "activity",
        "changeType": "spend",
        "amount": 5,
        "balanceAfter": 28,
        "sourceType": "market_post",
        "sourceId": "post-uuid",
        "description": "发布「求职帖」消耗积分",
        "createdAt": "2026-05-25T14:00:00Z"
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

### 3.3 获取积分规则

**接口**: `GET /api/points/rules`  
**描述**: 获取积分规则列表  
**权限**: 公开  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "ruleType": "activity_checkin",
      "pointType": "activity",
      "pointsPerUnit": 2,
      "unitDesc": "每次签到",
      "minAmount": 0,
      "isActive": true
    },
    {
      "id": "uuid",
      "ruleType": "donation_money",
      "pointType": "donation",
      "pointsPerUnit": 1,
      "unitDesc": "每100元",
      "minAmount": 100,
      "isActive": true
    }
  ]
}
```

### 3.4 创建积分规则（管理员）

**接口**: `POST /api/points/rules`  
**描述**: 创建积分规则  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "ruleType": "donation_money",
  "pointType": "donation",
  "pointsPerUnit": 1,
  "unitDesc": "每100元",
  "minAmount": 100,
  "maxAmount": 1000
}
```

### 3.5 更新积分规则（管理员）

**接口**: `PATCH /api/points/rules/:id`  
**描述**: 更新积分规则  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "pointsPerUnit": 2,
  "isActive": false
}
```

### 3.6 手动调整积分（管理员）

**接口**: `POST /api/points/adjust`  
**描述**: 管理员手动调整用户积分  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "userId": "user-uuid",
  "pointType": "activity",
  "amount": 10,
  "description": "后台奖励：积极参与活动"
}
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "积分调整成功",
  "data": {
    "newBalance": 40
  }
}
```

---

## 4. 业务逻辑

### 4.1 积分发放

```typescript
async function grantPoints(
  userId: string,
  options: {
    pointType: 'activity' | 'donation'
    amount: number
    source: string
    sourceId?: string
    description: string
  }
): Promise<PointTransaction> {
  // 1. 获取当前账户
  const account = await getOrCreateAccount(userId)
  
  // 2. 计算新累计值
  const totalField = options.pointType === 'activity'
    ? 'activity_points_total'
    : 'donation_points_total'
  const newTotal = account[totalField] + options.amount
  const newTotalPoints = account.activityPointsTotal + account.donationPointsTotal + options.amount
  
  // 3. 原子更新账户（仅累计，不扣减）
  await db.transaction(async (tx) => {
    await tx.update(pointAccounts)
      .set({
        [totalField]: newTotal,
        total_points: newTotalPoints,
        updatedAt: new Date()
      })
      .where(eq(pointAccounts.userId, userId))
    
    // 4. 记录获得流水
    await tx.insert(pointTransactions).values({
      id: uuid(),
      userId,
      pointType: options.pointType,
      amount: options.amount,
      sourceType: options.source,
      sourceId: options.sourceId,
      description: options.description,
      createdAt: new Date()
    })
  })
  
  return { /* transaction */ }
}
```

---

## 5. 安全要求

### 5.1 积分操作事务性

- 所有积分操作必须在事务中执行
- 余额更新和流水记录必须原子完成
- 并发情况下使用数据库锁保证一致性

### 5.2 权限控制

| 接口 | 权限要求 |
|------|----------|
| GET /api/points/balance | 登录用户（只能查看自己） |
| GET /api/points/transactions | 登录用户（只能查看自己） |
| GET /api/points/rules | 公开 |
| POST /api/points/rules | 管理员 |
| PATCH /api/points/rules/:id | 管理员 |
| POST /api/points/adjust | 管理员 |

### 5.3 防刷机制

| 风险 | 防护措施 |
|------|----------|
| 重复发放积分 | 检查sourceId是否已使用 |
| 积分溢出 | 设置单次最大发放量（100） |
| 恶意刷分 | 管理员审核 + 异常检测 |

---

---

## 5. 前端实现要求

### 5.1 积分展示页

**页面**: `/pages/points/index.vue`

```
┌─────────────────────────────────┐
│  我的信誉积分                     │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │      🏆 信誉积分          │  │
│  │                           │  │
│  │  ┌──────────┬──────────┐ │  │
│  │  │ 活动积分  │ 捐助积分  │ │  │
│  │  │   50     │   30     │ │  │
│  │  │  信誉展示  │  信誉展示  │ │  │
│  │  └──────────┴──────────┘ │  │
│  │                           │  │
│  │  总积分: 80    排名: 128  │  │
│  │  🥈 银牌志愿者            │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  积分规则说明                     │
│  · 每次活动签到: +2积分          │
│  · 每100元捐助: +1积分           │
│  · 积分仅作为信誉累计展示         │
│  · 不可消耗、不可兑换            │
├─────────────────────────────────┤
│  积分获得记录                     │
│  ┌───────────────────────────┐  │
│  │ 📅 06/01  活动签到        │  │
│  │ 「养老院慰问」  +2积分     │  │
│  ├───────────────────────────┤  │
│  │ 📅 05/28  捐助审核通过    │  │
│  │ 捐助100元    +1积分       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 5.2 积分卡片组件

**组件**: `components/PointsCard.vue`

```vue
<template>
  <view class="points-card">
    <view class="card-header">
      <text class="title">{{ title }}</text>
      <text class="level-badge">{{ levelName }}</text>
    </view>
    
    <view class="card-body">
      <view class="points-display">
        <view class="points-item">
          <text class="points-value">{{ activityPoints }}</text>
          <text class="points-label">活动积分</text>
        </view>
        <view class="divider"></view>
        <view class="points-item">
          <text class="points-value">{{ donationPoints }}</text>
          <text class="points-label">捐助积分</text>
        </view>
      </view>
      
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-label">总积分</text>
          <text class="stat-value">{{ totalPoints }}</text>
        </view>
        <view class="stat-item" v-if="rank">
          <text class="stat-label">排名</text>
          <text class="stat-value">#{{ rank }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  activityPoints: number
  donationPoints: number
  totalPoints: number
  rank?: number
  levelName: string
}>()
</script>
```

### 5.3 积分流水列表组件

**组件**: `components/PointsHistoryList.vue`

```vue
<template>
  <view class="points-history">
    <view 
      v-for="item in list" 
      :key="item.id" 
      class="history-item"
    >
      <view class="item-icon">
        <text>{{ item.pointType === 'activity' ? '🏃' : '💝' }}</text>
      </view>
      <view class="item-content">
        <text class="item-title">{{ item.description }}</text>
        <text class="item-time">{{ formatTime(item.createdAt) }}</text>
      </view>
      <view class="item-points" :class="item.pointType">
        +{{ item.amount }}
      </view>
    </view>
    
    <wd-loading v-if="loading" />
    <wd-empty v-else-if="list.length === 0" description="暂无积分记录" />
  </view>
</template>
```

### 5.4 荣誉等级展示

**组件**: `components/HonorLevelBadge.vue`

```vue
<template>
  <view class="honor-badge" :class="`level-${level}`">
    <text class="icon">{{ levelConfig.icon }}</text>
    <text class="name">{{ levelConfig.name }}</text>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ level: number }>()

const levelConfig = {
  0: { icon: '🌱', name: '新手上路' },
  1: { icon: '🥉', name: '铜牌志愿者' },
  2: { icon: '🥈', name: '银牌志愿者' },
  3: { icon: '🥇', name: '金牌志愿者' },
  4: { icon: '💎', name: '钻石志愿者' },
}

const levelName = computed(() => levelConfig[props.level]?.name || '新手上路')
</script>

<style scoped>
.honor-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}
.honor-badge.level-0 { background: #f5f5f5; }
.honor-badge.level-1 { background: #fff7e6; color: #8b5a2b; }
.honor-badge.level-2 { background: #e8e8e8; color: #666; }
.honor-badge.level-3 { background: #fff4d6; color: #b8860b; }
.honor-badge.level-4 { background: #e6f3ff; color: #1890ff; }
</style>
```

### 5.5 积分规则说明页

**页面**: `/pages/points/rules.vue`

```
┌─────────────────────────────────┐
│  积分规则                        │
├─────────────────────────────────┤
│                                 │
│  【积分说明】                     │
│  积分是您参与公益活动的信誉累计，  │
│  用于展示您的爱心贡献和荣誉等级。  │
│                                 │
│  ⚠️ 重要提示:                    │
│  积分仅作为信誉展示，不可消耗、   │
│  不可兑换。                      │
│                                 │
│  【积分规则】                     │
│  ┌───────────────────────────┐  │
│  │ 🏃 活动签到                │  │
│  │ 每次签到可获得2积分         │  │
│  ├───────────────────────────┤  │
│  │ 💝 捐助审核通过             │  │
│  │ 每100元捐助可获得1积分      │  │
│  └───────────────────────────┘  │
│                                 │
│  【荣誉等级】                     │
│  🌱 新手上路: 0积分              │
│  🥉 铜牌志愿者: ≥10积分          │
│  🥈 银牌志愿者: ≥50积分          │
│  🥇 金牌志愿者: ≥100积分         │
│  💎 钻石志愿者: ≥200积分         │
│                                 │
└─────────────────────────────────┘
```

---

## 6. 管理后台实现

### 6.1 积分管理页面

**组件**: `components/PointsManage.vue`

| 功能 | 组件 | 说明 |
|------|------|------|
| 积分列表 | `el-table` | 用户积分总览 |
| 积分调整 | `el-dialog` | 手动增减积分 |
| 规则配置 | `el-form` | 积分规则设置 |
| 流水查询 | `el-table` | 积分变动明细 |

### 6.2 积分调整弹窗

```vue
<template>
  <el-dialog v-model="dialogVisible" title="调整积分">
    <el-form :model="form" label-width="100px">
      <el-form-item label="用户">
        <el-input v-model="form.userId" placeholder="用户ID" />
      </el-form-item>
      <el-form-item label="积分类型">
        <el-select v-model="form.pointType">
          <el-option label="活动积分" value="activity" />
          <el-option label="捐助积分" value="donation" />
        </el-select>
      </el-form-item>
      <el-form-item label="调整数量">
        <el-input-number v-model="form.amount" :min="-100" :max="100" />
      </el-form-item>
      <el-form-item label="原因">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
```

---

## 7. TDD测试用例

> **TDD流程**: 先编写以下测试（🔴RED），再编写实现代码（🟢GREEN），最后重构（🔵REFACTOR）

### 7.1 单元测试（PointsService）

**测试文件**: `server/services/__tests__/points.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PointsService } from '~/server/services/points.service'
import { mockDb } from '../helpers/mocks'
import { mockUser } from '../helpers/fixtures'

describe('PointsService', () => {
  let service: PointsService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new PointsService()
  })

  describe('grantPoints', () => {
    it('✅ RED: 应拒绝积分为0的请求', async () => {
      await expect(
        service.grantPoints('uuid', {
          pointType: 'activity',
          amount: 0,
          source: 'checkin',
          description: '测试',
        })
      ).rejects.toThrow('积分数量必须大于0')
    })

    it('✅ GREEN: 应成功发放积分并更新累计值', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{
        id: 'account-uuid',
        userId: 'test-uuid',
        activityPointsTotal: 20,
        donationPointsTotal: 10,
        totalPoints: 30,
      }])
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()
      mockDb.insert.mockReturnThis()
      mockDb.values.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ id: 'tx-uuid' }])

      const result = await service.grantPoints('test-uuid', {
        pointType: 'activity',
        amount: 5,
        source: 'checkin',
        sourceId: 'checkin-uuid',
        description: '参与「测试活动」签到',
      })

      expect(result.pointType).toBe('activity')
      expect(result.amount).toBe(5)
      expect(mockDb.update).toHaveBeenCalled()
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('✅ RED: 应拒绝单次超过100的积分', async () => {
      await expect(
        service.grantPoints('uuid', {
          pointType: 'activity',
          amount: 101,
          source: 'admin_adjust',
          description: '测试',
        })
      ).rejects.toThrow('单次积分操作不能超过100')
    })

    it('✅ RED: 应拒绝负数积分', async () => {
      await expect(
        service.grantPoints('uuid', {
          pointType: 'activity',
          amount: -5,
          source: 'admin_adjust',
          description: '测试',
        })
      ).rejects.toThrow('积分数量必须大于0')
    })
  })

  describe('getUserPoints', () => {
    it('✅ GREEN: 应返回用户信誉档案', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{
        activityPointsTotal: 50,
        donationPointsTotal: 30,
        totalPoints: 80,
      }])

      const result = await service.getUserPoints('test-uuid')

      expect(result.activity).toBe(50)
      expect(result.donation).toBe(30)
      expect(result.total).toBe(80)
    })

    it('✅ GREEN: 应正确计算荣誉等级', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{
        activityPointsTotal: 100,
        donationPointsTotal: 100,
        totalPoints: 200,
      }])

      const result = await service.getUserPoints('test-uuid')

      expect(result.honorLevel).toBe(4) // 钻石志愿者
    })
  })

  describe('adjustPoints', () => {
    it('✅ RED: 非管理员不能调整积分', async () => {
      await expect(
        service.adjustPoints('test-uuid', {
          pointType: 'activity',
          amount: 10,
          operatorId: 'normal-user-uuid',
          description: '测试',
        })
      ).rejects.toThrow('无权操作')
    })

    it('✅ GREEN: 管理员可调整积分', async () => {
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ role: 'admin' }])
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()
      mockDb.insert.mockReturnThis()
      mockDb.values.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ id: 'tx-uuid' }])

      const result = await service.adjustPoints('target-uuid', {
        pointType: 'activity',
        amount: 10,
        operatorId: 'admin-uuid',
        description: '奖励',
      })

      expect(result.amount).toBe(10)
    })
  })
})
```

### 7.2 集成测试

**测试文件**: `server/api/__tests__/points.test.ts`

```typescript
import { describe, it, expect } from 'vitest'

describe('GET /api/points/balance', () => {
  it('✅ RED: 未登录返回401', async () => {
    const res = await app.request('/api/points/balance')
    expect(res.status).toBe(401)
  })

  it('✅ GREEN: 登录用户返回积分余额', async () => {
    const res = await app.request('/api/points/balance', {
      headers: { Authorization: `Bearer ${token}` }
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveProperty('activity')
    expect(body.data).toHaveProperty('donation')
    expect(body.data).toHaveProperty('total')
  })
})

describe('POST /api/points/adjust', () => {
  it('✅ RED: 非管理员返回403', async () => {
    const res = await app.request('/api/points/adjust', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ userId: 'uuid', amount: 10 })
    })
    expect(res.status).toBe(403)
  })

  it('✅ GREEN: 管理员可调整积分', async () => {
    const res = await app.request('/api/points/adjust', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ 
        userId: 'target-uuid', 
        pointType: 'activity',
        amount: 10,
        description: '奖励测试' 
      })
    })
    expect(res.status).toBe(200)
  })
})
```

### 7.3 E2E测试

```typescript
// tests/e2e/points.spec.ts
test('用户查看积分和信誉档案', async ({ page }) => {
  await page.goto('/pages/points/index')
  
  // 验证积分卡片显示
  await expect(page.locator('.activity-points')).toContainText('50')
  await expect(page.locator('.donation-points')).toContainText('30')
  
  // 验证荣誉等级
  await expect(page.locator('.honor-badge')).toContainText('银牌志愿者')
  
  // 验证排名
  await expect(page.locator('.rank')).toContainText('#128')
})
```

---

## 8. AI实现提示词

### 8.1 后端代码生成提示词

```markdown
## 任务
实现积分模块的后端API

## 技术栈
- Nuxt v4 (Nitro)
- Drizzle ORM
- PostgreSQL
- TypeScript
- zod

## Schema文件
- server/db/schema/point-accounts.ts
- server/db/schema/point-transactions.ts
- server/db/schema/point-rules.ts

## 需要实现的API
1. GET /api/points/balance - 获取积分余额
2. GET /api/points/transactions - 获取积分流水
3. GET /api/points/rules - 获取积分规则（公开）
4. POST /api/points/rules - 创建积分规则（管理员）
5. PATCH /api/points/rules/:id - 更新积分规则（管理员）
6. POST /api/points/adjust - 手动调整积分（管理员）

## 核心逻辑
1. 积分仅累计，不可消耗
2. grantPoints作为公共方法，由活动签到、捐助审核等模块调用
3. 重复发放需检查sourceId
4. 需要管理员权限的接口使用requireAdmin中间件

## 荣誉等级计算
- 0分: 新手上路 🌱
- ≥10分: 铜牌志愿者 🥉
- ≥50分: 银牌志愿者 🥈
- ≥100分: 金牌志愿者 🥇
- ≥200分: 钻石志愿者 💎

## 输出文件
- server/api/points/balance.get.ts
- server/api/points/transactions.get.ts
- server/api/points/rules/index.get.ts
- server/api/points/rules/index.post.ts
- server/api/points/rules/[id].patch.ts
- server/api/points/adjust.post.ts
- server/services/points.service.ts
```

### 8.2 小程序端代码生成提示词

```markdown
## 任务
实现小程序端积分相关页面

## 技术栈
- Uniapp
- Vue 3
- Wot Design Uni
- TypeScript

## 页面文件
1. src/pages/points/index.vue - 积分展示页
2. src/pages/points/rules.vue - 积分规则页
3. src/components/PointsCard.vue - 积分卡片组件
4. src/components/PointsHistoryList.vue - 积分流水列表组件
5. src/components/HonorLevelBadge.vue - 荣誉等级徽章

## 积分展示页要求
1. 顶部显示总积分和排名
2. 中间显示活动积分和捐助积分
3. 荣誉等级徽章展示
4. 积分获得记录列表
5. 跳转到积分规则说明页

## API调用
- GET /api/points/balance - 获取积分余额
- GET /api/points/transactions - 获取积分流水

## 输出文件
- src/pages/points/index.vue
- src/pages/points/rules.vue
- src/components/PointsCard.vue
- src/components/PointsHistoryList.vue
- src/components/HonorLevelBadge.vue
```

### 8.3 Review检查清单

**后端Review**:
- [ ] 积分操作使用事务
- [ ] 累计值原子更新
- [ ] 重复发放有sourceId检查
- [ ] 错误码正确（400、401、403）
- [ ] 积分仅累计不可消耗
- [ ] 管理员权限检查正确

**前端Review**:
- [ ] 积分卡片样式美观
- [ ] 荣誉等级图标正确
- [ ] 积分流水列表正常加载
- [ ] 积分规则说明清晰
- [ ] 响应式布局适配

---

## 9. 相关文档

- [用户模块](../phase1/user.spec.md)
- [活动模块](../phase1/activity.spec.md)
- [签到模块](../phase1/checkin.spec.md)
- [捐助模块](../phase1/donation.spec.md)
