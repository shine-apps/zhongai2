<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { get } from '@/utils/request'

interface FavPost {
  id: string
  type: string
  title: string
  content: string
  images: string[]
  viewCount: number
  favoriteCount: number
  status: string
  authorNickname: string | null
  authorAvatarUrl: string | null
  createdAt: string
  favoritedAt: string
}

const typeTextMap: Record<string, string> = {
  job: '招聘',
  resume: '求职',
  idle: '闲置',
}

const typeColorMap: Record<string, string> = {
  job: 'primary',
  resume: 'success',
  idle: 'warning',
}

const posts = ref<FavPost[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 20
const total = ref(0)
const hasMore = computed(() => posts.value.length < total.value)

async function fetchFavorites(reset = false) {
  if (reset) {
    page.value = 1
    posts.value = []
  }
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: page.value, pageSize }
    const data = await get<{ list: FavPost[]; pagination: { total: number } }>('/api/market/favorites', params)
    if (reset) {
      posts.value = data.list
    } else {
      posts.value = [...posts.value, ...data.list]
    }
    total.value = data.pagination.total
  } catch {
    if (reset) posts.value = []
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchFavorites()
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/market/detail?id=${id}` })
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return '今天'
  if (days < 30) return `${days}天前`
  return d.toLocaleDateString('zh-CN')
}

onShow(() => {
  fetchFavorites(true)
})

onPullDownRefresh(async () => {
  await fetchFavorites(true)
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="favorites-page">
    <scroll-view
      class="post-list"
      scroll-y
      @scrolltolower="loadMore"
      style="height: 100vh"
    >
      <view class="post-card" v-for="post in posts" :key="post.id" @click="goDetail(post.id)">
        <view class="post-header">
          <wd-tag :type="(typeColorMap[post.type] as any) || 'info'" size="small" plain>
            {{ typeTextMap[post.type] || post.type }}
          </wd-tag>
          <text class="post-time">{{ formatTime(post.createdAt) }}</text>
        </view>
        <view class="post-title">{{ post.title }}</view>
        <view class="post-content-preview">{{ post.content }}</view>
        <view class="post-footer">
          <view class="post-author">
            <wd-avatar :src="post.authorAvatarUrl || ''" size="48rpx" />
            <text class="author-name">{{ post.authorNickname || '匿名用户' }}</text>
          </view>
          <view class="post-stats">
            <text class="stat-item">
              <wd-icon name="view" size="28rpx" /> {{ post.viewCount }}
            </text>
            <text class="stat-item">
              <wd-icon name="star-filled" size="28rpx" color="#e54d42" /> {{ post.favoriteCount }}
            </text>
          </view>
        </view>
      </view>

      <wd-status-tip v-if="!loading && !posts.length" image="content" tip="暂无收藏" />
      <wd-loadmore v-if="posts.length" :state="hasMore ? 'loading' : 'finished'" />
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.favorites-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.post-list {
  padding: 16rpx 24rpx;
}

.post-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.post-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-content-preview {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 16rpx;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.author-name {
  font-size: 24rpx;
  color: #999;
}

.post-stats {
  display: flex;
  gap: 24rpx;
}

.stat-item {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4rpx;
}
</style>
