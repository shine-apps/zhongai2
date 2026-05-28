<script setup lang="ts">
import { ref, onShow } from 'vue'
import { get } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface HonorRecord {
  id: string
  itemName: string
  itemType: 'badge' | 'certificate' | 'gift' | 'title'
  status: 'pending' | 'issued' | 'received'
  certificateNo: string | null
  certificateUrl: string | null
  issueTime: string | null
  receiveLocation: string | null
  createdAt: string
}

const tabs = [
  { value: '', label: '全部' },
  { value: 'badge', label: '徽章' },
  { value: 'certificate', label: '证书' },
  { value: 'gift', label: '纪念品' },
]

const activeTab = ref('')
const records = ref<HonorRecord[]>([])
const loading = ref(false)

async function fetchRecords() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (activeTab.value) params.type = activeTab.value
    const data = await get<{ list: HonorRecord[] }>('/api/honor/my-records', params)
    records.value = data.list || []
  } catch {
    records.value = []
  } finally {
    loading.value = false
  }
}

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    badge: '🏅',
    certificate: '📜',
    gift: '🎁',
    title: '👑',
  }
  return icons[type] || '🏆'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待发放',
    issued: '已发放',
    received: '已领取',
  }
  return texts[status] || status
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: '#ff9800',
    issued: '#07c160',
    received: '#1989fa',
  }
  return colors[status] || '#999'
}

function viewCertificate(record: HonorRecord) {
  if (record.certificateUrl) {
    uni.previewImage({
      urls: [record.certificateUrl],
    })
  }
}

function switchTab(tab: string) {
  activeTab.value = tab
  fetchRecords()
}

onShow(() => {
  fetchRecords()
})
</script>

<template>
  <view class="my-records-page">
    <view class="tabs-header">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', activeTab === tab.value ? 'active' : '']"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>

    <view class="records-content">
      <view v-if="records.length" class="records-list">
        <view
          v-for="record in records"
          :key="record.id"
          class="record-card"
        >
          <view class="record-header">
            <text class="record-emoji">{{ getTypeIcon(record.itemType) }}</text>
            <view class="record-info">
              <text class="record-name">{{ record.itemName }}</text>
              <text :style="{ color: getStatusColor(record.status) }" class="record-status">
                {{ getStatusText(record.status) }}
              </text>
            </view>
          </view>

          <view v-if="record.certificateNo" class="record-detail">
            <text class="detail-label">证书编号</text>
            <text class="detail-value">{{ record.certificateNo }}</text>
          </view>

          <view v-if="record.issueTime" class="record-detail">
            <text class="detail-label">发放时间</text>
            <text class="detail-value">{{ record.issueTime }}</text>
          </view>

          <view v-if="record.receiveLocation" class="record-detail">
            <text class="detail-label">领取地点</text>
            <text class="detail-value">{{ record.receiveLocation }}</text>
          </view>

          <view class="record-actions">
            <wd-button
              v-if="record.certificateUrl"
              size="small"
              @click="viewCertificate(record)"
            >
              查看证书
            </wd-button>
          </view>
        </view>
      </view>

      <wd-status-tip v-else-if="!loading" image="content" tip="暂无荣誉记录" />

      <wd-loading v-else type="circle" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.my-records-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.tabs-header {
  display: flex;
  background: #fff;
  padding: 8rpx 16rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  transition: all 0.3s;

  &.active {
    color: #e54d42;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background: #e54d42;
      border-radius: 2rpx;
    }
  }
}

.records-content {
  padding: 16rpx;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-card {
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.record-emoji {
  font-size: 48rpx;
}

.record-info {
  flex: 1;
}

.record-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.record-status {
  display: block;
  font-size: 24rpx;
  margin-top: 4rpx;
}

.record-detail {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-top: 1rpx solid #f5f5f5;
}

.detail-label {
  font-size: 26rpx;
  color: #999;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
}
</style>
