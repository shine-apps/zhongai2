<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

interface PointsBalance {
  activityBalance: number
  activityTotal: number
  donationBalance: number
  donationTotal: number
}

interface Transaction {
  id: number
  type: string
  description: string
  amount: number
  createdAt: string
}

const userStore = useUserStore()
const balance = ref<PointsBalance>({
  activityBalance: 0,
  activityTotal: 0,
  donationBalance: 0,
  donationTotal: 0,
})
const transactions = ref<Transaction[]>([])
const loading = ref(false)
const displayTotal = ref(0)

const typeIcons: Record<string, string> = {
  activity: 'calendar',
  donation: 'wallet',
  exchange: 'goods',
  sign: 'check',
}

async function fetchBalance() {
  try {
    const data = await get<PointsBalance>('/api/points/balance')
    balance.value = data
    const total = (data.activityBalance ?? 0) + (data.donationBalance ?? 0)
    animateNumber(total)
  } catch {
    // keep defaults
  }
}

async function fetchTransactions() {
  loading.value = true
  try {
    const data = await get<Transaction[]>('/api/points/transactions')
    transactions.value = data
  } catch {
    transactions.value = []
  } finally {
    loading.value = false
  }
}

function animateNumber(target: number) {
  const duration = 800
  const start = displayTotal.value
  const diff = target - start
  const startTime = Date.now()

  function step() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayTotal.value = Math.round(start + diff * eased)
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}

onShow(() => {
  if (isLoggedIn()) {
    fetchBalance()
    fetchTransactions()
  }
})
</script>

<template>
  <view class="points-page">
    <view class="points-header">
      <view class="total-card">
        <text class="total-label">我的积分</text>
        <text class="total-number">{{ displayTotal }}</text>
      </view>
      <view class="points-columns">
        <view class="column-item">
          <text class="column-value">{{ balance.activityBalance }}/{{ balance.activityTotal }}</text>
          <text class="column-label">活动积分</text>
        </view>
        <view class="column-divider" />
        <view class="column-item">
          <text class="column-value">{{ balance.donationBalance }}/{{ balance.donationTotal }}</text>
          <text class="column-label">捐助积分</text>
        </view>
      </view>
    </view>

    <view class="transaction-section">
      <text class="section-title">积分明细</text>

      <view class="transaction-list" v-if="transactions.length">
        <view class="transaction-item" v-for="item in transactions" :key="item.id">
          <view class="item-left">
            <view class="item-icon">
              <wd-icon :name="typeIcons[item.type] || 'star'" size="36rpx" color="#e54d42" />
            </view>
            <view class="item-info">
              <text class="item-desc">{{ item.description }}</text>
              <text class="item-time">{{ item.createdAt }}</text>
            </view>
          </view>
          <text class="item-amount" :class="{ positive: item.amount > 0, negative: item.amount < 0 }">
            {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
          </text>
        </view>
      </view>

      <wd-status-tip v-else-if="!loading" image="content" tip="暂无积分记录" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.points-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.points-header {
  background: linear-gradient(180deg, #e54d42 0%, #f56c6c 100%);
  padding: 40rpx 32rpx 60rpx;
  border-radius: 0 0 32rpx 32rpx;
}

.total-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.total-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12rpx;
}

.total-number {
  font-size: 72rpx;
  font-weight: 700;
  color: #fff;
}

.points-columns {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 28rpx 0;
}

.column-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.column-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.column-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.column-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

.transaction-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.transaction-list {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.item-left {
  display: flex;
  align-items: center;
}

.item-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(229, 77, 66, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-desc {
  font-size: 28rpx;
  color: #333;
}

.item-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}

.item-amount {
  font-size: 32rpx;
  font-weight: 600;

  &.positive {
    color: #07c160;
  }

  &.negative {
    color: #e54d42;
  }
}
</style>
