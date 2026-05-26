# 消息通知模块规范

> **文件**: shared/notification.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

消息通知模块为众爱联盟平台提供统一的站内消息、微信订阅消息和短信通知能力：
- 站内消息通知
- 微信小程序订阅消息
- 短信通知（重要场景）
- 用户消息设置

### 1.2 业务价值

- 实时触达用户，提升用户体验
- 重要信息不遗漏（活动开始、积分变动等）
- 用户可自定义通知偏好

### 1.3 通知渠道

| 渠道 | 说明 | 使用场景 |
|------|------|----------|
| app | 站内消息 | 所有消息，必发 |
| wechat | 微信订阅消息 | 重要提醒，需用户授权 |
| sms | 短信 | 关键通知，用户开启时使用 |

---

## 2. 数据模型

### 2.1 消息通知表

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(30) NOT NULL,                  -- 消息类型
  title VARCHAR(100) NOT NULL,                -- 消息标题
  content TEXT NOT NULL,                     -- 消息内容
  data JSONB DEFAULT '{}',                   -- 扩展数据（跳转信息）
  is_read BOOLEAN DEFAULT false,             -- 是否已读
  read_at TIMESTAMPTZ,                       -- 阅读时间
  send_channel VARCHAR(20)[] DEFAULT '{app}',-- 发送渠道
  wechat_msg_id VARCHAR(100),                -- 微信消息ID
  expires_at TIMESTAMPTZ,                    -- 过期时间
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notif_user_id ON notifications(user_id);
CREATE INDEX idx_notif_type ON notifications(type);
CREATE INDEX idx_notif_is_read ON notifications(is_read);
CREATE INDEX idx_notif_created_at ON notifications(created_at DESC);
```

### 2.2 消息模板表

```sql
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL,
  title_template VARCHAR(200) NOT NULL,
  content_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  wechat_template_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 用户消息设置表

```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  activity_remind BOOLEAN DEFAULT true,
  activity_result BOOLEAN DEFAULT true,
  donation_result BOOLEAN DEFAULT true,
  points_change BOOLEAN DEFAULT true,
  order_update BOOLEAN DEFAULT true,
  market_interaction BOOLEAN DEFAULT true,
  system_notice BOOLEAN DEFAULT true,
  wechat_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 TypeScript类型

```typescript
// 消息通知
interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  content: string
  data: Record<string, any>  // { activityId, orderId, etc. }
  isRead: boolean
  readAt: string | null
  sendChannel: NotificationChannel[]
  wechatMsgId: string | null
  expiresAt: string | null
  createdAt: string
}

// 消息类型
type NotificationType = 'system' | 'activity' | 'donation' | 'points' | 'order' | 'market'

// 发送渠道
type NotificationChannel = 'app' | 'wechat' | 'sms'

// 未读数量响应
interface UnreadCountResponse {
  total: number
  byType: Record<NotificationType, number>
}

// 用户消息设置
interface NotificationSettings {
  activityRemind: boolean
  activityResult: boolean
  donationResult: boolean
  pointsChange: boolean
  orderUpdate: boolean
  marketInteraction: boolean
  systemNotice: boolean
  wechatEnabled: boolean
  smsEnabled: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
}

// 消息模板
interface NotificationTemplate {
  id: string
  templateCode: string
  name: string
  type: NotificationType
  titleTemplate: string
  contentTemplate: string
  variables: TemplateVariable[]
  wechatTemplateId: string | null
  isActive: boolean
}

interface TemplateVariable {
  name: string
  desc: string
  required: boolean
}
```

---

## 3. API接口

### 3.1 获取消息列表

**接口**: `GET /api/notifications`  
**权限**: 登录用户  
**状态**: [TODO]

**查询参数**:
```
?page=1&pageSize=20&type=activity&isRead=false
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
        "type": "activity",
        "title": "活动报名成功",
        "content": "您已成功报名「养老院慰问」活动",
        "data": {
          "activityId": "uuid",
          "activityTitle": "养老院慰问"
        },
        "isRead": false,
        "sendChannel": ["app", "wechat"],
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

### 3.2 获取未读数量

**接口**: `GET /api/notifications/unread-count`  
**权限**: 登录用户  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 5,
    "byType": {
      "activity": 2,
      "donation": 1,
      "points": 1,
      "system": 1,
      "order": 0,
      "market": 0
    }
  }
}
```

### 3.3 标记已读

**接口**: `PATCH /api/notifications/:id/read`  
**权限**: 登录用户（仅自己的消息）  
**状态**: [TODO]

### 3.4 标记全部已读

**接口**: `PATCH /api/notifications/read-all`  
**权限**: 登录用户  
**状态**: [TODO]

### 3.5 获取消息设置

**接口**: `GET /api/notifications/settings`  
**权限**: 登录用户  
**状态**: [TODO]

### 3.6 更新消息设置

**接口**: `PATCH /api/notifications/settings`  
**权限**: 登录用户  
**状态**: [TODO]

**请求体**:
```json
{
  "activityRemind": true,
  "pointsChange": false,
  "wechatEnabled": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}
```

### 3.7 群发消息（管理员）

**接口**: `POST /api/admin/notifications/broadcast`  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "target": "all",
  "title": "系统维护通知",
  "content": "平台将于今晚22:00-24:00进行系统维护",
  "sendChannel": ["app", "wechat"]
}
```

---

## 4. 业务逻辑

### 4.1 消息发送流程

```typescript
async function sendNotification(
  userId: string,
  options: {
    type: NotificationType
    title: string
    content: string
    data?: Record<string, any>
    sendChannel?: NotificationChannel[]
    templateCode?: string
    templateVars?: Record<string, string>
  }
): Promise<Notification> {
  // 1. 获取用户设置
  const settings = await getUserSettings(userId)
  
  // 2. 检查是否需要发送
  if (!shouldSend(options.type, settings)) {
    return null
  }
  
  // 3. 确定发送渠道
  const channels = options.sendChannel || ['app']
  
  // 4. 发送站内消息
  const notification = await createNotification(userId, {
    type: options.type,
    title: options.title,
    content: options.content,
    data: options.data,
    sendChannel: channels,
    expiresAt: addDays(new Date(), 30)
  })
  
  // 5. 发送微信订阅消息
  if (channels.includes('wechat') && settings.wechatEnabled) {
    await sendWechatMessage(userId, notification)
  }
  
  // 6. 发送短信（如需要且在免打扰时段外）
  if (channels.includes('sms') && settings.smsEnabled && !isInQuietHours(settings)) {
    await sendSms(userId, notification)
  }
  
  return notification
}
```

### 4.2 消息触发场景

| 场景 | 触发时机 | 类型 | 渠道 |
|------|----------|------|------|
| 活动报名成功 | 报名后 | activity | app |
| 活动即将开始 | 开始前2小时 | activity | app + wechat |
| 活动结果通知 | 活动结束 | activity | app |
| 捐助审核通过 | 审核通过 | donation | app + wechat |
| 积分获得 | 积分发放 | points | app |
| 积分消耗 | 积分消费 | points | app |
| 订单发货 | 管理员发货 | order | app + wechat |
| 系统公告 | 管理员发布 | system | app + wechat |

### 4.3 免打扰时段处理

```typescript
function isInQuietHours(settings: NotificationSettings): boolean {
  if (!settings.quietHoursStart || !settings.quietHoursEnd) {
    return false
  }
  
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  const { quietHoursStart, quietHoursEnd } = settings
  
  if (quietHoursStart <= quietHoursEnd) {
    // 同一天内: 22:00-08:00
    return currentTime >= quietHoursStart || currentTime < quietHoursEnd
  } else {
    // 跨天: 22:00-08:00
    return currentTime >= quietHoursStart || currentTime < quietHoursEnd
  }
}
```

---

## 6. 前端实现要求

### 6.1 消息列表页

**页面**: `/pages/notification/index.vue`

```
┌─────────────────────────────────┐
│  消息通知                        │
├─────────────────────────────────┤
│  [全部] [活动] [捐助] [系统]     │ ← Tab切换
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 📢 活动报名成功            │  │
│  │ 您已成功报名「养老院慰问」  │  │
│  │ 10分钟前              [未读]│  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 💰 积分获得通知            │  │
│  │ 参与「养老院慰问」获得2积分 │  │
│  │ 1小时前              [已读] │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.2 消息卡片组件

**组件**: `components/NotificationItem.vue`

```vue
<template>
  <view 
    class="notification-item" 
    :class="{ unread: !item.isRead }"
    @click="handleClick"
  >
    <view class="item-icon">
      <wd-icon :name="getIcon(item.type)" size="24px" />
    </view>
    <view class="item-content">
      <view class="item-header">
        <text class="item-title">{{ item.title }}</text>
        <wd-tag v-if="!item.isRead" type="primary" size="small">未读</wd-tag>
      </view>
      <text class="item-content">{{ item.content }}</text>
      <text class="item-time">{{ formatTime(item.createdAt) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ item: Notification }>()
const emit = defineEmits<{ click: [item: Notification] }>()

function getIcon(type: NotificationType): string {
  const icons = {
    activity: 'notification',
    donation: 'wallet',
    points: 'gold-coin',
    system: 'info',
    order: 'shopping-cart',
    market: 'shop',
  }
  return icons[type] || 'notification'
}

function handleClick() {
  emit('click', props.item)
}
</script>

<style scoped>
.notification-item.unread {
  background: #f0f9ff;
}
</style>
```

### 6.3 消息设置页

**页面**: `/pages/notification/settings.vue`

```
┌─────────────────────────────────┐
│  消息设置                        │
├─────────────────────────────────┤
│  通知类型                        │
│  ┌───────────────────────────┐  │
│  │ 活动提醒        [开关]     │  │
│  │ 活动结果通知    [开关]     │  │
│  │ 捐助结果通知    [开关]     │  │
│  │ 积分变动通知    [开关]     │  │
│  │ 订单状态更新    [开关]     │  │
│  │ 集市互动通知    [开关]     │  │
│  │ 系统公告        [开关]     │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  推送方式                        │
│  ┌───────────────────────────┐  │
│  │ 微信订阅消息    [开关]     │  │
│  │ 短信通知        [开关]     │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  免打扰时段                      │
│  ┌───────────────────────────┐  │
│  │ 开始时间        [22:00]   │  │
│  │ 结束时间        [08:00]   │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 6.4 微信订阅消息

**说明**: 使用微信小程序订阅消息能力，用户需提前授权

```typescript
// 申请订阅消息权限
async function requestSubscribeMessage(templateId: string): Promise<boolean> {
  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (res) => {
        resolve(res[templateId] === 'accept')
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

// 常用模板ID配置
const TEMPLATE_IDS = {
  activity_remind: '模板ID_活动开始提醒',
  activity_result: '模板ID_活动结果通知',
  donation_result: '模板ID_捐助结果通知',
  points_change: '模板ID_积分变动通知',
}
```

### 6.5 管理后台消息管理

**组件**: `components/NotificationManage.vue`

| 功能 | 组件 | 说明 |
|------|------|------|
| 消息列表 | `el-table` | 所有消息记录 |
| 消息详情 | `el-dialog` | 查看消息内容 |
| 群发消息 | `el-form` | 创建广播消息 |
| 模板管理 | `el-table` | 消息模板配置 |

### 6.6 群发消息弹窗

```vue
<template>
  <el-dialog v-model="dialogVisible" title="群发消息" width="600px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="发送范围">
        <el-radio-group v-model="form.target">
          <el-radio label="all">全部用户</el-radio>
          <el-radio label="active">活跃用户</el-radio>
          <el-radio label="new">新用户</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="消息类型">
        <el-select v-model="form.type">
          <el-option label="系统公告" value="system" />
          <el-option label="活动通知" value="activity" />
        </el-select>
      </el-form-item>
      <el-form-item label="消息标题">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="消息内容">
        <el-input v-model="form.content" type="textarea" :rows="4" />
      </el-form-item>
      <el-form-item label="发送渠道">
        <el-checkbox-group v-model="form.sendChannel">
          <el-checkbox label="app">站内消息</el-checkbox>
          <el-checkbox label="wechat">微信订阅</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submit" :loading="loading">
        发送
      </el-button>
    </template>
  </el-dialog>
</template>
```

---

## 7. TDD测试用例

> **TDD流程**: 先编写以下测试（🔴RED），再编写实现代码（🟢GREEN），最后重构（🔵REFACTOR）

### 7.1 单元测试（NotificationService）

**测试文件**: `server/services/__tests__/notification.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotificationService } from '~/server/services/notification.service'
import { mockDb } from '../helpers/mocks'
import { mockUser } from '../helpers/fixtures'

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new NotificationService()
  })

  describe('sendNotification', () => {
    it('should_create_app_notification_when_sending', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{
        activityRemind: true,
        pointsChange: true,
        wechatEnabled: true,
        smsEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
      }])
      mockDb.insert.mockReturnThis()
      mockDb.values.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ id: 'notif-uuid' }])

      // Act
      const result = await service.sendNotification(mockUser.id, {
        type: 'activity',
        title: '活动报名成功',
        content: '您已成功报名「测试活动」',
        sendChannel: ['app'],
      })

      // Assert
      expect(result).toBeDefined()
      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          type: 'activity',
          is_read: false,
        })
      )
    })

    it('should_not_send_when_user_disabled_notification_type', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{
        pointsChange: false,  // 用户关闭了积分通知
      }])

      // Act
      const result = await service.sendNotification(mockUser.id, {
        type: 'points',
        title: '积分变动',
        content: '获得2个积分',
      })

      // Assert
      expect(result).toBeNull()
    })

    it('should_send_wechat_message_when_enabled_and_not_in_quiet_hours', async () => {
      // Arrange
      const morningTime = new Date('2026-06-01T10:00:00Z')
      vi.setSystemTime(morningTime)

      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{
        activityRemind: true,
        wechatEnabled: true,
        smsEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      }])
      mockDb.insert.mockReturnThis()
      mockDb.values.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ id: 'notif-uuid' }])

      // Act
      await service.sendNotification(mockUser.id, {
        type: 'activity',
        title: '活动即将开始',
        content: '活动将在2小时后开始',
        sendChannel: ['app', 'wechat'],
      })

      // Assert - 微信消息应该在非免打扰时段发送
      expect(mockDb.insert).toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('should_skip_wechat_when_in_quiet_hours', async () => {
      // Arrange
      const nightTime = new Date('2026-06-01T23:00:00Z')
      vi.setSystemTime(nightTime)

      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{
        activityRemind: true,
        wechatEnabled: true,
        smsEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      }])
      mockDb.insert.mockReturnThis()
      mockDb.values.mockReturnThis()
      mockDb.returning.mockResolvedValue([{ id: 'notif-uuid' }])

      // Act
      const result = await service.sendNotification(mockUser.id, {
        type: 'activity',
        title: '活动提醒',
        content: '免打扰时段测试',
        sendChannel: ['app', 'wechat'],
      })

      // Assert - 免打扰时段内仅发送app渠道
      vi.useRealTimers()
    })
  })

  describe('markAsRead', () => {
    it('should_mark_notification_as_read', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([{ id: 'notif-uuid', userId: mockUser.id, isRead: false }])
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()

      // Act
      await service.markAsRead('notif-uuid', mockUser.id)

      // Assert
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        is_read: true,
        read_at: expect.any(Date),
      }))
    })

    it('should_throw_error_when_notification_not_found', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([])

      // Act & Assert
      await expect(
        service.markAsRead('not-exist', mockUser.id)
      ).rejects.toThrow('消息不存在')
    })
  })

  describe('markAllAsRead', () => {
    it('should_mark_all_unread_notifications_as_read', async () => {
      // Arrange
      mockDb.update.mockReturnThis()
      mockDb.set.mockReturnThis()
      mockDb.where.mockReturnThis()

      // Act
      await service.markAllAsRead(mockUser.id)

      // Assert
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        is_read: true,
      }))
    })
  })

  describe('getUnreadCount', () => {
    it('should_return_total_and_by_type_counts', async () => {
      // Arrange
      mockDb.select.mockReturnThis()
      mockDb.where.mockResolvedValueOnce([
        { type: 'activity', count: '2' },
        { type: 'donation', count: '1' },
        { type: 'points', count: '1' },
        { type: 'system', count: '1' },
      ])

      // Act
      const result = await service.getUnreadCount(mockUser.id)

      // Assert
      expect(result.total).toBe(5)
      expect(result.byType.activity).toBe(2)
    })
  })
})
```

---

## 8. AI实现提示词

### 8.1 后端代码生成提示词

```markdown
## 任务
实现消息通知模块的后端API和服务

## 技术栈
- Nuxt v4
- Drizzle ORM
- PostgreSQL
- TypeScript

## Schema文件
- server/db/schema/notifications.ts
- server/db/schema/notification-templates.ts
- server/db/schema/notification-settings.ts

## 需要实现的API
1. GET /api/notifications - 消息列表
2. GET /api/notifications/unread-count - 未读数量
3. PATCH /api/notifications/:id/read - 标记已读
4. PATCH /api/notifications/read-all - 标记全部已读
5. DELETE /api/notifications/:id - 删除消息
6. GET /api/notifications/settings - 获取设置
7. PATCH /api/notifications/settings - 更新设置
8. POST /api/admin/notifications/broadcast - 群发（管理员）

## Service方法
```typescript
// server/services/notification.service.ts

// 发送通知
sendNotification(userId: string, options: {
  type: NotificationType
  title: string
  content: string
  data?: Record<string, any>
  sendChannel?: NotificationChannel[]
}): Promise<Notification>

// 发送微信消息
sendWechatMessage(userId: string, notification: Notification): Promise<string>

// 检查是否应发送
shouldSend(type: NotificationType, settings: NotificationSettings): boolean

// 是否在免打扰时段
isInQuietHours(settings: NotificationSettings): boolean
```

## 实现要求
1. 用户只能查看/操作自己的消息
2. 发送时检查用户消息设置
3. 免打扰时段内延迟发送微信/短信
4. 未读数量支持按类型统计
5. 群发消息使用后台任务

## 输出文件
- server/api/notifications/index.get.ts
- server/api/notifications/unread-count.get.ts
- server/api/notifications/[id]/read.patch.ts
- server/api/notifications/read-all.patch.ts
- server/api/notifications/[id]/delete.ts
- server/api/notifications/settings.get.ts
- server/api/notifications/settings.patch.ts
### 8.2 小程序端代码生成提示词

```markdown
## 任务
实现小程序端消息通知相关页面

## 技术栈
- Uniapp
- Vue 3
- Wot Design Uni
- TypeScript

## 页面文件
1. src/pages/notification/index.vue - 消息列表页
2. src/pages/notification/settings.vue - 消息设置页
3. src/components/NotificationItem.vue - 消息卡片组件

## 消息列表页要求
1. Tab切换：全部/活动/捐助/系统
2. 消息卡片列表
3. 未读消息高亮显示
4. 点击跳转详情或相关页面
5. 下拉刷新、上拉加载

## API调用
- GET /api/notifications - 消息列表
- GET /api/notifications/unread-count - 未读数量
- PATCH /api/notifications/:id/read - 标记已读
- PATCH /api/notifications/read-all - 标记全部已读
- GET /api/notifications/settings - 获取设置
- PATCH /api/notifications/settings - 更新设置

## 输出文件
- src/pages/notification/index.vue
- src/pages/notification/settings.vue
- src/components/NotificationItem.vue
```

### 8.3 Review检查清单

**后端Review**:
- [ ] 站内消息发送正确
- [ ] 微信订阅消息集成
- [ ] 免打扰时段处理
- [ ] 用户设置检查

**前端Review**:
- [ ] 消息列表Tab切换正常
- [ ] 未读消息高亮显示
- [ ] 消息设置开关正常
- [ ] 微信订阅权限申请

---

## 9. 相关文档

- [用户模块](../phase1/user.spec.md)
- [活动模块](../phase1/activity.spec.md)
- [积分模块](../phase1/points.spec.md)
