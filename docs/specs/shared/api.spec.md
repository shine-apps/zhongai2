# API通用规范

> **文件**: shared/api.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 规范目的

本文档定义众爱联盟平台的API设计规范，确保：
- API设计的一致性和可预测性
- 易于理解和使用
- 安全可靠
- 符合RESTful最佳实践

### 1.2 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Nuxt | v4 | 框架 |
| Nitro | - | API服务 |
| TypeScript | latest | 类型定义 |
| Zod | latest | 参数验证 |
| jose | latest | JWT处理 |

---

## 2. URL设计规范

### 2.1 URL命名规范

**使用小写字母和连字符**：

```
正确:
/api/users
/api/activities
/api/point-transactions
/api/market-posts

错误:
/api/Users          ❌ 大写
/api/userProfiles   ❌ 驼峰
/api/point_transactions ❌ 下划线
```

### 2.2 资源命名规范

**使用复数形式表示资源集合**：

```
正确:
/api/users          用户集合
/api/activities     活动集合
/api/checkins       签到集合

错误:
/api/user           ❌ 单数
/api/activity       ❌ 单数
```

### 2.3 资源层级规范

**使用路径表示资源关系**：

```
/api/users/:id/checkins           用户的所有签到
/api/activities/:id/checkins      活动的所有签到
/api/users/:id/donations          用户的所有捐助
```

### 2.4 操作命名规范

**非CRUD操作使用动词**：

```
/api/activities/:id/join          加入活动
/api/activities/:id/leave         退出活动
/api/checkins/:id/verify          验证签到
/api/donations/:id/approve        审核捐助
/api/notifications/:id/read       标记已读
/api/notifications/read-all       全部已读
```

---

## 3. HTTP方法规范

### 3.1 方法使用

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 获取资源 | `GET /api/users/:id` |
| POST | 创建资源 | `POST /api/users` |
| PATCH | 更新资源（部分） | `PATCH /api/users/:id` |
| PUT | 更新资源（完整） | `PUT /api/users/:id` |
| DELETE | 删除资源 | `DELETE /api/users/:id` |

### 3.2 方法语义

**GET请求**：
- 只用于获取数据
- 不修改服务器状态
- 可被缓存
- 参数通过Query传递

**POST请求**：
- 用于创建资源
- 可用于复杂操作
- 参数通过Body传递
- 非幂等操作

**PATCH请求**：
- 用于部分更新
- 只更新提供的字段
- 参数通过Body传递

**DELETE请求**：
- 用于删除资源
- 通常无Body
- 需要权限验证

---

## 4. 请求规范

### 4.1 请求头

**必需请求头**：

```
Content-Type: application/json
Authorization: Bearer {token}  // 需认证的接口
```

**可选请求头**：

```
Accept-Language: zh-CN
X-Request-ID: {uuid}           // 请求追踪
X-Client-Version: 1.0.0        // 客户端版本
```

### 4.2 Query参数

**分页参数**：

```
?page=1&pageSize=20
```

**筛选参数**：

```
?status=published&type=volunteer
```

**排序参数**：

```
?sort=createdAt&order=desc
```

**搜索参数**：

```
?keyword=养老院
```

### 4.3 Path参数

**资源ID**：

```
/api/users/:id
/api/activities/:id
```

**多级路径**：

```
/api/activities/:activityId/checkins/:checkinId
```

### 4.4 Body参数

**创建请求**：

```json
{
  "title": "养老院慰问活动",
  "description": "活动描述",
  "startTime": "2026-06-01T09:00:00Z",
  "endTime": "2026-06-01T12:00:00Z"
}
```

**更新请求**：

```json
{
  "title": "更新后的标题",
  "status": "published"
}
```

---

## 5. 响应规范

### 5.1 响应格式

**统一响应结构**：

```typescript
interface ApiResponse<T> {
  code: number        // 业务状态码
  message: string     // 状态描述
  data: T | null      // 业务数据
  errors?: ErrorItem[] // 错误详情（可选）
}

interface ErrorItem {
  field: string       // 错误字段
  message: string     // 错误描述
}
```

### 5.2 成功响应

**单条数据**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "uuid-123",
    "title": "养老院慰问活动",
    "createdAt": "2026-05-26T10:00:00Z"
  }
}
```

**列表数据**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

**操作结果**：

```json
{
  "code": 0,
  "message": "操作成功",
  "data": null
}
```

### 5.3 错误响应

**参数错误**：

```json
{
  "code": 400,
  "message": "参数验证失败",
  "errors": [
    { "field": "title", "message": "标题不能为空" },
    { "field": "startTime", "message": "开始时间格式不正确" }
  ]
}
```

**认证错误**：

```json
{
  "code": 401,
  "message": "未登录或登录已过期",
  "data": null
}
```

**权限错误**：

```json
{
  "code": 403,
  "message": "无权访问此资源",
  "data": null
}
```

**资源不存在**：

```json
{
  "code": 404,
  "message": "资源不存在",
  "data": null
}
```

**服务器错误**：

```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

### 5.4 HTTP状态码映射

| 业务码 | HTTP状态码 | 说明 |
|--------|------------|------|
| 0 | 200 | 成功 |
| 400 | 400 | 参数错误 |
| 401 | 401 | 认证失败 |
| 403 | 403 | 权限不足 |
| 404 | 404 | 资源不存在 |
| 409 | 409 | 资源冲突 |
| 500 | 500 | 服务器错误 |

---

## 6. 认证规范

### 6.1 JWT认证

**Token结构**：

```typescript
interface JwtPayload {
  userId: string
  phone: string
  role: 'user' | 'admin'
  iat: number      // 签发时间
  exp: number      // 过期时间
}
```

**Token配置**：

```typescript
const JWT_CONFIG = {
  accessToken: {
    expiresIn: '2h',
    algorithm: 'HS256'
  },
  refreshToken: {
    expiresIn: '7d',
    algorithm: 'HS256'
  }
}
```

### 6.2 认证中间件

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: '未提供认证Token'
    })
  }
  
  const token = authHeader.slice(7)
  
  try {
    const payload = await verifyJwt(token)
    event.context.user = payload
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Token无效或已过期'
    })
  }
})
```

### 6.3 权限中间件

```typescript
// server/middleware/admin.ts
export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (!user || user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: '需要管理员权限'
    })
  }
})
```

### 6.4 Token刷新

**接口**: `POST /api/auth/refresh`

```typescript
// 使用refreshToken获取新的accessToken
export default defineEventHandler(async (event) => {
  const { refreshToken } = await readBody(event)
  
  const payload = await verifyJwt(refreshToken, 'refresh')
  
  const newAccessToken = await generateJwt(payload, 'access')
  const newRefreshToken = await generateJwt(payload, 'refresh')
  
  return {
    code: 0,
    message: 'success',
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }
})
```

---

## 7. 参数验证规范

### 7.1 Zod Schema定义

```typescript
// server/validators/user.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  nickname: z.string()
    .min(2, '昵称至少2个字符')
    .max(50, '昵称最多50个字符'),
  avatarUrl: z.string()
    .url('头像URL格式不正确')
    .optional(),
})

export const updateUserSchema = createUserSchema.partial()
```

### 7.2 验证中间件

```typescript
// server/utils/validate.ts
export async function validateBody<T>(
  event: H3Event,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await readBody(event)
  
  const result = schema.safeParse(body)
  
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: '参数验证失败',
      data: {
        errors: result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }
    })
  }
  
  return result.data
}
```

### 7.3 使用示例

```typescript
// server/api/users/index.post.ts
export default defineEventHandler(async (event) => {
  const data = await validateBody(event, createUserSchema)
  
  const user = await db.insert(users).values(data).returning()
  
  return {
    code: 0,
    message: 'success',
    data: user[0]
  }
})
```

---

## 8. 错误处理规范

### 8.1 全局错误处理

```typescript
// server/error-handler.ts
export default defineEventHandler(async (event) => {
  try {
    // 处理请求
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        code: 400,
        message: '参数验证失败',
        errors: formatZodErrors(error)
      }
    }
    
    if (error.statusCode) {
      return {
        code: error.statusCode,
        message: error.message
      }
    }
    
    // 记录未知错误
    console.error('Unhandled error:', error)
    
    return {
      code: 500,
      message: '服务器内部错误'
    }
  }
})
```

### 8.2 业务错误定义

```typescript
// server/errors/business.ts
export class BusinessError extends Error {
  constructor(
    public code: number,
    message: string
  ) {
    super(message)
  }
}

export const Errors = {
  USER_NOT_FOUND: new BusinessError(1001, '用户不存在'),
  ACTIVITY_FULL: new BusinessError(2001, '活动人数已满'),
  ALREADY_JOINED: new BusinessError(2002, '已加入该活动'),
  CHECKIN_EXPIRED: new BusinessError(3001, '签到已结束'),
  DONATION_REJECTED: new BusinessError(4001, '捐助已被拒绝'),
}
```

---

## 9. API文档规范

### 9.1 OpenAPI规范

使用Swagger/OpenAPI生成API文档：

```yaml
openapi: 3.0.0
info:
  title: 众爱联盟API
  version: 1.0.0

paths:
  /api/users:
    get:
      summary: 获取用户列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: pageSize
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'
```

### 9.2 接口注释规范

```typescript
/**
 * @api {get} /api/users/:id 获取用户详情
 * @apiName GetUser
 * @apiGroup User
 * @apiPermission user
 * 
 * @apiParam {String} id 用户ID
 * 
 * @apiSuccess {Object} data 用户信息
 * @apiSuccess {String} data.id 用户ID
 * @apiSuccess {String} data.nickname 昵称
 * 
 * @apiError 401 未登录
 * @apiError 404 用户不存在
 */
export default defineEventHandler(async (event) => {
  // ...
})
```

---

## 10. 安全规范

### 10.1 CORS配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    cors: {
      origin: ['https://zhongai.example.com'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  }
})
```

### 10.2 请求限流

```typescript
// server/middleware/rate-limit.ts
export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event)
  const key = `rate-limit:${ip}`
  
  const count = await redis.incr(key)
  
  if (count === 1) {
    await redis.expire(key, 60)  // 1分钟窗口
  }
  
  if (count > 100) {  // 每分钟100次限制
    throw createError({
      statusCode: 429,
      message: '请求过于频繁，请稍后再试'
    })
  }
})
```

### 10.3 输入过滤

```typescript
// 过滤敏感字符
function sanitizeInput(input: string): string {
  return input
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .trim()
}
```

---

## 11. 相关文档

- [数据库规范](./database.spec.md)
- [全局规范](../global.spec.md)
- [认证模块](../phase1/auth.spec.md)