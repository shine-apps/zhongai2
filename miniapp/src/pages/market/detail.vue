<script setup lang="ts">
import { ref, onLoad, onShow } from 'vue'
import { get, post, del } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface MarketPost {
  id: number
  userId: number
  postType: 'job' | 'resume' | 'idle'
  title: string
  content: string
  images: string[]
  contactInfo: string
  status: string
  viewCount: number
  favoriteCount: number
  isFavorited: boolean
  createdAt: string
}

const postId = ref<number>()
const post = ref<MarketPost | null>(null)
const loading = ref(false)

async function fetchPost(id: number) {
  loading.value = true
  try {
    const data = await get<MarketPost>(`/api/market/posts/${id}`)
    post.value = data
  } catch (err) {
    uni.showToast({ title: '获取帖子失败', icon: 'none' })
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

async function toggleFavorite() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  
  if (!post.value) return
  
  try {
    if (post.value.isFavorited) {
      await del(`/api/market/posts/${post.value.id}/favorite`)
      post.value.isFavorited = false
      post.value.favoriteCount = Math.max(0, post.value.favoriteCount - 1)
    } else {
      await post(`/api/market/posts/${post.value.id}/favorite`)
      post.value.isFavorited = true
      post.value.favoriteCount += 1
    }
    uni.showToast({
      title: post.value.isFavorited ? '已收藏' : '已取消收藏',
      icon: 'success',
    })
  } catch {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

function copyContact() {
  if (!post.value) return
  uni.setClipboardData({
    data: post.value.contactInfo,
    success: () => {
      uni.showToast({ title: '已复制联系方式', icon: 'success' })
    },
  })
}

onLoad((options) => {
  postId.value = Number(options.id)
  if (postId.value) {
    fetchPost(postId.value)
  }
})

onShow(() => {
  if (postId.value) {
    fetchPost(postId.value)
  }
})
</script>

<template>
  <view class="post-detail-page" v-if="post">
    <view class="post-detail-content">
      <view class="post-header">
        <wd-tag :color="getPostTypeColor(post.postType)" size="small" plain>
          {{ getPostTypeLabel(post.postType) }}
        </wd-tag>
        <text class="post-time">{{ post.createdAt }}</text>
      </view>
      
      <text class="post-title">{{ post.title }}</text>
      
      <view v-if="post.images?.length" class="post-images">
        <image
          v-for="(img, idx) in post.images"
          :key="idx"
          class="post-image"
          :src="img"
          mode="widthFix"
          @click="uni.previewImage({ urls: post.images, current: idx })"
        />
      </view>
      
      <text class="post-content">{{ post.content }}</text>
      
      <view class="post-stats">
        <view class="stat-item">
          <wd-icon name="eye" size="28rpx" color="#999" />
          <text>{{ post.viewCount }} 浏览</text>
        </view>
        <view class="stat-item">
          <wd-icon name="star" size="28rpx" color="#999" />
          <text>{{ post.favoriteCount }} 收藏</text>
        </view>
      </view>
    </view>

    <view class="post-footer-fixed">
      <view class="favorite-btn" @click="toggleFavorite">
        <wd-icon
          :name="post.isFavorited ? 'star' : 'star-outline'"
          size="36rpx"
          :color="post.isFavorited ? '#e54d42' : '#666'"
        />
        <text :style="{ color: post.isFavorited ? '#e54d42' : '#666' }">收藏</text>
      </view>
      
      <view class="contact-btn" @click="copyContact">
        <wd-icon name="phone" size="32rpx" color="#fff" />
        <text>联系对方</text>
      </view>
    </view>
  </view>
  
  <wd-loading v-else type="circle" />
</template>

<style lang="scss" scoped>
.post-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.post-detail-content {
  background: #fff;
  padding: 32rpx;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.post-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
  margin-bottom: 24rpx;
}

.post-images {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.post-image {
  width: 100%;
  border-radius: 12rpx;
}

.post-content {
  display: block;
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  margin-bottom: 32rpx;
}

.post-stats {
  display: flex;
  gap: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f5f5f5;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #999;
}

.post-footer-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 16rpx 24rpx;
  display: flex;
  gap: 16rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.favorite-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  gap: 4rpx;
  
  text {
    font-size: 22rpx;
  }
}

.contact-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: linear-gradient(135deg, #e54d42 0%, #f56c6c 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 12rpx;
  padding: 24rpx 0;
}
</style>
