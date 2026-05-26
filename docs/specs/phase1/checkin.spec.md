# 签到模块规范 (Check-in Module Specification)

## 1. 概述 (Overview)

### 1.1 功能描述
签到模块是志愿者活动管理系统的核心功能之一，支持志愿者通过GPS定位或扫描二维码完成活动签到，记录签到信息并发放积分奖励。

### 1.2 功能范围
- GPS签到：基于地理位置的自动签到
- 扫码签到：扫描活动二维码完成签到
- 签到记录查询：查看个人签到历史
- 签到统计：活动签到数据统计分析

### 1.3 业务价值
- 确保志愿者真实参与活动
- 自动化签到流程，减少人工核验成本
- 积分激励，提升志愿者参与积极性
- 数据沉淀，支持活动效果评估

---

## 2. 数据模型 (Data Model)

### 2.1 主表：activity_checkins

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键ID |
| activity_id | BIGINT | NOT NULL, FK | 活动ID |
| user_id | BIGINT | NOT NULL, FK | 用户ID |
| checkin_type | VARCHAR(20) | NOT NULL | 签到类型：gps/qr_code |
| latitude | DECIMAL(10,8) | NULL | 纬度（GPS签到时） |
| longitude | DECIMAL(11,8) | NULL | 经度（GPS签到时） |
| distance | DECIMAL(10,2) | NULL | 与活动地点距离（米） |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'success' | 状态：success/failed/invalid |
| checkin_time | DATETIME | NOT NULL | 签到时间 |
| points_granted | INT | DEFAULT 0 | 发放积分 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

### 2.2 索引设计

```sql
-- 复合索引：活动签到查询
CREATE INDEX idx_activity_checkins_activity_id ON activity_checkins(activity_id);

-- 复合索引：用户签到记录查询
CREATE INDEX idx_activity_checkins_user_id ON activity_checkins(user_id);

-- 复合索引：防止重复签到
CREATE UNIQUE INDEX idx_activity_checkins_unique 
ON activity_checkins(activity_id, user_id);

-- 时间索引：签到统计查询
CREATE INDEX idx_activity_checkins_time ON activity_checkins(checkin_time);
```

### 2.3 关联表

**activities表（活动表）**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 活动ID |
| location_lat | DECIMAL(10,8) | 活动地点纬度 |
| location_lng | DECIMAL(11,8) | 活动地点经度 |
| checkin_radius | INT | 签到允许半径（米） |
| start_time | DATETIME | 活动开始时间 |
| end_time | DATETIME | 活动结束时间 |
| points_reward | INT | 签到奖励积分 |

---

## 3. API接口 (API Specification)

### 3.1 POST /api/activities/:id/checkin
执行签到操作

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| checkin_type | string | 是 | 签到类型：gps/qr_code |
| latitude | number | 条件 | GPS签到时必填，纬度 |
| longitude | number | 条件 | GPS签到时必填，经度 |
| qr_token | string | 条件 | 扫码签到时必填，二维码令牌 |

**响应示例（成功）**
```json
{
  "code": 0,
  "message": "签到成功",
  "data": {
    "checkin_id": 12345,
    "activity_id": 1001,
    "checkin_type": "gps",
    "distance": 45.5,
    "points_granted": 10,
    "checkin_time": "2024-01-15T09:30:00+08:00"
  }
}
```

**响应示例（失败）**
```json
{
  "code": 4001,
  "message": "签到失败：不在签到时间范围内",
  "data": null
}
```

**错误码**
| 错误码 | 说明 |
|--------|------|
| 4001 | 不在签到时间范围内 |
| 4002 | 超出签到距离范围 |
| 4003 | 已经签到过 |
| 4004 | 二维码已过期或无效 |
| 4005 | 活动不存在或已取消 |

---

### 3.2 GET /api/activities/:id/checkins
获取活动的签到记录列表（管理员/组织者）

**查询参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20 |
| status | string | 否 | 状态筛选：success/failed |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 150,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "checkin_id": 12345,
        "user_id": 10001,
        "user_name": "张三",
        "user_avatar": "https://...",
        "checkin_type": "gps",
        "distance": 45.5,
        "points_granted": 10,
        "checkin_time": "2024-01-15T09:30:00+08:00"
      }
    ]
  }
}
```

---

### 3.3 GET /api/checkins/my
获取当前用户的签到记录

**查询参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20 |
| activity_id | int | 否 | 按活动筛选 |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 25,
    "page": 1,
    "page_size": 20,
    "summary": {
      "total_checkins": 25,
      "total_points": 250
    },
    "list": [
      {
        "checkin_id": 12345,
        "activity_id": 1001,
        "activity_title": "社区环保活动",
        "checkin_type": "gps",
        "points_granted": 10,
        "checkin_time": "2024-01-15T09:30:00+08:00"
      }
    ]
  }
}
```

---

## 4. 业务逻辑 (Business Logic)

### 4.1 GPS距离计算

**Haversine公式计算两点间距离**
```python
def calculate_distance(lat1, lng1, lat2, lng2):
    """
    计算两个GPS坐标之间的距离（米）
    """
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371000  # 地球半径（米）
    
    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lng = radians(lng2 - lng1)
    
    a = sin(delta_lat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lng/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c
```

**签到距离验证流程**
1. 获取活动地点坐标 (activity.location_lat, activity.location_lng)
2. 获取用户当前坐标 (request.latitude, request.longitude)
3. 计算两点距离
4. 验证距离 <= activity.checkin_radius（默认500米）

### 4.2 签到时间窗口

**时间窗口规则**
- 开始时间：活动开始前15分钟
- 结束时间：活动结束后30分钟

**验证逻辑**
```python
def is_within_checkin_window(activity, current_time):
    checkin_start = activity.start_time - timedelta(minutes=15)
    checkin_end = activity.end_time + timedelta(minutes=30)
    return checkin_start <= current_time <= checkin_end
```

### 4.3 重复签到检查

**检查逻辑**
1. 查询 activity_checkins 表
2. 条件：activity_id = ? AND user_id = ?
3. 若记录存在，返回错误：已签到过

### 4.4 签到流程图

```
开始签到
    |
    v
验证活动状态 <--- 活动不存在/已取消 ---> 返回错误4005
    | 正常
    v
检查签到时间窗口 <--- 不在时间范围内 ---> 返回错误4001
    | 通过
    v
检查是否已签到 <--- 已签到 ---> 返回错误4003
    | 未签到
    v
根据签到类型验证
    |
    |-- GPS签到 --> 计算距离
    |               |
    |               v
    |           距离验证 <--- 超出范围 ---> 返回错误4002
    |               | 通过
    |               v
    |-- 扫码签到 --> 验证二维码
                    |
                    v
                二维码验证 <--- 无效/过期 ---> 返回错误4004
                    | 通过
                    v
                创建签到记录
                    |
                    v
                发放积分
                    |
                    v
                返回成功
```

### 4.5 积分发放

**积分规则**
- 基础积分：activity.points_reward（活动配置）
- 发放方式：签到成功后实时发放到用户积分账户

**积分发放流程**
1. 签到记录创建成功
2. 调用积分服务：PointService.grant(user_id, activity.points_reward, 'checkin', checkin_id)
3. 更新 checkins.points_granted 字段
4. 发送签到成功通知

---

## 5. 安全要求 (Security Requirements)

### 5.1 认证授权
- 所有签到接口需要JWT认证
- GET /api/activities/:id/checkins 需要管理员或活动组织者权限
- 用户只能查看自己的签到记录

### 5.2 防作弊机制
- GPS坐标防篡改：前端获取坐标，服务端验证合理性
- 二维码时效性：二维码有效期5分钟，一次性使用
- 签到频率限制：同一设备短时间内不能多次签到

### 5.3 数据安全
- 签到记录不可删除，仅可标记无效
- GPS坐标数据加密存储
- 敏感操作记录审计日志

---

## 6. 前端实现 (Frontend Implementation)

### 6.1 GPS签到页面

**功能组件**
- 地图组件：显示活动位置和用户当前位置
- 距离提示：实时显示与活动地点的距离
- 签到按钮：距离范围内可点击
- 时间提示：显示签到时间窗口状态

**交互流程**
1. 页面加载获取活动信息和用户位置
2. 实时计算并显示距离
3. 距离<=签到半径且时间在窗口内，启用签到按钮
4. 点击签到，调用API
5. 显示签到结果

### 6.2 扫码签到页面

**功能组件**
- 扫码组件：调用摄像头扫描二维码
- 二维码解析：提取qr_token
- 签到确认：扫码后确认签到

### 6.3 签到记录页面

**功能组件**
- 列表组件：展示签到历史
- 筛选组件：按活动筛选
- 统计卡片：显示总签到次数和积分

---

## 7. TDD测试 (Test-Driven Development)

### 7.1 单元测试

**测试文件**: `tests/unit/services/test_checkin_service.py`

```python
import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from services.checkin_service import CheckinService

class TestCheckinService:
    """签到服务单元测试"""
    
    def setup_method(self):
        self.service = CheckinService()
        self.activity = Mock(
            id=1,
            location_lat=39.9042,
            location_lng=116.4074,
            checkin_radius=500,
            start_time=datetime.now() + timedelta(hours=1),
            end_time=datetime.now() + timedelta(hours=3),
            points_reward=10
        )
    
    def test_calculate_distance_same_point(self):
        """测试：相同坐标距离为0"""
        distance = self.service.calculate_distance(39.9042, 116.4074, 39.9042, 116.4074)
        assert distance == 0
    
    def test_calculate_distance_nearby(self):
        """测试：附近坐标距离计算"""
        # 约100米距离
        distance = self.service.calculate_distance(39.9042, 116.4074, 39.9043, 116.4074)
        assert 90 < distance < 110
    
    def test_is_within_checkin_window_before_start(self):
        """测试：活动开始前16分钟不能签到"""
        current_time = self.activity.start_time - timedelta(minutes=16)
        result = self.service.is_within_checkin_window(self.activity, current_time)
        assert result is False
    
    def test_is_within_checkin_window_at_start_margin(self):
        """测试：活动开始前15分钟可以签到"""
        current_time = self.activity.start_time - timedelta(minutes=15)
        result = self.service.is_within_checkin_window(self.activity, current_time)
        assert result is True
    
    def test_is_within_checkin_window_after_end(self):
        """测试：活动结束后31分钟不能签到"""
        current_time = self.activity.end_time + timedelta(minutes=31)
        result = self.service.is_within_checkin_window(self.activity, current_time)
        assert result is False
    
    def test_is_within_checkin_window_at_end_margin(self):
        """测试：活动结束后30分钟可以签到"""
        current_time = self.activity.end_time + timedelta(minutes=30)
        result = self.service.is_within_checkin_window(self.activity, current_time)
        assert result is True
    
    def test_validate_distance_within_radius(self):
        """测试：在签到半径内验证通过"""
        user_lat, user_lng = 39.9042, 116.4074  # 同一点
        result = self.service.validate_distance(self.activity, user_lat, user_lng)
        assert result['valid'] is True
    
    def test_validate_distance_outside_radius(self):
        """测试：超出签到半径验证失败"""
        user_lat, user_lng = 39.9100, 116.4100  # 约1公里外
        result = self.service.validate_distance(self.activity, user_lat, user_lng)
        assert result['valid'] is False
        assert result['distance'] > self.activity.checkin_radius
    
    @patch('services.checkin_service.CheckinRepository')
    def test_check_duplicate_first_time(self, mock_repo):
        """测试：首次签到不重复"""
        mock_repo.find_by_activity_and_user.return_value = None
        result = self.service.check_duplicate(1, 1001)
        assert result is False
    
    @patch('services.checkin_service.CheckinRepository')
    def test_check_duplicate_already_checked(self, mock_repo):
        """测试：已签到返回重复"""
        mock_repo.find_by_activity_and_user.return_value = Mock(id=1)
        result = self.service.check_duplicate(1, 1001)
        assert result is True
```

### 7.2 集成测试

**测试文件**: `tests/integration/test_checkin_api.py`

```python
import pytest
from datetime import datetime, timedelta

class TestCheckinAPI:
    """签到API集成测试"""
    
    def test_gps_checkin_success(self, client, auth_headers, create_activity):
        """测试：GPS签到成功"""
        activity = create_activity(
            location_lat=39.9042,
            location_lng=116.4074,
            checkin_radius=500
        )
        
        response = client.post(
            f'/api/activities/{activity.id}/checkin',
            headers=auth_headers,
            json={
                'checkin_type': 'gps',
                'latitude': 39.9042,
                'longitude': 116.4074
            }
        )
        
        assert response.status_code == 200
        assert response.json['code'] == 0
        assert response.json['data']['points_granted'] == activity.points_reward
    
    def test_gps_checkin_out_of_range(self, client, auth_headers, create_activity):
        """测试：GPS签到超出范围失败"""
        activity = create_activity(
            location_lat=39.9042,
            location_lng=116.4074,
            checkin_radius=100
        )
        
        response = client.post(
            f'/api/activities/{activity.id}/checkin',
            headers=auth_headers,
            json={
                'checkin_type': 'gps',
                'latitude': 39.9100,  # 约1公里外
                'longitude': 116.4100
            }
        )
        
        assert response.status_code == 400
        assert response.json['code'] == 4002
    
    def test_checkin_outside_time_window(self, client, auth_headers, create_activity):
        """测试：签到时间窗口外失败"""
        activity = create_activity(
            start_time=datetime.now() + timedelta(days=1),
            end_time=datetime.now() + timedelta(days=1, hours=2)
        )
        
        response = client.post(
            f'/api/activities/{activity.id}/checkin',
            headers=auth_headers,
            json={
                'checkin_type': 'gps',
                'latitude': 39.9042,
                'longitude': 116.4074
            }
        )
        
        assert response.status_code == 400
        assert response.json['code'] == 4001
    
    def test_duplicate_checkin_rejected(self, client, auth_headers, create_activity, create_checkin):
        """测试：重复签到被拒绝"""
        activity = create_activity()
        create_checkin(activity_id=activity.id, user_id=1)
        
        response = client.post(
            f'/api/activities/{activity.id}/checkin',
            headers=auth_headers,
            json={
                'checkin_type': 'gps',
                'latitude': 39.9042,
                'longitude': 116.4074
            }
        )
        
        assert response.status_code == 400
        assert response.json['code'] == 4003
    
    def test_get_activity_checkins_pagination(self, client, admin_headers, create_activity, create_checkins):
        """测试：获取活动签到列表分页"""
        activity = create_activity()
        create_checkins(activity_id=activity.id, count=25)
        
        response = client.get(
            f'/api/activities/{activity.id}/checkins?page=1&page_size=10',
            headers=admin_headers
        )
        
        assert response.status_code == 200
        assert len(response.json['data']['list']) == 10
        assert response.json['data']['total'] == 25
    
    def test_get_my_checkins(self, client, auth_headers, create_checkins):
        """测试：获取个人签到记录"""
        create_checkins(user_id=1, count=5)
        
        response = client.get('/api/checkins/my', headers=auth_headers)
        
        assert response.status_code == 200
        assert len(response.json['data']['list']) == 5
        assert response.json['data']['summary']['total_checkins'] == 5
```

### 7.3 端到端测试

**测试文件**: `tests/e2e/test_checkin_flow.py`

```python
import pytest

class TestCheckinFlow:
    """签到端到端测试"""
    
    def test_complete_checkin_flow(self, page, test_user, test_activity):
        """测试：完整签到流程"""
        # 1. 用户登录
        page.goto('/login')
        page.fill('[name=phone]', test_user.phone)
        page.fill('[name=password]', test_user.password)
        page.click('button[type=submit]')
        
        # 2. 进入活动详情
        page.goto(f'/activities/{test_activity.id}')
        
        # 3. 点击签到按钮
        page.click('[data-testid=checkin-button]')
        
        # 4. 选择GPS签到
        page.click('[data-testid=gps-checkin]')
        
        # 5. 允许位置权限（模拟）
        page.evaluate('''() => {
            navigator.geolocation.getCurrentPosition = (success) => {
                success({
                    coords: {
                        latitude: 39.9042,
                        longitude: 116.4074,
                        accuracy: 10
                    }
                });
            };
        }''')
        
        # 6. 确认签到
        page.click('[data-testid=confirm-checkin]')
        
        # 7. 验证签到成功提示
        assert page.is_visible('[data-testid=checkin-success]')
        
        # 8. 验证积分增加
        points_text = page.inner_text('[data-testid=user-points]')
        assert '+10' in points_text
```

---

## 8. AI提示词 (AI Implementation Prompt)

### 8.1 后端实现提示词

```
请实现志愿者活动管理系统的签到模块后端代码。

【需求背景】
这是一个志愿者活动管理系统，需要实现活动签到功能，支持GPS签到和扫码签到两种方式。

【技术栈】
- 语言：Python 3.11
- 框架：FastAPI
- ORM：SQLAlchemy
- 数据库：MySQL 8.0
- 缓存：Redis

【数据模型】
1. activity_checkins表：
   - id: BIGINT 主键
   - activity_id: BIGINT 外键
   - user_id: BIGINT 外键
   - checkin_type: VARCHAR(20) - gps/qr_code
   - latitude: DECIMAL(10,8)
   - longitude: DECIMAL(11,8)
   - distance: DECIMAL(10,2)
   - status: VARCHAR(20)
   - checkin_time: DATETIME
   - points_granted: INT

2. activities表（已有）：
   - location_lat, location_lng: 活动地点坐标
   - checkin_radius: 签到半径（米）
   - start_time, end_time: 活动时间
   - points_reward: 签到奖励积分

【业务规则】
1. 签到时间窗口：活动开始前15分钟到结束后30分钟
2. GPS签到距离限制：用户位置与活动地点距离 <= checkin_radius
3. 每个用户对每个活动只能签到一次
4. 二维码有效期5分钟，一次性使用
5. 签到成功后发放积分

【需要实现的API】
1. POST /api/activities/{id}/checkin - 执行签到
2. GET /api/activities/{id}/checkins - 活动签到列表（管理员）
3. GET /api/checkins/my - 我的签到记录

【代码要求】
1. 使用Repository模式组织数据访问层
2. 使用Service层封装业务逻辑
3. 实现Haversine公式计算GPS距离
4. 添加完整的错误处理和日志记录
5. 使用Redis缓存二维码令牌
6. 编写完整的单元测试

【输出要求】
1. 模型定义（SQLAlchemy）
2. Repository层代码
3. Service层代码（包含距离计算、时间窗口验证等）
4. API路由代码
5. 单元测试代码
6. 必要的迁移脚本

请按照TDD方式，先写测试再实现功能。
```

### 8.2 前端实现提示词

```
请实现志愿者活动管理系统的签到模块前端代码。

【需求背景】
志愿者活动管理系统的前端签到功能，需要支持GPS签到和扫码签到。

【技术栈】
- 框架：Vue 3 + TypeScript
- UI库：Element Plus
- 地图：高德地图JS API
- 扫码：html5-qrcode
- HTTP：Axios

【页面需求】

1. 签到页面（/activities/:id/checkin）
   - 显示活动信息（标题、时间、地点）
   - 地图组件显示活动位置和用户当前位置
   - 实时显示与活动地点的距离
   - 两种签到方式切换：GPS签到 / 扫码签到
   - GPS签到：获取用户位置，验证距离后提交
   - 扫码签到：调用摄像头扫描二维码
   - 签到按钮状态：根据时间窗口和距离动态启用/禁用

2. 签到成功页面
   - 显示签到成功提示
   - 显示获得的积分
   - 显示签到时间和方式
   - 返回活动详情按钮

3. 我的签到记录页面（/checkins/my）
   - 列表展示签到历史
   - 显示活动名称、签到时间、获得积分
   - 支持按活动筛选
   - 顶部统计卡片：总签到次数、总积分
