# 荣誉商城模块规范

> **文件**: phase3/mall.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

荣誉商城模块为平台志愿者提供荣誉物品展示和领取功能，支持：
- 荣誉物品展示（电子徽章、荣誉证书、纪念品等）
- 基于积分等级的荣誉解锁
- 荣誉物品申请和领取
- 荣誉记录展示

**重要说明**: 本模块不涉及积分消耗，荣誉物品基于用户累计积分等级自动解锁，用户可免费领取已解锁的荣誉物品。

### 1.2 业务价值

- 为志愿者提供荣誉激励
- 增强用户参与感和归属感
- 展示志愿者贡献历程
- 建立荣誉体系和激励机制

### 1.3 依赖关系

- 依赖: 用户模块(user)、积分模块(points)
- 被依赖: 荣誉记录模块(order)

### 1.4 荣誉物品类型

| 类型 | 说明 | 解锁条件 |
|------|------|----------|
| 电子徽章 | 在个人主页展示的徽章 | 达到对应荣誉等级 |
| 荣誉证书 | 电子版荣誉证书 | 达到对应荣誉等级 |
| 纪念品 | 实体纪念品（需线下领取） | 达到指定积分+参与活动数 |
| 专属头衔 | 特殊显示头衔 | 达到钻石等级 |

---

## 2. 数据模型

### 2.1 荣誉物品表 honor_items

```sql
CREATE TABLE honor_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,                  -- 物品名称
  type VARCHAR(20) NOT NULL,                   -- 类型: badge/certificate/gift/title
  description VARCHAR(500),                    -- 描述
  image_url VARCHAR(500),                      -- 图片URL
  unlock_type VARCHAR(20) NOT NULL,            -- 解锁类型: level/activity_count/donation_amount
  unlock_value INT NOT NULL,                   -- 解锁值
  unlock_level INT DEFAULT 0,                  -- 解锁荣誉等级(0-4)
  unlock_activity_count INT DEFAULT 0,         -- 解锁活动参与数
  unlock_donation_amount DECIMAL(10,2) DEFAULT 0, -- 解锁捐助金额
  is_active BOOLEAN DEFAULT true,              -- 是否上架
  stock INT DEFAULT -1,                        -- 库存(-1表示无限)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_honor_items_type ON honor_items(type);
CREATE INDEX idx_honor_items_active ON honor_items(is_active);
```

### 2.2 荣誉领取记录表 honor_records

```sql
CREATE TABLE honor_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  item_id UUID NOT NULL REFERENCES honor_items(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending/issued/received
  issue_time TIMESTAMPTZ,                      -- 发放时间
  receive_time TIMESTAMPTZ,                    -- 领取时间(实体物品)
  receive_location VARCHAR(200),               -- 领取地点(实体物品)
  certificate_no VARCHAR(50),                  -- 证书编号
  note VARCHAR(200),                           -- 备注
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_honor_records_user ON honor_records(user_id);
CREATE INDEX idx_honor_records_item ON honor_records(item_id);
CREATE INDEX idx_honor_records_status ON honor_records(status);
CREATE UNIQUE INDEX idx_honor_records_unique ON honor_records(user_id, item_id);
```

### 2.3 TypeScript类型

```typescript
// 荣誉物品类型
type HonorItemType = 'badge' | 'certificate' | 'gift' | 'title'

// 解锁类型
type UnlockType = 'level' | 'activity_count' | 'donation_amount' | 'special'

// 领取状态
type HonorRecordStatus = 'pending' | 'issued' | 'received'

// 荣誉物品
interface HonorItem {
  id: string
  name: string
  type: HonorItemType
  description: string | null
  imageUrl: string | null
  unlockType: UnlockType
  unlockValue: number
  unlockLevel: number
  unlockActivityCount: number
  unlockDonationAmount: number
  isActive: boolean
  stock: number
  createdAt: string
  updatedAt: string
}

// 荣誉物品展示（含解锁状态）
interface HonorItemDisplay extends HonorItem {
  isUnlocked: boolean        // 是否已解锁
  isClaimed: boolean         // 是否已领取
  canClaim: boolean          // 是否可领取
  userProgress: number       // 用户当前进度
  progressPercent: number    // 进度百分比
}

// 荣誉领取记录
interface HonorRecord {
  id: string
  userId: string
  itemId: string
  itemName: string
  itemType: HonorItemType
  status: HonorRecordStatus
  issueTime: string | null
  receiveTime: string | null
  receiveLocation: string | null
  certificateNo: string | null
  note: string | null
  createdAt: string
}

// 领取请求
interface ClaimHonorRequest {
  itemId: string
  receiveLocation?: string   // 实体物品领取地点
}
```

---

## 3. API接口

### 3.1 获取荣誉物品列表

**接口**: `GET /api/honor/items`  
**描述**: 获取荣誉物品列表（含用户解锁状态）  
**权限**: 登录用户  
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
        "name": "铜牌志愿者徽章",
        "type": "badge",
        "description": "累计积分达到10分获得",
        "imageUrl": "https://cdn.example.com/badge/bronze.png",
        "unlockType": "level",
        "unlockLevel": 1,
        "isUnlocked": true,
        "isClaimed": false,
        "canClaim": true,
        "userProgress": 50,
        "progressPercent": 100
      },
      {
        "id": "uuid",
        "name": "银牌志愿者徽章",
        "type": "badge",
        "unlockLevel": 2,
        "isUnlocked": false,
        "isClaimed": false,
        "canClaim": false,
        "userProgress": 50,
        "progressPercent": 50
      }
    ],
    "total": 10
  }
}
```

### 3.2 获取荣誉物品详情

**接口**: `GET /api/honor/items/:id`  
**描述**: 获取单个荣誉物品详情  
**权限**: 登录用户  
**状态**: [TODO]

### 3.3 领取荣誉物品

**接口**: `POST /api/honor/items/:id/claim`  
**描述**: 领取荣誉物品（不消耗积分）  
**权限**: 登录用户  
**状态**: [TODO]

**请求体** (实体物品):
```json
{
  "receiveLocation": "北京市朝阳区XXX"
}
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "领取成功",
  "data": {
    "recordId": "uuid",
    "itemName": "铜牌志愿者徽章",
    "status": "issued",
    "certificateNo": "ZA-BR-2026-00001"
  }
}
```

### 3.4 获取我的荣誉记录

**接口**: `GET /api/honor/my-records`  
**描述**: 获取用户已领取的荣誉记录  
**权限**: 登录用户  
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
        "itemName": "铜牌志愿者徽章",
        "itemType": "badge",
        "status": "issued",
        "certificateNo": "ZA-BR-2026-00001",
        "issueTime": "2026-05-26T10:00:00Z"
      }
    ],
    "total": 5
  }
}
```

### 3.5 管理后台 - 创建荣誉物品

**接口**: `POST /api/admin/honor/items`  
**描述**: 创建荣誉物品  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "name": "金牌志愿者证书",
  "type": "certificate",
  "description": "累计积分达到100分获得",
  "imageUrl": "https://cdn.example.com/certificate/gold.png",
  "unlockType": "level",
  "unlockLevel": 3,
  "stock": -1
}
```

### 3.6 管理后台 - 更新荣誉物品

**接口**: `PATCH /api/admin/honor/items/:id`  
**描述**: 更新荣誉物品  
**权限**: 管理员  
**状态**: [TODO]

### 3.7 管理后台 - 删除荣誉物品

**接口**: `DELETE /api/admin/honor/items/:id`  
**描述**: 删除荣誉物品  
**权限**: 管理员  
**状态**: [TODO]

### 3.8 管理后台 - 荣誉记录管理

**接口**: `GET /api/admin/honor/records`  
**描述**: 获取荣誉领取记录列表  
**权限**: 管理员  
**状态**: [TODO]

### 3.9 管理后台 - 发放荣誉物品

**接口**: `PATCH /api/admin/honor/records/:id/issue`  
**描述**: 发放荣誉物品（实体物品）  
**权限**: 管理员  
**状态**: [TODO]

---

## 4. 业务逻辑

### 4.1 解锁判定逻辑

```typescript
// 判断用户是否解锁荣誉物品
function checkUnlockStatus(user: User, item: HonorItem): boolean {
  const { totalPoints, honorLevel } = user.pointAccount
  
  switch (item.unlockType) {
    case 'level':
      // 基于荣誉等级解锁
      return honorLevel >= item.unlockLevel
    
    case 'activity_count':
      // 基于活动参与数解锁
      const activityCount = user.checkins.length
      return activityCount >= item.unlockActivityCount
    
    case 'donation_amount':
      // 基于捐助金额解锁
      const donationAmount = user.donations.reduce((sum, d) => sum + d.amount, 0)
      return donationAmount >= item.unlockDonationAmount
    
    case 'special':
      // 特殊解锁（如活动专属）
      return user.specialUnlockItems.includes(item.id)
    
    default:
      return false
  }
}
```

### 4.2 领取流程

```
用户请求领取荣誉物品
    │
    ▼
检查是否已解锁
    │
    ├── 未解锁 ──▶ 返回错误：未达到解锁条件
    │
    └── 已解锁 ──▶ 检查是否已领取
                      │
                      ├── 已领取 ──▶ 返回错误：已领取
                      │
                      └── 未领取 ──▶ 检查库存
                                      │
                                      ├── 无库存 ──▶ 返回错误：库存不足
                                      │
                                      └── 有库存 ──▶ 创建领取记录
                                                      │
                                                      ▼
                                                  生成证书编号
                                                      │
                                                      ▼
                                                  返回成功
```

### 4.3 证书编号生成

```typescript
// 证书编号格式: ZA-{类型缩写}-{年份}-{序号}
function generateCertificateNo(itemType: HonorItemType): string {
  const typeCode = {
    badge: 'BD',
    certificate: 'CT',
    gift: 'GT',
    title: 'TL'
  }
  
  const year = new Date().getFullYear()
  const seq = await getNextSequence(itemType)
  
  return `ZA-${typeCode[itemType]}-${year}-${seq.toString().padStart(5, '0')}`
}

// 示例: ZA-CT-2026-00001
```

### 4.4 进度计算

```typescript
// 计算用户解锁进度
function calculateProgress(user: User, item: HonorItem): {
  progress: number
  percent: number
} {
  let current = 0
  let target = 0
  
  switch (item.unlockType) {
    case 'level':
      current = user.pointAccount.totalPoints
      target = HONOR_LEVEL_THRESHOLD[item.unlockLevel]
      break
    
    case 'activity_count':
      current = user.checkins.length
      target = item.unlockActivityCount
      break
    
    case 'donation_amount':
      current = user.donations.reduce((sum, d) => sum + d.amount, 0)
      target = item.unlockDonationAmount
      break
  }
  
  return {
    progress: current,
    percent: Math.min(100, Math.floor((current / target) * 100))
  }
}
```

---

## 5. 安全要求

### 5.1 防重复领取

```typescript
// 使用数据库唯一索引防止重复领取
CREATE UNIQUE INDEX idx_honor_records_unique ON honor_records(user_id, item_id);
```

### 5.2 解锁状态验证

- 领取前必须验证解锁状态
- 解锁状态实时计算，不缓存
- 防止绕过解锁条件直接领取

### 5.3 库存控制

```typescript
// 领取时检查库存
async function checkStock(itemId: string): Promise<boolean> {
  const item = await db.query.honorItems.findFirst({
    where: eq(honorItems.id, itemId)
  })
  
  // -1表示无限库存
  if (item.stock === -1) return true
  
  const claimedCount = await db.query.honorRecords.findMany({
    where: eq(honorRecords.itemId, itemId)
  }).length
  
  return claimedCount < item.stock
}
```

---

## 6. 前端实现要求

### 6.1 荣誉商城页面

**页面**: `/pages/honor/index.vue`

```
┌─────────────────────────────────┐
│  荣誉商城                        │
├─────────────────────────────────┤
│  [徽章] [证书] [纪念品] [头衔]   │ ← Tab切换
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 🥉 铜牌志愿者徽章          │  │
│  │                           │  │
│  │ [徽章图片]                │  │
│  │                           │  │
│  │ 累计积分≥10分解锁          │  │
│  │ 进度: 50/10 (100%)        │  │
│  │                           │  │
│  │ [已解锁] [领取徽章]        │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 🥈 银牌志愿者徽章          │  │
│  │                           │  │
│  │ [徽章图片]                │  │
│  │                           │  │
│  │ 累计积分≥50分解锁          │  │
│  │ 进度: 50/50 (100%)        │  │
│  │                           │  │
│  │ [已解锁] [已领取]          │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 🥇 金牌志愿者徽章          │  │
│  │                           │  │
│  │ [徽章图片]                │  │
│  │                           │  │
│  │ 累计积分≥100分解锁         │  │
│  │ 进度: 50/100 (50%)        │  │
│  │                           │  │
│  │ [未解锁] 继续努力          │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.2 荣誉物品卡片组件

**组件**: `components/HonorItemCard.vue`

```vue
<template>
  <view class="honor-item-card">
    <view class="item-image">
      <image :src="item.imageUrl" mode="aspectFit" />
      <view class="unlock-badge" v-if="item.isUnlocked">
        <text>已解锁</text>
      </view>
    </view>
    
    <view class="item-info">
      <text class="item-name">{{ item.name }}</text>
      <text class="item-desc">{{ item.description }}</text>
      
      <view class="progress-bar">
        <wd-progress 
          :percent="item.progressPercent" 
          :stroke-width="8"
        />
        <text class="progress-text">
          {{ item.userProgress }}/{{ item.unlockValue }}
        </text>
      </view>
    </view>
    
    <view class="item-action">
      <wd-button 
        v-if="item.canClaim && !item.isClaimed"
        type="primary"
        @click="claimItem"
      >
        领取
      </wd-button>
      <wd-button 
        v-else-if="item.isClaimed"
        disabled
      >
        已领取
      </wd-button>
      <wd-button 
        v-else
        disabled
      >
        未解锁
      </wd-button>
    </view>
  </view>
</template>
```

### 6.3 我的荣誉页面

**页面**: `/pages/honor/my-records.vue`

```
┌─────────────────────────────────┐
│  我的荣誉                        │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 🥉 铜牌志愿者徽章          │  │
│  │ 证书编号: ZA-BD-2026-00001 │  │
│  │ 领取时间: 2026-05-26       │  │
│  │ [查看证书]                 │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 📜 银牌志愿者证书          │  │
│  │ 证书编号: ZA-CT-2026-00005 │  │
│  │ 领取时间: 2026-05-20       │  │
│  │ [查看证书]                 │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.4 管理后台荣誉物品管理

**组件**: `components/HonorItemManage.vue`

| 功能 | 组件 | 说明 |
|------|------|------|
| 物品列表 | `el-table` | 所有荣誉物品 |
| 创建物品 | `el-dialog` | 创建荣誉物品表单 |
| 编辑物品 | `el-dialog` | 编辑荣誉物品表单 |
| 库存管理 | `el-input-number` | 设置库存数量 |

---

## 7. TDD测试用例

### 7.1 单元测试

```typescript
// tests/unit/honor.service.test.ts
describe('HonorService', () => {
  describe('checkUnlockStatus', () => {
    it('✅ RED: 未达到等级不应解锁', () => {
      const user = { honorLevel: 0, totalPoints: 5 }
      const item = { unlockType: 'level', unlockLevel: 1 }
      
      const result = service.checkUnlockStatus(user, item)
      
      expect(result).toBe(false)
    })

    it('✅ GREEN: 达到等级应解锁', () => {
      const user = { honorLevel: 1, totalPoints: 15 }
      const item = { unlockType: 'level', unlockLevel: 1 }
      
      const result = service.checkUnlockStatus(user, item)
      
      expect(result).toBe(true)
    })
  })

  describe('claimHonorItem', () => {
    it('✅ RED: 未解锁不能领取', async () => {
      mockDb.query.honorItems.findFirst.mockResolvedValue({
        unlockLevel: 2
      })
      mockDb.query.pointAccounts.findFirst.mockResolvedValue({
        honorLevel: 1
      })
      
      await expect(
        service.claimHonorItem('item-uuid', 'user-uuid')
      ).rejects.toThrow('未达到解锁条件')
    })

    it('✅ GREEN: 已解锁可领取', async () => {
      mockDb.query.honorItems.findFirst.mockResolvedValue({
        id: 'item-uuid',
        unlockLevel: 1,
        stock: -1
      })
      mockDb.query.pointAccounts.findFirst.mockResolvedValue({
        honorLevel: 2
      })
      mockDb.query.honorRecords.findMany.mockResolvedValue([])
      mockDb.insert.mockReturnThis()
      mockDb.values.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ id: 'record-uuid' }])
      
      const result = await service.claimHonorItem('item-uuid', 'user-uuid')
      
      expect(result.recordId).toBeDefined()
    })

    it('✅ RED: 已领取不能重复领取', async () => {
      mockDb.query.honorRecords.findFirst.mockResolvedValue({
        id: 'existing-record'
      })
      
      await expect(
        service.claimHonorItem('item-uuid', 'user-uuid')
      ).rejects.toThrow('已领取该荣誉物品')
    })
  })

  describe('generateCertificateNo', () => {
    it('✅ GREEN: 应生成正确格式的证书编号', async () => {
      const result = await service.generateCertificateNo('certificate')
      
      expect(result).toMatch(/^ZA-CT-2026-\d{5}$/)
    })
  })
})
```

### 7.2 集成测试

```typescript
// tests/integration/honor.api.test.ts
describe('Honor API', () => {
  describe('GET /api/honor/items', () => {
    it('✅ GREEN: 返回荣誉物品列表含解锁状态', async () => {
      const res = await app.request('/api/honor/items', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.data.list[0]).toHaveProperty('isUnlocked')
      expect(body.data.list[0]).toHaveProperty('canClaim')
    })
  })

  describe('POST /api/honor/items/:id/claim', () => {
    it('✅ RED: 未登录不能领取', async () => {
      const res = await app.request('/api/honor/items/uuid/claim', {
        method: 'POST'
      })
      expect(res.status).toBe(401)
    })

    it('✅ GREEN: 已解锁可领取', async () => {
      // 先设置用户积分达到解锁条件
      await setUserPoints(userId, 50)
      
      const res = await app.request('/api/honor/items/bronze-badge/claim', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      expect(res.status).toBe(200)
    })
  })
})
```

---

## 8. AI实现提示词

### 8.1 后端代码生成提示词

```markdown
## 任务
实现荣誉商城模块的后端API

## 技术栈
- Nuxt v4 (Nitro)
- Drizzle ORM
- PostgreSQL
- TypeScript

## 重要说明
荣誉物品不消耗积分，基于用户累计积分等级自动解锁

## 需要实现的API
1. GET /api/honor/items - 获取荣誉物品列表（含解锁状态）
2. GET /api/honor/items/:id - 获取荣誉物品详情
3. POST /api/honor/items/:id/claim - 领取荣誉物品
4. GET /api/honor/my-records - 获取我的荣誉记录
5. POST /api/admin/honor/items - 创建荣誉物品
6. PATCH /api/admin/honor/items/:id - 更新荣誉物品
7. DELETE /api/admin/honor/items/:id - 删除荣誉物品
8. GET /api/admin/honor/records - 获取荣誉记录列表

## 解锁判定逻辑
- level类型: 用户荣誉等级 >= 物品解锁等级
- activity_count类型: 用户活动参与数 >= 物品解锁活动数
- donation_amount类型: 用户捐助金额 >= 物品解锁金额

## 输出文件
- server/api/honor/items/index.get.ts
- server/api/honor/items/[id].get.ts
- server/api/honor/items/[id]/claim.post.ts
- server/api/honor/my-records.get.ts
- server/api/admin/honor/items/index.post.ts
- server/api/admin/honor/items/[id].patch.ts
- server/api/admin/honor/items/[id].delete.ts
- server/services/honor.service.ts
```

### 8.2 小程序端代码生成提示词

```markdown
## 任务
实现小程序端荣誉商城页面

## 技术栈
- Uniapp
- Vue 3
- Wot Design Uni
- TypeScript

## 页面文件
1. src/pages/honor/index.vue - 荣誉商城页
2. src/pages/honor/my-records.vue - 我的荣誉页
3. src/components/HonorItemCard.vue - 荣誉物品卡片组件

## 荣誉商城页要求
1. Tab切换：徽章/证书/纪念品/头衔
2. 物品卡片展示解锁状态和进度
3. 已解锁可领取，未解锁显示进度
4. 已领取显示"已领取"状态

## API调用
- GET /api/honor/items
- POST /api/honor/items/:id/claim
- GET /api/honor/my-records

## 输出文件
- src/pages/honor/index.vue
- src/pages/honor/my-records.vue
- src/components/HonorItemCard.vue
```

---

## 9. 相关文档

- [用户模块](../phase1/user.spec.md)
- [积分模块](../phase1/points.spec.md)
- [荣誉记录模块](./order.spec.md)