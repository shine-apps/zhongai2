# 众爱联盟 - 规范文件体系

> **项目**: 众爱联盟公益积分平台  
> **版本**: v1.1  
> **更新日期**: 2026-05-26

---

## 目录结构

```
specs/
├── README.md                   # 本文件 - 规范体系说明
├── global.spec.md              # 全局规范（通用约定）
├── phase1/                     # Phase 1 规范（MVP基础框架）
│   ├── auth.spec.md            # 认证模块
│   ├── user.spec.md            # 用户模块
│   ├── activity.spec.md         # 活动模块
│   ├── checkin.spec.md         # 签到模块
│   ├── donation.spec.md         # 捐助模块
│   └── points.spec.md          # 积分模块（信誉展示）
├── phase2/                     # Phase 2 规范（排行榜与集市）
│   ├── ranking.spec.md          # 排行榜模块
│   ├── market.spec.md           # 爱心集市模块
│   ├── banner.spec.md           # 轮播图模块
│   └── stats.spec.md           # 统计模块
├── phase3/                     # Phase 3 规范（荣誉体系与反馈）
│   ├── mall.spec.md             # 荣誉商城模块（荣誉兑换）
│   ├── order.spec.md            # 荣誉记录模块（领取记录）
│   └── feedback.spec.md         # 意见反馈模块
└── shared/                     # 共享规范（跨模块）
    ├── database.spec.md         # 数据库规范
    ├── api.spec.md              # API通用规范
    └── notification.spec.md     # 消息通知规范
```

---

## 重要说明

### 积分系统设计

**积分仅作为信誉展示，不可消耗**：
- 积分通过活动签到和捐助审核获得
- 积分累计用于展示用户的公益贡献
- 荣誉等级基于累计积分自动升级
- Phase 3的荣誉商城不消耗积分，基于等级解锁免费领取

### 荣誉等级体系

| 等级 | 名称 | 累计积分门槛 | 图标 |
|------|------|--------------|------|
| 0 | 新手上路 | 0分 | 🌱 |
| 1 | 铜牌志愿者 | ≥10分 | 🥉 |
| 2 | 银牌志愿者 | ≥50分 | 🥈 |
| 3 | 金牌志愿者 | ≥100分 | 🥇 |
| 4 | 钻石志愿者 | ≥200分 | 💎 |

---

## 规范文件使用指南

### 1. 规范文件格式

每个规范文件（`.spec.md`）必须包含以下章节：

| 章节 | 描述 | 必须包含 |
|------|------|----------|
| 概述 | 模块功能描述、业务价值、依赖关系 | ✅ |
| 数据模型 | 数据库表结构、TypeScript类型定义 | ✅ |
| API接口 | 接口列表、请求/响应格式、错误码 | ✅ |
| 业务逻辑 | 核心流程、状态机、边界条件 | ✅ |
| 安全要求 | 权限控制、数据验证、防护措施 | ✅ |
| 测试要求 | 单元测试、集成测试、E2E测试用例 | ✅ |
| AI实现提示词 | 代码生成提示词、Review检查清单 | ✅ |

### 2. 规范与代码对应关系

```
规范文件                          →  生成代码
─────────────────────────────────────────────────────
auth.spec.md                     →  server/api/auth/*
                                     app/pages/login/*
user.spec.md                     →  server/api/users/*
                                     app/pages/profile/*
activity.spec.md                 →  server/api/activities/*
                                     app/pages/activity/*
checkin.spec.md                  →  server/api/activities/*/checkin.*
                                     app/pages/activity/checkin.*
donation.spec.md                 →  server/api/donations.*
                                     app/pages/donation/*
points.spec.md                   →  server/api/points.*
                                     app/pages/points/*
```

### 3. AI代码生成工作流

```
┌─────────────────────────────────────────────────────────────┐
│                    AI代码生成工作流                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: 阅读规范文件                                        │
│          ↓                                                  │
│  Step 2: 提取AI提示词（规范文件末尾的提示词章节）              │
│          ↓                                                  │
│  Step 3: 将提示词+规范关键内容发给AI                         │
│          ↓                                                  │
│  Step 4: AI生成代码                                         │
│          ↓                                                  │
│  Step 5: 人工Review（对照规范文件检查）                       │
│          ↓                                                  │
│  Step 6: 如有问题，补充提示词，重新生成或手动修改              │
│          ↓                                                  │
│  Step 7: 提交代码，标记规范文件中的TODO完成                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. 规范文件状态标记

在规范文件中，使用以下标记表示实现状态：

| 标记 | 含义 | 示例 |
|------|------|------|
| `[TODO]` | 待实现 | `实现登录接口 [TODO]` |
| `[DONE]` | 已完成 | `实现登录接口 [DONE]` |
| `[WIP]` | 进行中 | `实现登录接口 [WIP]` |
| `[BLOCKED]` | 被阻塞 | `实现登录接口 [BLOCKED]` |
| `[INFO]` | 信息说明 | `[INFO] 微信登录需先配置AppID` |

### 5. 规范文件更新流程

1. **需求变更**：先更新规范文件，再更新代码
2. **Bug修复**：如涉及规范变更，同步更新规范文件
3. **代码Review**：Review时检查是否符合规范
4. **版本控制**：规范文件与代码使用相同的git commit

---

## 技术栈索引

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Nuxt | v4 | 框架 |
| Nitro | - | API服务 |
| Drizzle ORM | latest | ORM |
| PostgreSQL | 16+ | 数据库 |
| TypeScript | latest | 语言 |
| Zod | latest | 数据验证 |
| jose | latest | JWT处理 |
| Element Plus | latest | 管理后台UI |
| WangEditor V5 | v5 | 富文本编辑 |

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Uniapp | latest | 跨端框架 |
| wot-starter-v2 | v2 | 模板 |
| Wot Design Uni | v2 | 组件库 |
| Vue | latest | 框架 |
| TypeScript | latest | 语言 |
| Pinia | latest | 状态管理 |
| mp-html | latest | 富文本渲染 |

---

## 相关文档

- [详细设计文档 v1.3](../众爱联盟_详细设计文档_v1.3.md)
- [AI SDD 实施方案](../AI_SDD_实施方案_众爱联盟.md)
