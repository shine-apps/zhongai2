<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get } from '@/utils/request'

interface DynamicRule {
  id: number
  title: string
  content: string
}

const dynamicRules = ref<DynamicRule[]>([])
const loading = ref(false)

const honorLevels = [
  { level: 0, icon: '🌱', name: '新手上路', minPoints: 0 },
  { level: 1, icon: '🥉', name: '铜牌志愿者', minPoints: 10 },
  { level: 2, icon: '🥈', name: '银牌志愿者', minPoints: 50 },
  { level: 3, icon: '🥇', name: '金牌志愿者', minPoints: 100 },
  { level: 4, icon: '💎', name: '钻石志愿者', minPoints: 200 },
]

async function fetchDynamicRules() {
  loading.value = true
  try {
    const data = await get<DynamicRule[]>('/api/points/rules')
    dynamicRules.value = data
  } catch {
    dynamicRules.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDynamicRules()
})
</script>

<template>
  <view class="rules-page">
    <view class="intro-card">
      <text class="card-title">积分说明</text>
      <view class="intro-item">
        <wd-icon name="info" size="28rpx" color="#e54d42" />
        <text class="intro-text">积分是志愿者荣誉的象征，仅代表您的贡献和声望，不可消费或兑换。</text>
      </view>
      <view class="intro-item">
        <wd-icon name="info" size="28rpx" color="#e54d42" />
        <text class="intro-text">积分越高，荣誉等级越高，将获得更多社区认可与权益。</text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">活动签到规则</text>
      <view class="rule-item">
        <text class="rule-index">1.</text>
        <text class="rule-text">报名活动并按时参加，在活动地点签到范围内完成签到。</text>
      </view>
      <view class="rule-item">
        <text class="rule-index">2.</text>
        <text class="rule-text">签到成功后，系统将自动发放该活动的奖励积分。</text>
      </view>
      <view class="rule-item">
        <text class="rule-index">3.</text>
        <text class="rule-text">迟到签到可能获得部分积分，具体以活动设置为准。</text>
      </view>
      <view class="rule-item">
        <text class="rule-index">4.</text>
        <text class="rule-text">报名后未签到将扣除信用积分，多次缺席可能限制报名权限。</text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">捐助积分规则</text>
      <view class="rule-item">
        <text class="rule-index">1.</text>
        <text class="rule-text">每捐助1元人民币可获得1积分。</text>
      </view>
      <view class="rule-item">
        <text class="rule-index">2.</text>
        <text class="rule-text">物资捐助按预估价值折算积分，需审核通过后发放。</text>
      </view>
      <view class="rule-item">
        <text class="rule-index">3.</text>
        <text class="rule-text">捐助积分与活动积分分开统计，共同计入总积分。</text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">荣誉等级</text>
      <view class="honor-table">
        <view class="honor-header">
          <text class="honor-cell header-cell">等级</text>
          <text class="honor-cell header-cell">称号</text>
          <text class="honor-cell header-cell">所需积分</text>
        </view>
        <view class="honor-row" v-for="item in honorLevels" :key="item.level">
          <text class="honor-cell">{{ item.icon }}</text>
          <text class="honor-cell">{{ item.name }}</text>
          <text class="honor-cell points-cell">≥{{ item.minPoints }}分</text>
        </view>
      </view>
    </view>

    <view class="card" v-if="dynamicRules.length">
      <text class="card-title">其他规则</text>
      <view class="dynamic-rule" v-for="rule in dynamicRules" :key="rule.id">
        <text class="dynamic-title">{{ rule.title }}</text>
        <text class="dynamic-content">{{ rule.content }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.rules-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16rpx 24rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

.intro-card,
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.intro-item {
  display: flex;
  align-items: flex-start;
  margin-top: 16rpx;

  &:first-of-type {
    margin-top: 0;
  }
}

.intro-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-left: 8rpx;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  margin-top: 16rpx;

  &:first-of-type {
    margin-top: 0;
  }
}

.rule-index {
  font-size: 26rpx;
  color: #e54d42;
  font-weight: 500;
  margin-right: 8rpx;
  flex-shrink: 0;
}

.rule-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.honor-table {
  border: 1rpx solid #f0f0f0;
  border-radius: 12rpx;
  overflow: hidden;
}

.honor-header {
  display: flex;
  background: #fafafa;
}

.honor-header .header-cell {
  font-weight: 600;
  color: #333;
}

.honor-row {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.honor-cell {
  flex: 1;
  font-size: 26rpx;
  color: #666;
  padding: 20rpx 16rpx;
  text-align: center;

  &.points-cell {
    color: #e54d42;
    font-weight: 500;
  }
}

.dynamic-rule {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.dynamic-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.dynamic-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>
