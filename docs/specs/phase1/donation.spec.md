# 捐助模块规范 (Donation Module Specification)

## 1. 概述 (Overview)

### 1.1 功能描述
捐助模块是志愿者活动管理系统的重要组成部分，支持用户提交捐款或捐物凭证，经过管理员审核后发放相应积分，鼓励用户参与公益捐助。

### 1.2 功能范围
- 提交捐助凭证：用户上传捐款/捐物凭证
- 审核捐助：管理员审核用户提交的捐助申请
- 发放捐助积分：审核通过后自动计算并发放积分
- 捐助记录查询：用户查看自己的捐助历史

### 1.3 业务价值
- 激励用户参与公益捐助
- 建立透明的捐助审核机制
- 积分回馈提升用户粘性
- 积累公益数据，展示平台影响力

---

## 2. 数据模型 (Data Model)

### 2.1 主表：donations

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键ID |
| user_id | BIGINT | NOT NULL, FK | 用户ID |
| type | VARCHAR(20) | NOT NULL | 捐助类型：money(捐款)/goods(捐物) |
| amount | DECIMAL(12,2) | NOT NULL | 金额（捐款）或估值（捐物） |
| description | TEXT | NULL | 捐助描述/物品明细 |
| voucher_images | JSON | NOT NULL | 凭证图片URL数组 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 状态：pending/approved/rejected |
| points_granted | INT | DEFAULT 0 | 发放积分 |
| reviewed_by | BIGINT | NULL, FK | 审核人ID |
| review_note | TEXT | NULL | 审核备注 |
| reviewed_at | DATETIME | NULL | 审核时间 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

### 2.2 索引设计

```sql
-- 用户捐助记录查询
CREATE INDEX idx_donations_user_id ON donations(user_id);

-- 状态筛选查询
CREATE INDEX idx_donations_status ON donations(status);

-- 时间排序查询
CREATE INDEX idx_donations_created_at ON donations(created_at);

-- 复合索引：待审核列表
CREATE INDEX idx_donations_status_created ON donations(status, created_at);
```

### 2.3 关联表

**users表（用户表）**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 用户ID |
| nickname | VARCHAR(100) | 用户昵称 |
| avatar | VARCHAR(500) | 用户头像 |

**admins表（管理员表）**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 管理员ID |
| username | VARCHAR(100) | 管理员用户名 |

---

## 3. API接口 (API Specification)

### 3.1 POST /api/donations
提交捐助申请

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 捐助类型：money/goods |
| amount | number | 是 | 金额或估值（元） |
| description | string | 否 | 捐助描述，捐物时必填 |
| voucher_images | array | 是 | 凭证图片URL数组，至少1张 |

**请求示例**
```json
{
  "type": "money",
  "amount": 500.00,
  "description": "为山区儿童捐款",
  "voucher_images": [
    "https://cdn.example.com/vouchers/1.jpg",
    "https://cdn.example.com/vouchers/2.jpg"
  ]
}
```

**响应示例（成功）**
```json
{
  "code": 0,
  "message": "捐助申请提交成功，等待审核",
  "data": {
    "donation_id": 1001,
    "type": "money",
    "amount": 500.00,
    "status": "pending",
    "estimated_points": 5,
    "created_at": "2024-01-15T10:30:00+08:00"
  }
}
```

**响应示例（失败）**
```json
{
  "code": 4101,
  "message": "凭证图片不能为空",
  "data": null
}
```

**错误码**
| 错误码 | 说明 |
|--------|------|
| 4101 | 凭证图片不能为空 |
| 4102 | 金额必须大于0 |
| 4103 | 捐物描述不能为空 |
| 4104 | 图片数量超过限制（最多5张） |

---

### 3.2 GET /api/donations/my
获取当前用户的捐助记录

**查询参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20 |
| status | string | 否 | 状态筛选：pending/approved/rejected |
| type | string | 否 | 类型筛选：money/goods |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 10,
    "page": 1,
    "page_size": 20,
    "summary": {
      "total_donations": 10,
      "total_amount": 3500.00,
      "total_points": 35
    },
    "list": [
      {
        "donation_id": 1001,
        "type": "money",
        "amount": 500.00,
        "description": "为山区儿童捐款",
        "voucher_images": ["https://..."],
        "status": "approved",
        "points_granted": 5,
        "review_note": "感谢您的爱心捐助",
        "reviewed_at": "2024-01-15T14:20:00+08:00",
        "created_at": "2024-01-15T10:30:00+08:00"
      }
    ]
  }
}
```

---

### 3.3 GET /api/admin/donations
获取捐助列表（管理员）

**查询参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20 |
| status | string | 否 | 状态筛选 |
| type | string | 否 | 类型筛选 |
| start_date | string | 否 | 开始日期（YYYY-MM-DD） |
| end_date | string | 否 | 结束日期（YYYY-MM-DD） |

**响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "page_size": 20,
    "pending_count": 15,
    "list": [
      {
        "donation_id": 1001,
        "user": {
          "user_id": 10001,
          "nickname": "爱心用户",
          "avatar": "https://..."
        },
        "type": "money",
        "amount": 500.00,
        "description": "为山区儿童捐款",
        "voucher_images": ["https://..."],
        "status": "pending",
        "estimated_points": 5,
        "created_at": "2024-01-15T10:30:00+08:00"
      }
    ]
  }
}
```

---

### 3.4 PATCH /api/admin/donations/:id/review
审核捐助申请（管理员）

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 是 | 审核结果：approved/rejected |
| review_note | string | 否 | 审核备注 |

**请求示例**
```json
{
  "status": "approved",
  "review_note": "感谢您的爱心捐助"
}
```

**响应示例（审核通过）**
```json
{
  "code": 0,
  "message": "审核完成",
  "data": {
    "donation_id": 1001,
    "status": "approved",
    "points_granted": 5,
    "reviewed_by": {
      "admin_id": 1,
      "username": "管理员"
    },
    "review_note": "感谢您的爱心捐助",
    "reviewed_at": "2024-01-15T14:20:00+08:00"
  }
}
```

**响应示例（审核拒绝）**
```json
{
  "code": 0,
  "message": "审核完成",
  "data": {
    "donation_id": 1001,
    "status": "rejected",
    "points_granted": 0,
    "review_note": "凭证信息不清晰，请重新提交",
    "reviewed_at": "2024-01-15T14:20:00+08:00"
  }
}
```

**错误码**
| 错误码 | 说明 |
|--------|------|
| 4105 | 捐助记录不存在 |
| 4106 | 该捐助已审核，不能重复审核 |
| 4107 | 无效的审核状态 |

---

## 4. 业务逻辑 (Business Logic)

### 4.1 积分规则计算

**捐款积分规则**
- 每100元 = 1积分
- 不足100元部分不计算积分
- 计算公式：`points = floor(amount / 100)`

**捐物积分规则**
- 按物品估值计算，每100元 = 1积分
- 物品估值由用户申报，管理员审核时确认
- 计算公式：`points = floor(amount / 100)`

**积分计算示例**
| 捐助类型 | 金额/估值 | 计算 | 获得积分 |
|----------|-----------|------|----------|
| 捐款 | 500元 | floor(500/100) | 5积分 |
| 捐款 | 150元 | floor(150/100) | 1积分 |
| 捐款 | 99元 | floor(99/100) | 0积分 |
| 捐物 | 300元 | floor(300/100) | 3积分 |

**积分计算代码示例**
```python
def calculate_donation_points(amount: Decimal) -> int:
    """
    计算捐助积分
    :param amount: 金额或估值
    :return: 积分数量
    """
    return int(amount // 100)
```

### 4.2 审核流程

**状态流转图**
```
[用户提交] --> pending（待审核）
                   |
          +--------+--------+
          |                 |
    [管理员通过]       [管理员拒绝]
          |                 |
          v                 v
    approved（已通过）  rejected（已拒绝）
          |
          v
    [发放积分]
```

**审核流程说明**
1. 用户提交捐助申请，状态为 `pending`
2. 管理员查看待审核列表
3. 管理员审核：
   - 通过：状态变为 `approved`，计算并发放积分
   - 拒绝：状态变为 `rejected`，不发放积分
4. 已审核的记录不能再次审核

### 4.3 图片上传流程

**上传流程**
1. 前端调用图片上传接口（独立于捐助提交）
2. 服务端返回图片URL
3. 用户提交捐助时携带图片URL数组
4. 服务端验证图片URL有效性

**图片限制**
- 格式：jpg, jpeg, png
- 单张大小：最大5MB
- 数量：最少1张，最多5张

### 4.4 通知机制

**审核结果通知**
- 审核通过：发送通知"您的捐助已审核通过，获得X积分"
- 审核拒绝：发送通知"您的捐助审核未通过，原因：XXX"

---

## 5. 安全要求 (Security Requirements)

### 5.1 认证授权
- 所有捐助提交接口需要JWT认证
- 管理员接口需要管理员权限
- 用户只能查看自己的捐助记录

### 5.2 数据验证
- 金额必须大于0
- 凭证图片必须上传至少1张
- 捐物类型必须填写描述
- 图片URL必须来自可信域名

### 5.3 防作弊机制
- 限制单日提交次数（最多10次）
- 图片内容审核（敏感信息过滤）
- 相同凭证图片不能重复提交
- 大额捐助需要人工复核

### 5.4 数据安全
- 捐助记录不可删除，仅可标记无效
- 敏感操作记录审计日志
- 管理员审核操作留痕

---

## 6. 前端实现 (Frontend Implementation)

### 6.1 提交捐助页面

**功能组件**
- 类型选择：捐款/捐物单选
- 金额输入：数字输入框
- 描述输入：多行文本框（捐物时必填）
- 图片上传：多图上传组件
- 积分预估：实时显示预计获得积分

**交互流程**
1. 选择捐助类型
2. 输入金额或估值
3. 上传凭证图片（1-5张）
4. 填写描述（捐物时）
5. 查看积分预估
6. 提交申请

### 6.2 捐助记录页面

**功能组件**
- 列表组件：展示捐助历史
- 状态标签：pending/approved/rejected
- 筛选组件：按状态、类型筛选
- 统计卡片：显示总捐助金额和积分

### 6.3 管理员审核页面

**功能组件**
- 待审核列表：显示pending状态的捐助
- 图片预览：查看凭证图片
- 审核操作：通过/拒绝按钮
- 备注输入：审核备注
- 批量操作：支持批量审核

---

## 7. TDD测试 (Test-Driven Development)

### 7.1 单元测试

**测试文件**: `tests/unit/services/test_donation_service.py`

```python
import pytest
from decimal import Decimal
from unittest.mock import Mock, patch
from services.donation_service import DonationService

class TestDonationService:
    """捐助服务单元测试"""
    
    def setup_method(self):
        self.service = DonationService()
    
    def test_calculate_points_exact_100(self):
        """测试：正好100元获得1积分"""
        points = self.service.calculate_points(Decimal('100'))
        assert points == 1
    
    def test_calculate_points_500(self):
        """测试：500元获得5积分"""
        points = self.service.calculate_points(Decimal('500'))
        assert points == 5
    
    def test_calculate_points_150(self):
        """测试：150元获得1积分"""
        points = self.service.calculate_points(Decimal('150'))
        assert points == 1
    
    def test_calculate_points_99(self):
        """测试：99元获得0积分"""
        points = self.service.calculate_points(Decimal('99'))
        assert points == 0
    
    def test_calculate_points_1000(self):
        """测试：1000元获得10积分"""
        points = self.service.calculate_points(Decimal('1000'))
        assert points == 10
    
    def test_validate_voucher_images_empty(self):
        """测试：空图片列表验证失败"""
        result = self.service.validate_voucher_images([])
        assert result['valid'] is False
        assert result['error'] == '凭证图片不能为空'
    
    def test_validate_voucher_images_too_many(self):
        """测试：图片超过5张验证失败"""
        images = ['url1', 'url2', 'url3', 'url4', 'url5', 'url6']
        result = self.service.validate_voucher_images(images)
        assert result['valid'] is False
        assert result['error'] == '图片数量超过限制（最多5张）'
    
    def test_validate_voucher_images_valid(self):
        """测试：有效图片列表验证通过"""
        images = ['url1', 'url2', 'url3']
        result = self.service.validate_voucher_images(images)
        assert result['valid'] is True
    
    def test_validate_amount_zero(self):
        """测试：金额为0验证失败"""
        result = self.service.validate_amount(Decimal('0'))
        assert result['valid'] is False
    
    def test_validate_amount_negative(self):
        """测试：负数金额验证失败"""
        result = self.service.validate_amount(Decimal('-100'))
        assert result['valid'] is False
    
    def test_validate_amount_positive(self):
        """测试：正数金额验证通过"""
        result = self.service.validate_amount(Decimal('100'))
        assert result['valid'] is True
    
    @patch('services.donation_service.DonationRepository')
    def test_approve_donation_success(self, mock_repo):
        """测试：审核通过成功"""
        donation = Mock(
            id=1,
            amount=Decimal('500'),
            status='pending',
            points_granted=0
        )
        mock_repo.find_by_id.return_value = donation
        
        result = self.service.approve_donation(
            donation_id=1,
            admin_id=1,
            review_note='感谢捐助'
        )
        
        assert result['status'] == 'approved'
        assert result['points_granted'] == 5
    
    @patch('services.donation_service.DonationRepository')
    def test_approve_already_reviewed(self, mock_repo):
        """测试：已审核的不能重复审核"""
        donation = Mock(
            id=1,
            status='approved',
            points_granted=5
        )
        mock_repo.find_by_id.return_value = donation
        
        with pytest.raises(ValueError, match='该捐助已审核'):
            self.service.approve_donation(
                donation_id=1,
                admin_id=1,
                review_note='感谢捐助'
            )
```

### 7.2 集成测试

**测试文件**: `tests/integration/test_donation_api.py`

```python
import pytest
from decimal import Decimal

class TestDonationAPI:
    """捐助API集成测试"""
    
    def test_submit_donation_money_success(self, client, auth_headers):
        """测试：提交捐款申请成功"""
        response = client.post(
            '/api/donations',
            headers=auth_headers,
            json={
                'type': 'money',
                'amount': 500.00,
                'description': '为山区儿童捐款',
                'voucher_images': ['https://example.com/1.jpg']
            }
        )
        
        assert response.status_code == 200
        assert response.json['code'] == 0
        assert response.json['data']['status'] == 'pending'
        assert response.json['data']['estimated_points'] == 5
    
    def test_submit_donation_goods_success(self, client, auth_headers):
        """测试：提交捐物申请成功"""
        response = client.post(
            '/api/donations',
            headers=auth_headers,
            json={
                'type': 'goods',
                'amount': 300.00,
                'description': '捐赠图书50本',
                'voucher_images': ['https://example.com/1.jpg']
            }
        )
        
        assert response.status_code == 200
        assert response.json['code'] == 0
        assert response.json['data']['estimated_points'] == 3
    
    def test_submit_donation_empty_images(self, client, auth_headers):
        """测试：空图片列表提交失败"""
        response = client.post(
            '/api/donations',
            headers=auth_headers,
            json={
                'type': 'money',
                'amount': 500.00,
                'voucher_images': []
            }
        )
        
        assert response.status_code == 400
        assert response.json['code'] == 4101
    
    def test_submit_donation_invalid_amount(self, client, auth_headers):
        """测试：无效金额提交失败"""
        response = client.post(
            '/api/donations',
            headers=auth_headers,
            json={
                'type': 'money',
                'amount': 0,
                'voucher_images': ['https://example.com/1.jpg']
            }
        )
        
        assert response.status_code == 400
        assert response.json['code'] == 4102
    
    def test_get_my_donations(self, client, auth_headers, create_donations):
        """测试：获取个人捐助记录"""
        create_donations(user_id=1, count=5)
        
        response = client.get('/api/donations/my', headers=auth_headers)
        
        assert response.status_code == 200
        assert len(response.json['data']['list']) == 5
    
    def test_get_my_donations_with_filter(self, client, auth_headers, create_donations):
        """测试：带筛选条件的捐助记录查询"""
        create_donations(user_id=1, status='approved', count=3)
        create_donations(user_id=1, status='pending', count=2)
        
        response = client.get(
            '/api/donations/my?status=approved',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert len(response.json['data']['list']) == 3
    
    def test_admin_review_approve(self, client, admin_headers, create_donation):
        """测试：管理员审核通过"""
        donation = create_donation(status='pending', amount=500)
        
        response = client.patch(
            f'/api/admin/donations/{donation.id}/review',
            headers=admin_headers,
            json={
                'status': 'approved',
                'review_note': '感谢您的爱心捐助'
            }
        )
        
        assert response.status_code == 200
        assert response.json['data']['status'] == 'approved'
        assert response.json['data']['points_granted'] == 5
    
    def test_admin_review_reject(self, client, admin_headers, create_donation):
        """测试：管理员审核拒绝"""
        donation = create_donation(status='pending', amount=500)
        
        response = client.patch(
            f'/api/admin/donations/{donation.id}/review',
            headers=admin_headers,
            json={
                'status': 'rejected',
                'review_note': '凭证信息不清晰'
            }
        )
        
        assert response.status_code == 200
        assert response.json['data']['status'] == 'rejected'
        assert response.json['data']['points_granted'] == 0
    
    def test_admin_review_already_reviewed(self, client, admin_headers, create_donation):
        """测试：重复审核失败"""
        donation = create_donation(status='approved', amount=500)
        
        response = client.patch(
            f'/api/admin/donations/{donation.id}/review',
            headers=admin_headers,
            json={
                'status': 'approved',
                'review_note': '再次审核'
            }
        )
        
        assert response.status_code == 400
        assert response.json['code'] == 4106
```

### 7.3 端到端测试

**测试文件**: `tests/e2e/test_donation_flow.py`

```python
import pytest

class TestDonationFlow:
    """捐助端到端测试"""
    
    def test_complete_donation_flow(self, page, test_user):
        """测试：完整捐助提交流程"""
        # 1. 用户登录
        page.goto('/login')
        page.fill('[name=phone]', test_user.phone)
        page.fill('[name=password]', test_user.password)
        page.click('button[type=submit]')
        
        # 2. 进入捐助页面
        page.goto('/donations/submit')
        
        # 3. 选择捐助类型
        page.click('[data-testid=donation-type-money]')
        
        # 4. 输入金额
        page.fill('[data-testid=amount-input]', '500')
        
        # 5. 上传图片（模拟）
        page.evaluate('''() => {
            window.uploadedImages = ['https://cdn.example.com/test.jpg'];
        }''')
        
        # 6. 填写描述
        page.fill('[data-testid=description-input]', '为山区儿童捐款')
        
        # 7. 验证积分预估
        points_text = page.inner_text('[data-testid=estimated-points]')
        assert '5' in points_text
        
        # 8. 提交申请
        page.click('[data-testid=submit-donation]')
        
        # 9. 验证提交成功
        assert page.is_visible('[data-testid=donation-success]')
    
    def test_admin_review_flow(self, page, test_admin, test_donation):
        """测试：管理员审核流程"""
        # 1. 管理员登录
        page.goto('/admin/login')
        page.fill('[name=username]', test_admin.username)
        page.fill('[name=password]', test_admin.password)
        page.click('button[type=submit]')
        
        # 2. 进入审核页面
        page.goto('/admin/donations')
        
        # 3. 找到待审核记录
        page.click(f'[data-testid=review-donation-{test_donation.id}]')
        
        # 4. 查看凭证图片
        assert page.is_visible('[data-testid=voucher-image]')
        
        # 5. 填写审核备注
        page.fill('[data-testid=review-note]', '感谢您的爱心捐助')
        
        # 6. 点击通过
        page.click('[data-testid=approve-button]')
        
        # 7. 验证审核成功
        assert page.is_visible('[data-testid=review-success]')
```

---

## 8. AI提示词 (AI Implementation Prompt)

### 8.1 后端实现提示词

```
请实现志愿者活动管理系统的捐助模块后端代码。

【需求背景】
这是一个志愿者活动管理系统，需要实现捐助功能，支持用户提交捐款或捐物凭证，管理员审核后发放积分。

【技术栈】
- 语言：Python 3.11
- 框架：FastAPI
- ORM：SQLAlchemy
- 数据库：MySQL 8.0
- 消息队列：Celery + Redis

【数据模型】
donation表：
- id: BIGINT 主键
- user_id: BIGINT 外键
- type: VARCHAR(20) - money/goods
- amount: DECIMAL(12,2)
- description: TEXT
- voucher_images: JSON
- status: VARCHAR(20) - pending/approved/rejected
- points_granted: INT
- reviewed_by: BIGINT
- review_note: TEXT
- reviewed_at: DATETIME
- created_at: DATETIME

【业务规则】
1. 积分规则：每100元 = 1积分，不足100元部分不计算
2. 凭证图片：至少1张，最多5张
3. 捐物类型必须填写描述
4. 金额必须大于0
5. 审核流程：pending -> approved/rejected
6. 审核通过后自动发放积分
7. 已审核的记录不能再次审核

【需要实现的API】
1. POST /api/donations - 提交捐助申请
2. GET /api/donations/my - 我的捐助记录
3. GET /api/admin/donations - 捐助列表（管理员）
4. PATCH /api/admin/donations/{id}/review - 审核捐助

【代码要求】
1. 使用Repository模式组织数据访问层
2. 使用Service层封装业务逻辑
3. 实现积分计算逻辑
4. 审核通过时使用Celery异步发放积分
5. 添加完整的错误处理和日志记录
6. 编写完整的单元测试

【输出要求】
1. 模型定义（SQLAlchemy）
2. Repository层代码
3. Service层代码（包含积分计算、审核逻辑等）
4. API路由代码
5. Celery任务代码
6. 单元测试代码
7. 必要的迁移脚本

请按照TDD方式，先写测试再实现功能。
```

### 8.2 前端实现提示词

```
请实现志愿者活动管理系统的捐助模块前端代码。

【需求背景】
志愿者活动管理系统的前端捐助功能，支持用户提交捐助申请和查看捐助记录。

【技术栈】
- 框架：Vue 3 + TypeScript
- UI库：Element Plus
- HTTP：Axios
- 图片上传：自定义上传组件

【页面需求】

1. 提交捐助页面（/donations/submit）
   - 捐助类型选择：捐款/捐物单选按钮
   - 金额输入：数字输入框，实时显示积分预估
   - 描述输入：多行文本框（捐物时必填）
   - 图片上传：多图上传组件，支持预览和删除
   - 积分预估显示：根据金额实时计算
   - 提交按钮：表单验证通过后启用

2. 我的捐助记录页面（/donations/my）
   - 列表展示捐助历史
   - 状态标签：待审核/已通过/已拒绝
   - 筛选功能：按状态、类型筛选
   - 统计卡片：总捐助金额、总获得积分
   - 详情展开：查看审核备注

3. 管理员审核页面（/admin/donations）
   - 待审核列表：显示pending状态的捐助
   - 图片预览：点击查看大图
   - 审核操作：通过/拒绝按钮
   - 备注输入：审核备注文本框
   - 批量操作：支持批量通过/拒绝
   - 时间筛选：按日期范围筛选

【组件要求】
1. 积分计算组件：根据金额实时计算积分
2. 图片上传组件：支持多图、预览、删除
3. 状态标签组件：显示不同状态的样式
4. 统计卡片组件：展示汇总数据

【接口对接】
- POST /api/donations - 提交捐助
- GET /api/donations/my - 获取记录
- GET /api/admin/donations - 管理员列表
- PATCH /api/admin/donations/{id}/review - 审核
```