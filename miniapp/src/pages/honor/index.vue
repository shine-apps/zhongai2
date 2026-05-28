<script setup lang="ts">
import { ref, onShow } from 'vue'
import { get, post } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface HonorItem {
  id: string
  name: string
  type: 'badge' | 'certificate' | 'gift' | 'title'
  description: string
  imageUrl: string
  unlockType: string
  unlockLevel: number
  unlockValue: number
  isUnlocked: boolean
  isClaimed: boolean
  canClaim: boolean
  userProgress: number
  progressPercent: number
}

const tabs = [
  { value: '', label: '全部' },
  { value: 'badge', label: '徽章' },
  { value: 'certificate', label: '证书' },
  { value: 'gift', label: '纪念品' },
  { value: 'title', label: '头衔' },
]

const activeTab = ref('')
const items = ref<HonorItem[]>([])
const loading = ref(false)

async function fetchItems() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (activeTab.value) params.type = activeTab.value
    const data = await get<{ list: HonorItem[] }>('/api/honor/items', params)
    items.value = data.list || []
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

async function claimItem(item: HonorItem) {
  if (!item.canClaim || item.isClaimed) return

  uni.showModal({
    title: '确认领取',
    content: `确定要领取「${item.name}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const body: Record<string, string> = {}
          if (item.type === 'gift') {
            body.receiveLocation = '待预约'
          }
          await post(`/api/honor/items/${item.id}/claim`, body)
          uni.showToast({ title: '领取成功', icon: 'success' })
          fetchItems()
        } catch {
          uni.showToast({ title: '领取失败', icon: 'none' })
        }
      }
    },
  })
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

function getStatusText(item: HonorItem) {
  if (item.isClaimed) return '已领取'
  if (item.canClaim) return '可领取'
  return '未解锁'
}

function getStatusClass(item: HonorItem) {
  if (item.isClaimed) return 'claimed'
  if (item.canClaim) return 'unlocked'
  return 'locked'
}

function switchTab(tab: string) {
  activeTab.value = tab
  fetchItems()
}

onShow(() => {
  fetchItems()
})
</script>

<template>
  <view class="honor-page">
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

    <view class="honor-content">
      <view v-if="items.length" class="honor-list">
        <view
          v-for="item in items"
          :key="item.id"
          :class="['honor-card', getStatusClass(item)]"
        >
          <view class="card-image">
            <image
              v-if="item.imageUrl"
              :src="item.imageUrl"
              mode="aspectFit"
              class="item-image"
            />
            <text v-else class="item-emoji">{{ getTypeIcon(item.type) }}</text>
            <view v-if="item.isUnlocked" class="unlock-badge">已解锁</view>
          </view>

          <view class="card-info">
            <text class="item-name">{{ item.name }}</text>
            <text v-if="item.description" class="item-desc">{{ item.description }}</text>

            <view class="progress-section">
              <wd-progress
                :percent="item.progressPercent"
                :stroke-width="6"
                :color="item.isUnlocked ? '#07c160' : '#e54d42'"
              />
              <text class="progress-text">{{ item.userProgress }}/{{ item.unlockValue }}</text>
            </view>
          </view>

          <view class="card-action">
            <wd-button
              v-if="item.isClaimed"
              size="small"
              disabled
            >
              已领取
            </wd-button>
            <wd-button
              v-else-if="item.canClaim"
              size="small"
              type="primary"
              @click="claimItem(item)"
            >
              领取
            </wd-button>
            <wd-button
              v-else
              size="small"
              disabled
            >
              未解锁
            </wd-button>
          </view>
        </view>
      </view>

      <wd-status-tip v-else-if="!loading" image="content" tip="暂无荣誉物品" />

      <wd-loading v-else type="circle" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.honor-page {
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
  overflow-x: auto;
}

.tab-item {
  flex-shrink: 0;
  padding: 20rpx 28rpx;
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

.honor-content {
  padding: 16rpx;
}

.honor-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.honor-card {
  display: flex;
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  gap: 20rpx;

  &.claimed {
    opacity: 0.7;
  }

  &.unlocked {
    border: 2rpx solid #07c160;
  }
}

.card-image {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
}

.item-emoji {
  font-size: 64rpx;
}

.unlock-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #07c160;
  color: #fff;
  font-size: 18rpx;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.item-desc {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.progress-text {
  font-size: 22rpx;
  color: #999;
  white-space: nowrap;
}

.card-action {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
