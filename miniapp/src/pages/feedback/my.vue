<script setup lang="ts">
import { ref, onShow } from 'vue'
import { get } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface FeedbackItem {
  id: string
  type: string
  title: string
  status: 'pending' | 'processing' | 'resolved' | 'closed'
  createdAt: string
  response: string | null
}

const tabs = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
]

const activeTab = ref('')
const feedbacks = ref<FeedbackItem[]>([])
const loading = ref(false)

async function fetchFeedbacks() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (activeTab.value) params.status = activeTab.value
    const data = await get<{ list: FeedbackItem[] }>('/api/feedbacks/my', params)
    feedbacks.value = data.list || []
  } catch {
    feedbacks.value = []
  } finally {
    loading.value = false
  }
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    suggestion: '功能建议',
    bug: 'Bug反馈',
    complaint: '投诉举报',
    question: '使用咨询',
    other: '其他反馈',
  }
  return labels[type] || type
}

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    suggestion: '#1989fa',
    bug: '#e54d42',
    complaint: '#ff9800',
    question: '#07c160',
    other: '#999',
  }
  return colors[type] || '#999'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭',
  }
  return texts[status] || status
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: '#ff9800',
    processing: '#1989fa',
    resolved: '#07c160',
    closed: '#999',
  }
  return colors[status] || '#999'
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/feedback/detail?id=${id}` })
}

function switchTab(tab: string) {
  activeTab.value = tab
  fetchFeedbacks()
}

onShow(() => {
  fetchFeedbacks()
})
</script>

<template>
  <view class="feedback-my-page">
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

    <view class="feedback-content">
      <view v-if="feedbacks.length" class="feedback-list">
        <view
          v-for="item in feedbacks"
          :key="item.id"
          class="feedback-card"
          @click="goDetail(item.id)"
        >
          <view class="card-header">
            <wd-tag :color="getTypeColor(item.type)" size="small" plain>
              {{ getTypeLabel(item.type) }}
            </wd-tag>
            <text :style="{ color: getStatusColor(item.status) }" class="status-text">
              {{ getStatusText(item.status) }}
            </text>
          </view>

          <text class="card-title">{{ item.title }}</text>

          <view class="card-footer">
            <text class="card-time">{{ item.createdAt }}</text>
            <wd-icon name="arrow-right" size="28rpx" color="#ccc" />
          </view>
        </view>
      </view>

      <wd-status-tip v-else-if="!loading" image="content" tip="暂无反馈记录" />

      <wd-loading v-else type="circle" />
    </view>

    <view class="fab-button" @click="uni.navigateTo({ url: '/pages/feedback/create' })">
      <wd-icon name="plus" size="40rpx" color="#fff" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.feedback-my-page {
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

.feedback-content {
  padding: 16rpx;
  padding-bottom: 120rpx;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.feedback-card {
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.status-text {
  font-size: 24rpx;
}

.card-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 12rpx;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: 24rpx;
  color: #999;
}

.fab-button {
  position: fixed;
  bottom: 100rpx;
  right: 32rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #e54d42 0%, #f56c6c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(229, 77, 66, 0.4);
  z-index: 100;
}
</style>
