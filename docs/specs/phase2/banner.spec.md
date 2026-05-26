# 轮播图模块规范

> **文件**: phase2/banner.spec.md  
> **版本**: v1.0  
> **更新日期**: 2026-05-26  
> **状态**: [TODO]

---

## 1. 概述

### 1.1 功能描述

轮播图模块为平台提供动态内容展示能力，支持：
- 首页轮播广告/活动展示
- 后台灵活配置轮播内容
- 跳转链接支持（活动详情、外部链接等）
- 定时上下线控制
- 点击数据统计

### 1.2 业务价值

- 提升重要活动和内容的曝光率
- 支持运营灵活配置推广内容
- 增强用户参与度和转化率
- 提供数据支持运营决策

### 1.3 依赖关系

- 依赖: 用户模块(user)、认证模块(auth) - 用于权限控制
- 被依赖: 无

### 1.4 展示位置

| 位置 | 编码 | 尺寸建议 | 说明 |
|------|------|----------|------|
| 首页顶部 | home_top | 750x300 | 首页轮播 |
| 活动页 | activity | 750x240 | 活动页面轮播 |
| 启动页 | launch | 750x1334 | APP启动页（如需要） |

---

## 2. 数据模型

### 2.1 轮播图表 banners

```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position VARCHAR(30) NOT NULL,              -- 展示位置: home_top/activity/launch
  title VARCHAR(100) NOT NULL,                -- 标题
  image_url VARCHAR(500) NOT NULL,            -- 图片URL
  link_type VARCHAR(20) DEFAULT 'none',       -- 跳转类型: none/activity/url/miniapp
  link_value VARCHAR(500),                    -- 跳转值
  sort_order INT DEFAULT 0,                   -- 排序序号(越小越靠前)
  status VARCHAR(20) DEFAULT 'draft',         -- 状态: draft/published/offline
  start_time TIMESTAMPTZ,                     -- 开始时间(可选)
  end_time TIMESTAMPTZ,                       -- 结束时间(可选)
  view_count INT DEFAULT 0,                   -- 浏览次数
  click_count INT DEFAULT 0,                  -- 点击次数
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_status ON banners(status);
CREATE INDEX idx_banners_sort ON banners(position, sort_order);
CREATE INDEX idx_banners_time ON banners(start_time, end_time);
```

### 2.2 TypeScript类型

```typescript
// 展示位置
type BannerPosition = 'home_top' | 'activity' | 'launch'

// 跳转类型
type BannerLinkType = 'none' | 'activity' | 'url' | 'miniapp'

// 状态
type BannerStatus = 'draft' | 'published' | 'offline'

// 轮播图
interface Banner {
  id: string
  position: BannerPosition
  title: string
  imageUrl: string
  linkType: BannerLinkType
  linkValue: string | null
  sortOrder: number
  status: BannerStatus
  startTime: string | null
  endTime: string | null
  viewCount: number
  clickCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 创建轮播图请求
interface CreateBannerRequest {
  position: BannerPosition
  title: string
  imageUrl: string
  linkType?: BannerLinkType
  linkValue?: string
  sortOrder?: number
  startTime?: string
  endTime?: string
}

// 更新轮播图请求
interface UpdateBannerRequest {
  title?: string
  imageUrl?: string
  linkType?: BannerLinkType
  linkValue?: string
  sortOrder?: number
  startTime?: string
  endTime?: string
}

// 查询参数
interface BannerListQuery {
  position?: BannerPosition
  status?: BannerStatus
}
```

---

## 3. API接口

### 3.1 获取轮播图列表(小程序)

**接口**: `GET /api/banners`  
**描述**: 获取指定位置的轮播图列表(仅返回已发布且在有效期内的)  
**权限**: 公开  
**状态**: [TODO]

**查询参数**:
```
?position=home_top
```

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "title": "五一公益活动",
      "imageUrl": "https://cdn.example.com/banner/1.jpg",
      "linkType": "activity",
      "linkValue": "activity-uuid-123",
      "sortOrder": 0
    }
  ]
}
```

### 3.2 记录轮播图点击

**接口**: `POST /api/banners/:id/click`  
**描述**: 记录用户点击轮播图  
**权限**: 公开  
**状态**: [TODO]

**成功响应** (200):
```json
{
  "code": 0,
  "message": "success"
}
```

### 3.3 获取轮播图列表(管理后台)

**接口**: `GET /api/admin/banners`  
**描述**: 获取所有轮播图(支持筛选)  
**权限**: 管理员  
**状态**: [TODO]

**查询参数**:
```
?position=home_top&status=published&page=1&pageSize=20
```

### 3.4 创建轮播图

**接口**: `POST /api/admin/banners`  
**描述**: 创建新轮播图  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "position": "home_top",
  "title": "五一公益活动",
  "imageUrl": "https://cdn.example.com/banner/1.jpg",
  "linkType": "activity",
  "linkValue": "activity-uuid-123",
  "sortOrder": 1,
  "startTime": "2026-05-01T00:00:00Z",
  "endTime": "2026-05-07T23:59:59Z"
}
```

### 3.5 更新轮播图

**接口**: `PATCH /api/admin/banners/:id`  
**描述**: 更新轮播图信息  
**权限**: 管理员  
**状态**: [TODO]

### 3.6 删除轮播图

**接口**: `DELETE /api/admin/banners/:id`  
**描述**: 删除轮播图  
**权限**: 管理员  
**状态**: [TODO]

### 3.7 发布/下线轮播图

**接口**: `PATCH /api/admin/banners/:id/status`  
**描述**: 修改轮播图状态  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "status": "published"
}
```

### 3.8 调整排序

**接口**: `PATCH /api/admin/banners/:id/sort`  
**描述**: 调整轮播图排序  
**权限**: 管理员  
**状态**: [TODO]

**请求体**:
```json
{
  "sortOrder": 5
}
```

---

## 4. 业务逻辑

### 4.1 状态流转

```
                    ┌─────────────┐
                    │    草稿     │
                    │   (draft)   │
                    └──────┬──────┘
                           │ 发布
                           ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   重新编辑   │◀───│  (published)│───▶│  (offline)  │
│             │    │   已发布     │    │    下线     │
└─────────────┘    └──────┬──────┘    └─────────────┘
                          │
                          │ 定时自动
                          ▼
                   ┌─────────────┐
                   │   已过期    │
                   │  (expired)  │
                   └─────────────┘
```

### 4.2 有效期控制

```typescript
// 查询有效轮播图
function getActiveBanners(position: BannerPosition) {
  return db.query.banners.findMany({
    where: and(
      eq(banners.position, position),
      eq(banners.status, 'published'),
      or(
        isNull(banners.startTime),
        lte(banners.startTime, now())
      ),
      or(
        isNull(banners.endTime),
        gte(banners.endTime, now())
      )
    ),
    orderBy: asc(banners.sortOrder)
  })
}
```

### 4.3 跳转处理

| linkType | linkValue示例 | 处理方式 |
|----------|---------------|----------|
| none | - | 仅展示，无跳转 |
| activity | 活动ID | 跳转到活动详情页 |
| url | https://... | 外部链接，使用web-view |
| miniapp | appid/pages/... | 跳转到其他小程序 |

### 4.4 统计机制

**浏览统计**: 轮播图每次在页面展示时+1（同一用户多次展示只计1次/天）
**点击统计**: 用户点击轮播图时+1

---

## 5. 安全要求

### 5.1 内容安全

| 检查项 | 实现方式 | 说明 |
|--------|----------|------|
| 图片审核 | 微信图片审核 | 上传时自动检测 |
| 链接安全 | 域名白名单 | 只允许指定域名跳转 |
| 内容合规 | 敏感词过滤 | 标题敏感词检测 |

### 5.2 权限控制

- 仅管理员可创建/编辑/删除轮播图
- 发布操作需二次确认

### 5.3 数据验证

| 字段 | 规则 | 错误提示 |
|------|------|----------|
| title | 必填, 2-100字符 | 标题长度需在2-100字符之间 |
| imageUrl | 必填, 有效URL | 请上传轮播图图片 |
| linkValue | 根据linkType验证 | 链接格式不正确 |
| sortOrder | ≥0 | 排序序号不能为负数 |

---

## 6. 前端实现

### 6.1 小程序端组件

**BannerSwiper组件**:
```vue
<template>
  <view class="banner-swiper">
    <swiper 
      :indicator-dots="true" 
      :autoplay="true" 
      :interval="3000"
      @change="onChange"
    >
      <swiper-item v-for="banner in banners" :key="banner.id">
        <image 
          :src="banner.imageUrl" 
          mode="aspectFill"
          @click="onClick(banner)"
        />
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ position: BannerPosition }>()
const banners = ref<Banner[]>([])

onMounted(async () => {
  banners.value = await fetchBanners(props.position)
  // 记录展示统计
  banners.value.forEach(b => trackBannerView(b.id))
})

function onClick(banner: Banner) {
  // 记录点击
  trackBannerClick(banner.id)
  // 处理跳转
  handleBannerLink(banner.linkType, banner.linkValue)
}
</script>
```

### 6.2 管理后台页面

| 页面 | 组件 | 功能 |
|------|------|------|
| 轮播图列表 | BannerList.vue | 列表+筛选+排序调整 |
| 创建轮播图 | BannerCreate.vue | 表单创建 |
| 编辑轮播图 | BannerEdit.vue | 表单编辑 |

**轮播图列表组件**:
```vue
<template>
  <div class="banner-list">
    <el-table :data="banners" row-key="id">
      <el-table-column type="index" label="排序" width="80">
        <template #default="{ $index }">
          <el-input-number v-model="banners[$index].sortOrder" 
                          :min="0" 
                          @change="updateSort(banners[$index])" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" />
      <el-table-column label="图片">
        <template #default="{ row }">
          <el-image :src="row.imageUrl" style="width: 120px; height: 50px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="edit(row)">编辑</el-button>
          <el-button :type="row.status === 'published' ? 'danger' : 'success'"
                     @click="toggleStatus(row)">
            {{ row.status === 'published' ? '下线' : '发布' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
```

---

## 7. TDD测试用例

### 7.1 单元测试

```typescript
// tests/unit/banner.service.test.ts
describe('BannerService', () => {
  describe('getActiveBanners', () => {
    it('✅ RED: 不应返回已下线的轮播图', async () => {
      await db.insert(banners).values({
        position: 'home_top',
        title: '下线活动',
        imageUrl: 'https://...',
        status: 'offline'
      })
      const result = await service.getActiveBanners('home_top')
      expect(result.find(b => b.title === '下线活动')).toBeUndefined()
    })

    it('✅ GREEN: 应返回有效期内已发布的轮播图', async () => {
      await db.insert(banners).values({
        position: 'home_top',
        title: '有效活动',
        imageUrl: 'https://...',
        status: 'published',
        startTime: yesterday(),
        endTime: tomorrow()
      })
      const result = await service.getActiveBanners('home_top')
      expect(result.find(b => b.title === '有效活动')).toBeDefined()
    })

    it('✅ RED: 不应返回未到开始时间的轮播图', async () => {
      await db.insert(banners).values({
        position: 'home_top',
        title: '未来活动',
        imageUrl: 'https://...',
        status: 'published',
        startTime: tomorrow()
      })
      const result = await service.getActiveBanners('home_top')
      expect(result.find(b => b.title === '未来活动')).toBeUndefined()
    })
  })

  describe('createBanner', () => {
    it('✅ RED: 非管理员不能创建轮播图', async () => {
      await expect(service.createBanner(validBanner, normalUserId))
        .rejects.toThrow('无权操作')
    })

    it('✅ GREEN: 管理员可创建草稿状态轮播图', async () => {
      const banner = await service.createBanner(validBanner, adminUserId)
      expect(banner.status).toBe('draft')
      expect(banner.createdBy).toBe(adminUserId)
    })
  })
})
```

### 7.2 集成测试

```typescript
// tests/integration/banner.api.test.ts
describe('Banner API', () => {
  describe('GET /api/banners', () => {
    it('✅ RED-GREEN-REFACTOR: 轮播图列表接口', async () => {
      // RED: 不传position参数应报错
      const res1 = await request(app).get('/api/banners')
      expect(res1.status).toBe(400)

      // GREEN: 传position参数返回列表
      const res2 = await request(app).get('/api/banners?position=home_top')
      expect(res2.status).toBe(200)
      expect(Array.isArray(res2.body.data)).toBe(true)

      // REFACTOR: 验证只返回已发布的
      const allPublished = res2.body.data.every(b => b.status === 'published')
      expect(allPublished).toBe(true)
    })
  })

  describe('POST /api/banners/:id/click', () => {
    it('✅ GREEN: 点击应增加点击数', async () => {
      const before = await getBannerClickCount(bannerId)
      await request(app).post(`/api/banners/${bannerId}/click`)
      const after = await getBannerClickCount(bannerId)
      expect(after).toBe(before + 1)
    })
  })
})
```

---

## 8. AI实现提示词

### 8.1 后端API生成

```prompt
基于以下规范生成Nitro API代码：

文件: server/api/banners/index.get.ts
功能: 获取轮播图列表(小程序端)

要求:
1. 使用Drizzle ORM操作PostgreSQL
2. 只返回status='published'且在有效期内的轮播图
3. 按sort_order升序排列
4. 返回标准化响应
5. 包含详细注释

数据表: banners (见spec)
查询条件:
- position: 必填查询参数
- status: 必须等于'published'
- start_time: 为null或<=当前时间
- end_time: 为null或>=当前时间

参考global.spec.md中的响应格式规范。
```

### 8.2 小程序组件生成

```prompt
基于以下规范生成Uniapp组件代码：

文件: components/BannerSwiper.vue
功能: 轮播图展示组件

UI框架: Wot Design Uni (wot-starter-v2)
要求:
1. 使用swiper组件实现轮播
2. 支持自动播放和指示器
3. 点击图片调用API记录点击
4. 根据linkType处理跳转
5. 使用TypeScript
6. 支持position属性控制展示位置

Props:
- position: 'home_top' | 'activity' | 'launch'

API端点:
- GET /api/banners?position={position}
- POST /api/banners/:id/click
```

### 8.3 管理后台生成

```prompt
基于以下规范生成Nuxt管理后台页面：

文件: pages/admin/banners/index.vue
功能: 轮播图管理列表页

UI框架: Element Plus
要求:
1. 表格展示所有轮播图
2. 支持按position和status筛选
3. 支持拖拽或输入调整排序
4. 快速发布/下线操作
5. 编辑和删除功能
6. 图片预览

API端点:
- GET /api/admin/banners
- PATCH /api/admin/banners/:id/status
- PATCH /api/admin/banners/:id/sort
- DELETE /api/admin/banners/:id
```

---

## 9. 实现检查清单

### Phase 2 实现顺序

| 序号 | 模块 | 优先级 | 依赖 |
|------|------|--------|------|
| 1 | 数据表创建 | P0 | - |
| 2 | 小程序轮播图API | P0 | 1 |
| 3 | 小程序BannerSwiper组件 | P0 | 2 |
| 4 | 管理后台列表页 | P1 | 1 |
| 5 | 管理后台创建/编辑 | P1 | 4 |
| 6 | 点击统计功能 | P2 | 2 |
| 7 | 定时任务清理过期轮播图 | P2 | - |

---

## 10. 相关文档

- [全局规范](../global.spec.md)
- [活动模块](../phase1/activity.spec.md) - 跳转目标
