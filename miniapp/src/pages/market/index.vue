<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { get } from '@/utils/request'

interface PostUser {
  id: string
  nickname: string
  avatarUrl: string | null
}

interface MarketPost {
  id: string
  type: string
  title: string
  content: string
  images: string[]
  contactInfo: string | null
  location: string | null
  price: string | null
  viewCount: number
  favoriteCount: number
  isFavorited: boolean
  authorNickname: string | null
  authorAvatarUrl: string | null
  createdAt: string
}

const tabs = [
  { name: '全部', value: '' },
  { name: '招聘', value: 'job' },
  { name: '求职', value: 'resume' },
  { name: '闲置', value: 'idle' },
]

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

const currentTab = ref(0)
const posts = ref<MarketPost[]>([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)

const currentType = computed(() => tabs[currentTab.value].value)
const hasMore = computed(() => posts.value.length < total.value)

async function fetchPosts(reset = false) {
  if (reset) {
    page.value = 1
    posts.value = []
  }
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize,
    }
    if (currentType.value) params.type = currentType.value
    if (keyword.value) params.keyword = keyword.value

    const data = await get<{ list: MarketPost[]; pagination: { total: number } }>('/api/market/posts', params)
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

function onTabChange({ index }: { index: number }) {
  currentTab.value = index
  fetchPosts(true)
}

function onSearch() {
  fetchPosts(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchPosts()
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/market/detail?id=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/market/create' })
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return d.toLocaleDateString('zh-CN')
}

onShow(() => {
  fetchPosts(true)
})

onPullDownRefresh(async () => {
  await fetchPosts(true)
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="market-page">
    <!-- Search bar -->
    <view class="search-bar">
      <wd-search v-model="keyword" placeholder="搜索帖子" @search="onSearch" />
    </view>

    <!-- Type tabs -->
    <wd-tabs v-model="currentTab" @change="onTabChange">
      <wd-tab v-for="tab in tabs" :key="tab.value" :name="tab.name" :title="tab.name" />
    </wd-tabs>

    <!-- Post list -->
    <scroll-view
      class="post-list"
      scroll-y
      @scrolltolower="loadMore"
      style="height: calc(100vh - 200rpx)"
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
        <view v-if="post.images && post.images.length" class="post-images">
          <image
            v-for="(img, idx) in post.images.slice(0, 3)"
            :key="idx"
            :src="img"
            mode="aspectFill"
            class="preview-img"
          />
          <view v-if="post.images.length > 3" class="img-more">+{{ post.images.length - 3 }}</view>
        </view>
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
              <wd-icon name="star" size="28rpx" /> {{ post.favoriteCount }}
            </text>
          </view>
        </view>
      </view>

      <wd-status-tip v-if="!loading && !posts.length" image="content" tip="暂无帖子" />
      <wd-loadmore v-if="posts.length" :state="hasMore ? 'loading' : 'finished'" />
    </scroll-view>

    <!-- FAB create button -->
    <view class="fab-btn" @click="goCreate">
      <wd-icon name="add" size="48rpx" color="#fff" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.market-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  padding: 16rpx 24rpx 0;
  background: #fff;
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

.post-images {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.preview-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 8rpx;
}

.img-more {
  width: 200rpx;
  height: 200rpx;
  border-radius: 8rpx;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
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

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #e54d42;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(229, 77, 66, 0.4);
  z-index: 100;
}
</style>
