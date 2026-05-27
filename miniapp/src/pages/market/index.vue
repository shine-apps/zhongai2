<script setup lang="ts">
import { ref, onShow } from 'vue'
import { get } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface MarketPost {
  id: number
  postType: 'job' | 'resume' | 'idle'
  title: string
  content: string
  images: string[]
  contactInfo: string
  status: string
  viewCount: number
  favoriteCount: number
  createdAt: string
}

const tabs = [
  { value: '', label: '全部' },
  { value: 'job', label: '招聘' },
  { value: 'resume', label: '求职' },
  { value: 'idle', label: '闲置' },
]

const activeTab = ref('')
const posts = ref<MarketPost[]>([])
const loading = ref(false)

async function fetchPosts() {
  loading.value = true
  try {
    const params = activeTab.value ? { postType: activeTab.value } : {}
    const data = await get<MarketPost[]>('/api/market/posts', params)
    posts.value = data
  } catch {
    posts.value = []
  } finally {
    loading.value = false
  }
}

function getPostTypeLabel(type: string) {
  const labels: Record<string, string> = {
    job: '招聘',
    resume: '求职',
    idle: '闲置',
  }
  return labels[type] || type
}

function getPostTypeColor(type: string) {
  const colors: Record<string, string> = {
    job: '#e54d42',
    resume: '#07c160',
    idle: '#1989fa',
  }
  return colors[type] || '#666'
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/market/detail?id=${id}` })
}

function goCreate() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.navigateTo({ url: '/pages/market/create' })
}

function switchTab(tab: string) {
  activeTab.value = tab
  fetchPosts()
}

onShow(() => {
  fetchPosts()
})
</script>

<template>
  <view class="market-page">
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

    <view class="market-content">
      <view v-if="posts.length" class="post-list">
        <view
          v-for="post in posts"
          :key="post.id"
          class="post-item"
          @click="goDetail(post.id)"
        >
          <view class="post-header">
            <wd-tag :color="getPostTypeColor(post.postType)" size="small" plain>
              {{ getPostTypeLabel(post.postType) }}
            </wd-tag>
            <text class="post-time">{{ post.createdAt }}</text>
          </view>
          
          <text class="post-title">{{ post.title }}</text>
          
          <text class="post-content">{{ post.content }}</text>
          
          <view v-if="post.images?.length" class="post-images">
            <image
              v-for="(img, idx) in post.images.slice(0, 3)"
              :key="idx"
              class="post-image"
              :src="img"
              mode="aspectFill"
            />
          </view>
          
          <view class="post-footer">
            <view class="post-stats">
              <view class="stat-item">
                <wd-icon name="eye" size="24rpx" color="#999" />
                <text>{{ post.viewCount }}</text>
              </view>
              <view class="stat-item">
                <wd-icon name="star" size="24rpx" color="#999" />
                <text>{{ post.favoriteCount }}</text>
              </view>
            </view>
            <text class="contact-info">{{ post.contactInfo }}</text>
          </view>
        </view>
      </view>
      
      <wd-status-tip v-else-if="!loading" image="content" tip="暂无帖子" />
      
      <wd-loading v-else type="circle" />
    </view>

    <view class="fab-button" @click="goCreate">
      <wd-icon name="plus" size="40rpx" color="#fff" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.market-page {
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
  padding: 20rpx 32rpx;
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

.market-content {
  padding: 16rpx;
  padding-bottom: 120rpx;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.post-item {
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.post-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  line-height: 1.5;
}

.post-content {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-images {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.post-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f5f5f5;
}

.post-stats {
  display: flex;
  gap: 24rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.contact-info {
  font-size: 24rpx;
  color: #e54d42;
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
