<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { get } from '@/utils/request'

interface Donation {
  id: number
  type: string
  amount: number
  materialDesc: string
  estimatedValue: number
  status: string
  createdAt: string
  evidenceDesc: string
}

const tabs = [
  { name: '全部', value: '' },
  { name: '待审核', value: 'pending' },
  { name: '已通过', value: 'approved' },
  { name: '已拒绝', value: 'rejected' },
]

const currentTab = ref(0)
const donations = ref<Donation[]>([])
const loading = ref(false)

const currentStatus = computed(() => tabs[currentTab.value].value)

const statusMap: Record<string, { label: string; type: string }> = {
  pending: { label: '待审核', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' },
}

async function fetchDonations() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {}
    if (currentStatus.value) {
      params.status = currentStatus.value
    }
    const data = await get<Donation[]>('/api/donations/me', params)
    donations.value = data
  } catch {
    donations.value = []
  } finally {
    loading.value = false
  }
}

function onTabChange({ index }: { index: number }) {
  currentTab.value = index
  fetchDonations()
}

function formatAmount(item: Donation): string {
  if (item.type === 'money') {
    return `¥${item.amount.toFixed(2)}`
  }
  return item.materialDesc || '物资捐助'
}

onShow(() => {
  fetchDonations()
})

onPullDownRefresh(async () => {
  await fetchDonations()
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="donation-list-page">
    <wd-tabs v-model="currentTab" @change="onTabChange">
      <wd-tab v-for="tab in tabs" :key="tab.value" :name="tab.name" :title="tab.name" />
    </wd-tabs>

    <view class="list-content">
      <view class="donation-card" v-for="item in donations" :key="item.id">
        <view class="card-left">
          <view class="type-icon">
            <wd-icon :name="item.type === 'money' ? 'wallet' : 'goods'" size="40rpx" color="#e54d42" />
          </view>
        </view>
        <view class="card-center">
          <text class="card-amount">{{ formatAmount(item) }}</text>
          <text class="card-time">{{ item.createdAt }}</text>
        </view>
        <view class="card-right">
          <wd-tag :type="(statusMap[item.status]?.type || 'info') as any" size="small" plain>
            {{ statusMap[item.status]?.label || item.status }}
          </wd-tag>
        </view>
      </view>

      <wd-status-tip v-if="!loading && !donations.length" image="content" tip="暂无捐助记录" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.donation-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.list-content {
  padding: 16rpx 24rpx;
}

.donation-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
}

.card-left {
  margin-right: 24rpx;
}

.type-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(229, 77, 66, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-center {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-amount {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.card-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.card-right {
  margin-left: 16rpx;
}
</style>
