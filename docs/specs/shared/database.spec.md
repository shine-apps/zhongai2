# 数据库规范

> **文件**: shared/database.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 规范目的

本文档定义众爱联盟平台的数据库设计规范，确保：
- 数据库设计的一致性和可维护性
- 数据安全和隐私保护
- 高性能和可扩展性
- 符合行业最佳实践

### 1.2 技术选型

| 技术 | 版本 | 说明 |
|------|------|------|
| PostgreSQL | 16+ | 主数据库 |
| Drizzle ORM | latest | ORM框架 |
| Redis | 7+ | 缓存和排行榜 |
| TypeScript | latest | 类型定义 |

---

## 2. 表设计规范

### 2.1 主键规范

**所有表必须使用UUID作为主键**：

```sql
-- 正确示例
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- 错误示例（不使用自增ID）
CREATE TABLE users (
  id SERIAL PRIMARY KEY,  -- ❌ 不推荐
  ...
);
```

**原因**：
- UUID在分布式系统中更安全
- 防止ID枚举攻击
- 便于数据迁移和合并

### 2.2 时间字段规范

**所有表必须包含created_at和updated_at**：

```sql
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**使用TIMESTAMPTZ而非TIMESTAMP**：
- TIMESTAMPTZ存储带时区的时间戳
- 自动转换为服务器时区
- 避免时区混乱问题

### 2.3 外键规范

**外键必须命名规范并设置引用动作**：

```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
  ...
);
```

**引用动作选择**：
| 动作 | 使用场景 | 示例 |
|------|----------|------|
| CASCADE | 子记录应随父记录删除 | checkins → users |
| RESTRICT | 父记录有子记录时禁止删除 | activities → checkins |
| SET NULL | 子记录保留但外键置空 | 可选场景 |

### 2.4 状态字段规范

**状态字段使用VARCHAR(20)并明确枚举值**：

```sql
CREATE TABLE donations (
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 有效值: pending, approved, rejected
);
```

**不使用ENUM类型的原因**：
- PostgreSQL修改ENUM需要特殊操作
- VARCHAR更灵活，便于扩展
- 应用层做枚举验证

### 2.5 金额字段规范

**金额使用DECIMAL(10,2)**：

```sql
CREATE TABLE donations (
  amount DECIMAL(10,2) NOT NULL,  -- 最大999,999.99
);
```

**不使用FLOAT/DOUBLE的原因**：
- 避免浮点精度问题
- 金额计算需要精确

### 2.6 敏感数据加密规范

**敏感数据必须加密存储**：

```sql
CREATE TABLE users (
  id_card_number VARCHAR(100),  -- 存储AES-256-GCM加密后的密文
  real_name VARCHAR(100),       -- 存储加密后的密文
);
```

**加密实现**：
```typescript
// 使用AES-256-GCM加密
import { encrypt, decrypt } from '~/server/utils/crypto'

const encryptedIdCard = encrypt(idCardNumber, ENCRYPTION_KEY)
await db.insert(users).values({
  idCardNumber: encryptedIdCard
})
```

---

## 3. 索引规范

### 3.1 主键索引

**主键自动创建索引，无需额外定义**：

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,  -- 自动创建索引
);
```

### 3.2 外键索引

**外键字段必须创建索引**：

```sql
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_activity_id ON checkins(activity_id);
```

### 3.3 查询索引

**根据查询模式创建索引**：

```sql
-- 状态查询
CREATE INDEX idx_activities_status ON activities(status);

-- 时间范围查询
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- 组合查询
CREATE INDEX idx_activities_status_date ON activities(status, created_at);
```

### 3.4 全文搜索索引

**需要全文搜索的字段使用GIN索引**：

```sql
-- 活动标题搜索
CREATE INDEX idx_activities_title_search ON activities 
  USING gin(to_tsvector('simple', title));
```

### 3.5 索引命名规范

| 索引类型 | 命名格式 | 示例 |
|----------|----------|------|
| 单字段索引 | idx_{table}_{column} | idx_users_email |
| 组合索引 | idx_{table}_{col1}_{col2} | idx_activities_status_date |
| 唯一索引 | uq_{table}_{column} | uq_users_phone |
| 全文索引 | idx_{table}_{col}_search | idx_activities_title_search |

---

## 4. Drizzle ORM Schema规范

### 4.1 Schema文件组织

```
server/db/schema/
├── users.ts           # 用户表
├── activities.ts      # 活动表
├── checkins.ts        # 签到表
├── donations.ts       # 捐助表
├── point-accounts.ts  # 积分账户表
├── point-transactions.ts # 积分流水表
├── notifications.ts   # 消息表
├── banners.ts         # 轮播图表
├── market-posts.ts    # 集市帖子表
├── feedback.ts        # 反馈表
├── honor-items.ts     # 荣誉物品表
├── honor-records.ts   # 荣誉记录表
└── stats-snapshots.ts # 统计快照表
```

### 4.2 Schema定义模板

```typescript
// server/db/schema/users.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  nickname: varchar('nickname', { length: 50 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  gender: varchar('gender', { length: 10 }),
  birthday: varchar('birthday', { length: 20 }),
  memberNumber: varchar('member_number', { length: 20 }).unique(),
  realName: varchar('real_name', { length: 100 }),  // 加密存储
  idCardNumber: varchar('id_card_number', { length: 100 }),  // 加密存储
  isVerified: boolean('is_verified').default(false),
  role: varchar('role', { length: 20 }).default('user'),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// 定义关系
export const usersRelations = relations(users, ({ many }) => ({
  checkins: many(checkins),
  donations: many(donations),
  pointAccount: one(pointAccounts),
  notifications: many(notifications),
}))

// 导出类型
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### 4.3 关系定义规范

```typescript
// 一对多关系
export const activitiesRelations = relations(activities, ({ many }) => ({
  checkins: many(checkins),
}))

// 多对一关系
export const checkinsRelations = relations(checkins, ({ one }) => ({
  user: one(users, {
    fields: [checkins.userId],
    references: [users.id]
  }),
  activity: one(activities, {
    fields: [checkins.activityId],
    references: [activities.id]
  }),
}))
```

---

## 5. 查询规范

### 5.1 基础查询

```typescript
// 单条查询
const user = await db.query.users.findFirst({
  where: eq(users.id, userId)
})

// 列表查询
const activities = await db.query.activities.findMany({
  where: eq(activities.status, 'published'),
  limit: 20,
  offset: 0,
  orderBy: desc(activities.createdAt)
})
```

### 5.2 关联查询

```typescript
// 带关联的查询
const activity = await db.query.activities.findFirst({
  where: eq(activities.id, activityId),
  with: {
    checkins: {
      limit: 10,
      with: {
        user: true
      }
    }
  }
})
```

### 5.3 分页查询

```typescript
// 分页查询封装
async function paginate<T>(
  query: any,
  page: number,
  pageSize: number
): Promise<{ data: T[], total: number, page: number, pageSize: number }> {
  const offset = (page - 1) * pageSize
  
  const [data, countResult] = await Promise.all([
    query.limit(pageSize).offset(offset),
    db.select({ count: sql`count(*)` }).from(...)
  ])
  
  return {
    data,
    total: countResult[0].count,
    page,
    pageSize
  }
}
```

### 5.4 事务处理

```typescript
// 事务示例：积分发放
await db.transaction(async (tx) => {
  // 1. 更新积分账户
  await tx.update(pointAccounts)
    .set({ 
      activityPointsTotal: sql`${pointAccounts.activityPointsTotal} + ${amount}`
    })
    .where(eq(pointAccounts.userId, userId))
  
  // 2. 记录积分流水
  await tx.insert(pointTransactions).values({
    userId,
    pointType: 'activity',
    amount,
    source: 'checkin',
    sourceId: checkinId,
    description: '签到获得积分'
  })
})
```

---

## 6. 数据迁移规范

### 6.1 迁移文件命名

```
migrations/
├── 0001_initial_schema.sql
├── 0002_add_point_system.sql
├── 0003_add_notification_table.sql
├── 0004_add_market_module.sql
└── 0005_add_honor_system.sql
```

### 6.2 迁移文件格式

```sql
-- migrations/0001_initial_schema.sql

-- +migrate Up
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  nickname VARCHAR(50),
  avatar_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_phone ON users(phone);

-- +migrate Down
DROP TABLE IF EXISTS users;
```

### 6.3 迁移执行顺序

1. 在开发环境测试迁移
2. 备份生产数据库
3. 执行迁移
4. 验证迁移结果
5. 记录迁移日志

---

## 7. Redis缓存规范

### 7.1 缓存Key命名

```
{module}:{resource}:{identifier}:{attribute}

示例:
- user:profile:uuid123
- activity:detail:uuid456
- ranking:activity:all
- stats:overview:latest
```

### 7.2 缓存过期时间

| 数据类型 | TTL | 说明 |
|----------|-----|------|
| 用户信息 | 1小时 | 基础信息缓存 |
| 活动详情 | 30分钟 | 活动信息缓存 |
| 排行榜 | 1小时 | 定时更新 |
| 统计数据 | 1小时 | 定时更新 |
| Session | 7天 | JWT刷新token |

### 7.3 缓存更新策略

```typescript
// Cache-Aside模式
async function getUserWithCache(userId: string): Promise<User> {
  const cacheKey = `user:profile:${userId}`
  
  // 1. 先查缓存
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // 2. 缓存不存在，查数据库
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  })
  
  // 3. 写入缓存
  await redis.setex(cacheKey, 3600, JSON.stringify(user))
  
  return user
}
```

---

## 8. 数据安全规范

### 8.1 数据备份

**备份策略**：
- 每日全量备份
- 每小时增量备份
- 备份保留30天
- 异地备份存储

**备份命令**：
```bash
# 全量备份
pg_dump -Fc众爱联盟 > backup_$(date +%Y%m%d).dump

# 增量备份（WAL归档）
archive_command = 'cp %p /backup/wal/%f'
```

### 8.2 数据恢复

```bash
# 恢复数据库
pg_restore -d众爱联盟 backup_20260526.dump
```

### 8.3 数据脱敏

**生产数据导出时必须脱敏**：

```sql
-- 脱敏导出
SELECT 
  id,
  CONCAT(SUBSTRING(phone, 1, 3), '****', SUBSTRING(phone, 8, 4)) as phone,
  nickname,
  '***' as real_name,
  '***' as id_card_number
FROM users;
```

---

## 9. 性能优化规范

### 9.1 查询优化

- 避免SELECT *，只查询需要的字段
- 使用索引覆盖查询
- 避免N+1查询，使用关联查询
- 大表查询使用分页

### 9.2 连接池配置

```typescript
// drizzle.config.ts
export default {
  dbCredentials: {
    host: process.env.DB_HOST,
    port: 5432,
    database: 'zhongai',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  poolConfig: {
    max: 20,        // 最大连接数
    idleTimeout: 30, // 空闲超时（秒）
    connectionTimeout: 2, // 连接超时（秒）
  }
}
```

### 9.3 批量操作

```typescript
// 批量插入
await db.insert(checkins).values(
  checkinDataList.map(data => ({
    userId: data.userId,
    activityId: data.activityId,
    checkinTime: data.checkinTime
  }))
)

// 批量更新（使用事务）
await db.transaction(async (tx) => {
  for (const item of updateList) {
    await tx.update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, item.userId))
  }
})
```

---

## 10. 相关文档

- [API通用规范](./api.spec.md)
- [全局规范](../global.spec.md)