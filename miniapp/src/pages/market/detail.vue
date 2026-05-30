<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post, del } from '@/utils/request'

interface PostDetail {
  id: string
  userId: string
  type: string
  title: string
  content: string
  images: string[]
  contactInfo: string | null
  location: string | null
  price: string | null
  status: string
  viewCount: number
  favoriteCount: number
  isFavorited: boolean
  authorNickname: string | null
  authorAvatarUrl: string | null
  createdAt: string
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

const postId = ref('')
const postDetail = ref<PostDetail | null>(null)
const loading = ref(true)
const isFavorited = ref(false)

async function fetchDetail() {
  loading.value = true
  try {
    const data = await get<PostDetail>(`/api/market/posts/${postId.value}`)
    postDetail.value = data
    isFavorited.value = data.isFavorited
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  if (!postDetail.value) return
  try {
    if (isFavorited.value) {
      await del(`/api/market/posts/${postId.value}/favorite`)
      isFavorited.value = false
      postDetail.value.favoriteCount = Math.max(0, postDetail.value.favoriteCount - 1)
    } else {
      await post(`/api/market/posts/${postId.value}/favorite`)
      isFavorited.value = true
      postDetail.value.favoriteCount++
    }
  } catch {
    // error handled by request util
  }
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

function previewImage(index: number) {
  if (!postDetail.value) return
  uni.previewImage({
    urls: postDetail.value.images,
    current: index,
  })
}

function makePhoneCall() {
  if (!postDetail.value?.contactInfo) return
  const phone = postDetail.value.contactInfo.replace(/[^\d]/g, '')
  if (phone) {
    uni.makePhoneCall({ phoneNumber: phone })
  } else {
    uni.setClipboardData({
      data: postDetail.value.contactInfo,
      success: () => {
        uni.showToast({ title: '联系方式已复制', icon: 'success' })
      },
    })
  }
}

onLoad((options) => {
  postId.value = options?.id || ''
  if (postId.value) fetchDetail()
})
</script>

<template>
  <view class="detail-page">
    <wd-skeleton v-if="loading" :rows="8" />

    <template v-else-if="postDetail">
      <!-- Header -->
      <view class="detail-header">
        <wd-tag :type="(typeColorMap[postDetail.type] as any) || 'info'" plain>
          {{ typeTextMap[postDetail.type] || postDetail.type }}
        </wd-tag>
        <text class="detail-time">{{ formatTime(postDetail.createdAt) }}</text>
      </view>

      <!-- Title & Content -->
      <view class="detail-body">
        <text class="detail-title">{{ postDetail.title }}</text>
        <text class="detail-content">{{ postDetail.content }}</text>
      </view>

      <!-- Images -->
      <view v-if="postDetail.images && postDetail.images.length" class="detail-images">
        <image
          v-for="(img, idx) in postDetail.images"
          :key="idx"
          :src="img"
          mode="widthFix"
          class="detail-img"
          @click="previewImage(idx)"
        />
      </view>

      <!-- Info section -->
      <view class="detail-info">
        <view v-if="postDetail.location" class="info-row">
          <wd-icon name="location" size="32rpx" color="#999" />
          <text class="info-text">{{ postDetail.location }}</text>
        </view>
        <view v-if="postDetail.price !== null" class="info-row">
          <wd-icon name="red-packet" size="32rpx" color="#999" />
          <text class="info-text price">{{ postDetail.price === '0' || postDetail.price === '0.00' ? '免费赠送' : `¥${postDetail.price}` }}</text>
        </view>
        <view v-if="postDetail.contactInfo" class="info-row" @click="makePhoneCall">
          <wd-icon name="phone" size="32rpx" color="#999" />
          <text class="info-text contact">{{ postDetail.contactInfo }}</text>
          <text class="copy-hint">点击拨打/复制</text>
        </view>
      </view>

      <!-- Author & Stats -->
      <view class="detail-footer">
        <view class="author-info">
          <wd-avatar :src="postDetail.authorAvatarUrl || ''" size="64rpx" />
          <text class="author-name">{{ postDetail.authorNickname || '匿名用户' }}</text>
        </view>
        <view class="stats-info">
          <text class="stat"><wd-icon name="view" size="28rpx" /> {{ postDetail.viewCount }}</text>
          <text class="stat"><wd-icon name="star" size="28rpx" /> {{ postDetail.favoriteCount }}</text>
        </view>
      </view>
    </template>

    <wd-status-tip v-else image="error" tip="帖子不存在" />

    <!-- Bottom action bar -->
    <view v-if="postDetail" class="bottom-bar">
      <view class="action-btn" @click="toggleFavorite">
        <wd-icon :name="isFavorited ? 'star-filled' : 'star'" size="40rpx" :color="isFavorited ? '#e54d42' : '#999'" />
        <text :class="['action-text', { active: isFavorited }]">{{ isFavorited ? '已收藏' : '收藏' }}</text>
      </view>
      <view class="action-btn primary" @click="makePhoneCall">
        <wd-icon name="phone" size="40rpx" color="#fff" />
        <text class="action-text">联系TA</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #fff;
}

.detail-time {
  font-size: 24rpx;
  color: #999;
}

.detail-body {
  padding: 24rpx 32rpx;
  background: #fff;
  margin-top: 2rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.detail-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-images {
  padding: 24rpx 32rpx;
  background: #fff;
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.detail-img {
  width: 100%;
  border-radius: 8rpx;
}

.detail-info {
  background: #fff;
  margin-top: 16rpx;
  padding: 24rpx 32rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;
}

.info-text {
  font-size: 28rpx;
  color: #333;
}

.info-text.price {
  color: #e54d42;
  font-weight: 600;
  font-size: 32rpx;
}

.info-text.contact {
  color: #333;
  font-weight: 500;
}

.copy-hint {
  font-size: 22rpx;
  color: #999;
  margin-left: auto;
}

.detail-footer {
  background: #fff;
  margin-top: 16rpx;
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.author-name {
  font-size: 28rpx;
  color: #333;
}

.stats-info {
  display: flex;
  gap: 24rpx;
}

.stat {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  gap: 24rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  border: 2rpx solid #ddd;
}

.action-btn.primary {
  flex: 1;
  background: #e54d42;
  border-color: #e54d42;
}

.action-text {
  font-size: 28rpx;
  color: #666;
}

.action-text.active {
  color: #e54d42;
}

.action-btn.primary .action-text {
  color: #fff;
}
</style>
