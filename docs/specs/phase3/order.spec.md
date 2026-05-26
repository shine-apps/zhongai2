# 荣誉记录模块规范

> **文件**: phase3/order.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

荣誉记录模块用于管理用户领取荣誉物品的记录，支持：
- 荣誉领取记录查询
- 实体物品发放管理
- 电子证书生成和展示
- 荣誉记录统计

**重要说明**: 本模块记录用户免费领取的荣誉物品，不涉及积分消耗或交易。

### 1.2 业务价值

- 记录用户荣誉历程
- 支持实体物品发放管理
- 提供荣誉证书展示
- 统计荣誉发放数据

### 1.3 依赖关系

- 依赖: 用户模块(user)、荣誉商城模块(mall)
- 被依赖: 无

### 1.4 记录类型

| 类型 | 状态流程 | 说明 |
|------|----------|------|
| 电子徽章 | pending → issued | 自动发放 |
| 荣誉证书 | pending → issued | 自动发放+生成证书 |
| 纪念品 | pending → issued → received | 需线下领取 |
| 专属头衔 | pending → issued | 自动生效 |

---

## 2. 数据模型

### 2.1 荣誉领取记录表 honor_records

```sql
CREATE TABLE honor_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  item_id UUID NOT NULL REFERENCES honor_items(id),
  item_name VARCHAR(100) NOT NULL,             -- 物品名称（冗余存储）
  item_type VARCHAR(20) NOT NULL,              -- 物品类型（冗余存储）
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending/issued/received
  certificate_no VARCHAR(50),                  -- 证书编号
  certificate_url VARCHAR(500),                -- 证书图片URL
  issue_time TIMESTAMPTZ,                      -- 发放时间
  receive_time TIMESTAMPTZ,                    -- 领取时间（实体物品）
  receive_location VARCHAR(200),               -- 预约领取地点
  receive_contact VARCHAR(100),                -- 预约联系电话
  issued_by UUID REFERENCES users(id),         -- 发放操作人
  note VARCHAR(200),                           -- 备注
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_honor_records_user ON honor_records(user_id);
CREATE INDEX idx_honor_records_item ON honor_records(item_id);
CREATE INDEX idx_honor_records_status ON honor_records(status);
CREATE INDEX idx_honor_records_type ON honor_records(item_type);
CREATE UNIQUE INDEX idx_honor_records_unique ON honor_records(user_id, item_id);
```

### 2.2 TypeScript类型

```typescript
// 领取状态
type HonorRecordStatus = 'pending' | 'issued' | 'received'

// 荣誉记录
interface HonorRecord {
  id: string
  userId: string
  itemId: string
  itemName: string
  itemType: HonorItemType
  status: HonorRecordStatus
  certificateNo: string | null
  certificateUrl: string | null
  issueTime: string | null
  receiveTime: string | null
  receiveLocation: string | null
  receiveContact: string | null
  issuedBy: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

// 荣誉记录详情（含用户信息）
interface HonorRecordDetail extends HonorRecord {
  user: {
    id: string
    nickname: string
    avatarUrl: string | null
    phone: string
  }
  item: {
    id: string
    name: string
    imageUrl: string | null
  }
}

// 预约领取请求
interface ReserveReceiveRequest {
  location: string
  contactPhone: string
}

// 发放请求
interface IssueHonorRequest {
  recordId: string
  note?: string
}

// 统计数据
interface HonorStats {
  totalRecords: number
  pendingCount: number
  issuedCount: number
  receivedCount: number
  byType: Record<HonorItemType, number>
}
```

---

## 3. API接口

### 3.1 获取我的荣誉记录

**接口**: `GET /api/honor/my-records`  
**描述**: 获取当前用户的荣誉领取记录  
**权限**: 登录用户  
**状态**: [TODO]

**查询参数**:
```
?type=badge&status=issued&page=1&pageSize=20
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
        "itemName": "铜牌志愿者徽章",
        "itemType": "badge",
        "status": "issued",
        "certificateNo": "ZA-BD-2026-00001",
        "certificateUrl": "https://cdn.example.com/cert/badge-001.png",
        "issueTime": "2026-05-26T10:00:00Z",
        "createdAt": "2026-05-26T09:30:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

### 3.2 获取荣誉记录详情

**接口**: `GET /api/honor/records/:id`  
**描述**: 获取单条荣誉记录详情  
**权限**: 登录用户（本人或管理员）  
**状态**: [TODO]

### 3.3 预约领取实体物品

**接口**: `POST /api/honor/records/:id/reserve`  
**描述**: 预约实体物品领取地点和时间  
**权限**: 登录用户（本人）  
**状态**: [TODO]

**请求体**:
```json
{
  "location": "北京市朝阳区XXX公益中心",
  "contactPhone": "13800138000"
}
```

### 3.4 管理后台 - 获取荣誉记录列表

**接口**: `GET /api/admin/honor/records`  
**描述**: 获取所有荣誉记录（支持筛选）  
**权限**: 管理员  
**状态**: [TODO]

**查询参数**:
```
?status=pending&type=gift&page=1&pageSize=20
```

### 3.5 管理后台 - 发放荣誉物品

**接口**: `PATCH /api/admin/honor/records/:id/issue`  
**描述**: 发放荣誉物品（将状态改为issued）  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "note": "现场发放"
}
```

### 3.6 管理后台 - 确认领取

**接口**: `PATCH /api/admin/honor/records/:id/receive`  
**描述**: 确认实体物品已被领取  
**权限**: 管理员  
**状态**: [TODO]

### 3.7 管理后台 - 获取荣誉统计

**接口**: `GET /api/admin/honor/stats`  
**描述**: 获取荣誉发放统计数据  
**权限**: 管理员  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalRecords": 500,
    "pendingCount": 50,
    "issuedCount": 400,
    "receivedCount": 50,
    "byType": {
      "badge": 200,
      "certificate": 150,
      "gift": 100,
      "title": 50
    }
  }
}
```

---

## 4. 业务逻辑

### 4.1 状态流转

```
领取请求创建
    │
    ▼
┌─────────────┐
│   pending   │  待发放
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       │ 电子物品自动发放                  │ 实体物品需人工发放
       │                                  │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│   issued    │                    │   issued    │  已发放待领取
│  (已完成)   │                    └──────┬──────┘
└─────────────┘                           │
                                          │ 用户现场领取
                                          ▼
                                   ┌─────────────┐
                                   │  received   │  已领取
                                   │  (已完成)   │
                                   └─────────────┘
```

### 4.2 自动发放逻辑

```typescript
// 电子物品领取后自动发放
async function autoIssueElectronicItem(record: HonorRecord): Promise<void> {
  if (record.itemType === 'badge' || record.itemType === 'certificate' || record.itemType === 'title') {
    // 生成证书编号
    const certificateNo = await generateCertificateNo(record.itemType)
    
    // 生成证书图片（如果是证书类型）
    let certificateUrl = null
    if (record.itemType === 'certificate') {
      certificateUrl = await generateCertificateImage(record, certificateNo)
    }
    
    // 更新状态为已发放
    await db.update(honorRecords)
      .set({
        status: 'issued',
        certificateNo,
        certificateUrl,
        issueTime: new Date()
      })
      .where(eq(honorRecords.id, record.id))
  }
}
```

### 4.3 证书生成

```typescript
// 生成荣誉证书图片
async function generateCertificateImage(
  record: HonorRecord,
  certificateNo: string
): Promise<string> {
  // 使用模板生成证书
  const template = await getCertificateTemplate(record.itemType)
  
  const certificateData = {
    name: record.user.nickname,
    honorName: record.itemName,
    certificateNo,
    issueDate: formatDate(new Date(), 'YYYY年MM月DD日'),
    organization: '众爱联盟公益平台'
  }
  
  // 使用图片生成服务
  const imageUrl = await imageService.generateCertificate(template, certificateData)
  
  return imageUrl
}
```

### 4.4 实体物品发放流程

```
用户预约领取
    │
    ▼
记录领取地点和联系方式
    │
    ▼
管理员查看待发放列表
    │
    ▼
管理员发放物品
    │
    ▼
状态变为issued
    │
    ▼
用户现场领取
    │
    ▼
管理员确认领取
    │
    ▼
状态变为received
```

---

## 5. 安全要求

### 5.1 权限控制

- 用户只能查看自己的荣誉记录
- 用户只能预约自己的实体物品领取
- 管理员可以查看和操作所有记录

### 5.2 防重复领取

```typescript
// 使用数据库唯一索引
CREATE UNIQUE INDEX idx_honor_records_unique ON honor_records(user_id, item_id);

// 领取前检查
async function checkDuplicate(userId: string, itemId: string): Promise<boolean> {
  const existing = await db.query.honorRecords.findFirst({
    where: and(
      eq(honorRecords.userId, userId),
      eq(honorRecords.itemId, itemId)
    )
  })
  return !!existing
}
```

### 5.3 状态验证

```typescript
// 发放前验证状态
async function validateIssue(recordId: string): Promise<void> {
  const record = await db.query.honorRecords.findFirst({
    where: eq(honorRecords.id, recordId)
  })
  
  if (!record) {
    throw new BusinessError(404, '记录不存在')
  }
  
  if (record.status !== 'pending') {
    throw new BusinessError(400, '该记录已发放')
  }
}
```

---

## 6. 前端实现要求

### 6.1 我的荣誉页面

**页面**: `/pages/honor/my-records.vue`

```
┌─────────────────────────────────┐
│  我的荣誉                        │
├─────────────────────────────────┤
│  [全部] [徽章] [证书] [纪念品]   │ ← Tab切换
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 🥉 铜牌志愿者徽章          │  │
│  │                           │  │
│  │ [徽章图片]                │  │
│  │                           │  │
│  │ 证书编号: ZA-BD-2026-00001 │  │
│  │ 发放时间: 2026-05-26       │  │
│  │                           │  │
│  │ [查看详情] [展示在主页]    │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 🎁 纪念品 - 志愿者专属T恤  │  │
│  │                           │  │
│  │ [纪念品图片]              │  │
│  │                           │  │
│  │ 状态: 待领取              │  │
│  │ 预约地点: 北京市朝阳区XXX  │  │
│  │                           │  │
│  │ [修改预约] [取消预约]      │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.2 荣誉记录卡片组件

**组件**: `components/HonorRecordCard.vue`

```vue
<template>
  <view class="honor-record-card">
    <view class="record-image">
      <image :src="record.item.imageUrl || record.certificateUrl" mode="aspectFit" />
    </view>
    
    <view class="record-info">
      <view class="record-header">
        <text class="item-name">{{ record.itemName }}</text>
        <wd-tag :type="statusType">{{ statusText }}</wd-tag>
      </view>
      
      <text class="certificate-no" v-if="record.certificateNo">
        证书编号: {{ record.certificateNo }}
      </text>
      
      <text class="issue-time" v-if="record.issueTime">
        发放时间: {{ formatDate(record.issueTime) }}
      </text>
      
      <view class="receive-info" v-if="record.itemType === 'gift' && record.status === 'issued'">
        <text class="location">预约地点: {{ record.receiveLocation }}</text>
        <wd-button size="small" @click="modifyReserve">修改预约</wd-button>
      </view>
    </view>
    
    <view class="record-actions">
      <wd-button v-if="record.certificateUrl" @click="viewCertificate">
        查看证书
      </wd-button>
      <wd-button v-if="canShowOnProfile" @click="toggleProfileShow">
        {{ isShowingOnProfile ? '取消展示' : '展示在主页' }}
      </wd-button>
    </view>
  </view>
</template>
```

### 6.3 预约领取弹窗

**组件**: `components/ReserveReceiveDialog.vue`

```vue
<template>
  <wd-popup v-model="visible" position="bottom">
    <view class="reserve-form">
      <view class="form-title">预约领取纪念品</view>
      
      <wd-cell-group>
        <wd-cell title="领取地点">
          <wd-input v-model="form.location" placeholder="请输入领取地点" />
        </wd-cell>
        <wd-cell title="联系电话">
          <wd-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </wd-cell>
      </wd-cell-group>
      
      <view class="form-actions">
        <wd-button @click="visible = false">取消</wd-button>
        <wd-button type="primary" @click="submit">确认预约</wd-button>
      </view>
    </view>
  </wd-popup>
</template>
```

### 6.4 管理后台荣誉记录管理

**组件**: `components/HonorRecordManage.vue`

| 功能 | 组件 | 说明 |
|------|------|------|
| 记录列表 | `el-table` | 所有荣誉记录 |
| 状态筛选 | `el-select` | pending/issued/received |
| 发放操作 | `el-button` | 发放荣誉物品 |
| 确认领取 | `el-button` | 确认实体物品领取 |
| 统计概览 | `el-statistic` | 发放统计数据 |

---

## 7. TDD测试用例

### 7.1 单元测试

```typescript
// tests/unit/honor-record.service.test.ts
describe('HonorRecordService', () => {
  describe('getMyRecords', () => {
    it('✅ GREEN: 应返回用户的荣誉记录', async () => {
      mockDb.query.honorRecords.findMany.mockResolvedValue([
        { id: 'record-1', itemName: '铜牌徽章' }
      ])
      
      const result = await service.getMyRecords('user-uuid', {})
      
      expect(result.list).toHaveLength(1)
    })

    it('✅ GREEN: 应支持类型筛选', async () => {
      await service.getMyRecords('user-uuid', { type: 'badge' })
      
      expect(mockDb.query.honorRecords.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.arrayContaining([
            eq(honorRecords.itemType, 'badge')
          ])
        })
      )
    })
  })

  describe('issueHonor', () => {
    it('✅ RED: 非管理员不能发放', async () => {
      await expect(
        service.issueHonor('record-uuid', 'normal-user-uuid')
      ).rejects.toThrow('无权操作')
    })

    it('✅ GREEN: 管理员可发放', async () => {
      mockDb.query.honorRecords.findFirst.mockResolvedValue({
        id: 'record-uuid',
        status: 'pending'
      })
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()
      mockDb.where.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ status: 'issued' }])
      
      const result = await service.issueHonor('record-uuid', 'admin-uuid')
      
      expect(result.status).toBe('issued')
    })

    it('✅ RED: 已发放不能重复发放', async () => {
      mockDb.query.honorRecords.findFirst.mockResolvedValue({
        id: 'record-uuid',
        status: 'issued'
      })
      
      await expect(
        service.issueHonor('record-uuid', 'admin-uuid')
      ).rejects.toThrow('该记录已发放')
    })
  })

  describe('confirmReceive', () => {
    it('✅ GREEN: 确认领取后状态变为received', async () => {
      mockDb.query.honorRecords.findFirst.mockResolvedValue({
        id: 'record-uuid',
        status: 'issued',
        itemType: 'gift'
      })
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ status: 'received' }])
      
      const result = await service.confirmReceive('record-uuid', 'admin-uuid')
      
      expect(result.status).toBe('received')
    })
  })
})
```

### 7.2 集成测试

```typescript
// tests/integration/honor-record.api.test.ts
describe('Honor Record API', () => {
  describe('GET /api/honor/my-records', () => {
    it('✅ GREEN: 登录用户可获取自己的荣誉记录', async () => {
      const res = await app.request('/api/honor/my-records', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      expect(res.status).toBe(200)
    })
  })

  describe('POST /api/honor/records/:id/reserve', () => {
    it('✅ RED: 非本人不能预约', async () => {
      const res = await app.request('/api/honor/records/other-user-record/reserve', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ location: 'test', contactPhone: '13800138000' })
      })
      
      expect(res.status).toBe(403)
    })
  })

  describe('PATCH /api/admin/honor/records/:id/issue', () => {
    it('✅ RED: 非管理员不能发放', async () => {
      const res = await app.request('/api/admin/honor/records/uuid/issue', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}` }
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
实现荣誉记录模块的后端API

## 技术栈
- Nuxt v4 (Nitro)
- Drizzle ORM
- PostgreSQL
- TypeScript

## 需要实现的API
1. GET /api/honor/my-records - 获取我的荣誉记录
2. GET /api/honor/records/:id - 获取荣誉记录详情
3. POST /api/honor/records/:id/reserve - 预约领取实体物品
4. GET /api/admin/honor/records - 获取荣誉记录列表
5. PATCH /api/admin/honor/records/:id/issue - 发放荣誉物品
6. PATCH /api/admin/honor/records/:id/receive - 确认领取
7. GET /api/admin/honor/stats - 获取荣誉统计

## 状态流转
- pending: 待发放
- issued: 已发放（电子物品完成，实体物品待领取）
- received: 已领取（实体物品）

## 输出文件
- server/api/honor/my-records.get.ts
- server/api/honor/records/[id].get.ts
- server/api/honor/records/[id]/reserve.post.ts
- server/api/admin/honor/records/index.get.ts
- server/api/admin/honor/records/[id]/issue.patch.ts
- server/api/admin/honor/records/[id]/receive.patch.ts
- server/api/admin/honor/stats.get.ts
- server/services/honor-record.service.ts
```

### 8.2 小程序端代码生成提示词

```markdown
## 任务
实现小程序端荣誉记录页面

## 技术栈
- Uniapp
- Vue 3
- Wot Design Uni
- TypeScript

## 页面文件
1. src/pages/honor/my-records.vue - 我的荣誉页
2. src/components/HonorRecordCard.vue - 荣誉记录卡片组件
3. src/components/ReserveReceiveDialog.vue - 预约领取弹窗

## 我的荣誉页要求
1. Tab切换：全部/徽章/证书/纪念品
2. 荣誉记录卡片展示
3. 查看证书功能
4. 实体物品预约领取功能

## API调用
- GET /api/honor/my-records
- POST /api/honor/records/:id/reserve

## 输出文件
- src/pages/honor/my-records.vue
- src/components/HonorRecordCard.vue
- src/components/ReserveReceiveDialog.vue
```

---

## 9. 相关文档

- [用户模块](../phase1/user.spec.md)
- [荣誉商城模块](./mall.spec.md)
- [积分模块](../phase1/points.spec.md)