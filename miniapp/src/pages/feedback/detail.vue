<script setup lang="ts">
import { ref, onLoad } from 'vue'
import { get, post } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface FeedbackDetail {
  id: string
  type: string
  title: string
  content: string
  images: string[]
  status: 'pending' | 'processing' | 'resolved' | 'closed'
  priority: string
  response: string | null
  responseTime: string | null
  userRating: number | null
  userRatingNote: string | null
  createdAt: string
}

const feedbackId = ref('')
const detail = ref<FeedbackDetail | null>(null)
const loading = ref(false)
const rating = ref(0)
const ratingNote = ref('')
const showRatingDialog = ref(false)

async function fetchDetail(id: string) {
  loading.value = true
  try {
    const data = await get<FeedbackDetail>(`/api/feedbacks/${id}`)
    detail.value = data
  } catch {
    uni.showToast({ title: '获取详情失败', icon: 'none' })
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

function openRatingDialog() {
  rating.value = detail.value?.userRating || 0
  ratingNote.value = detail.value?.userRatingNote || ''
  showRatingDialog.value = true
}

async function submitRating() {
  if (rating.value < 1 || rating.value > 5) {
    uni.showToast({ title: '请选择评分', icon: 'none' })
    return
  }

  try {
    await post(`/api/feedbacks/${feedbackId.value}/rate`, {
      rating: rating.value,
      note: ratingNote.value,
    })
    showRatingDialog.value = false
    uni.showToast({ title: '评分成功', icon: 'success' })
    fetchDetail(feedbackId.value)
  } catch {
    uni.showToast({ title: '评分失败', icon: 'none' })
  }
}

onLoad((options) => {
  if (options.id) {
    feedbackId.value = options.id
    fetchDetail(options.id)
  }
})
</script>

<template>
  <view class="feedback-detail-page" v-if="detail">
    <view class="detail-section">
      <view class="detail-header">
        <wd-tag :color="getStatusColor(detail.status)" size="small">
          {{ getStatusText(detail.status) }}
        </wd-tag>
        <text class="detail-type">{{ getTypeLabel(detail.type) }}</text>
      </view>

      <text class="detail-title">{{ detail.title }}</text>
      <text class="detail-time">提交时间: {{ detail.createdAt }}</text>
    </view>

    <view class="detail-section">
      <text class="section-title">详细描述</text>
      <text class="detail-content">{{ detail.content }}</text>

      <view v-if="detail.images?.length" class="detail-images">
        <image
          v-for="(img, idx) in detail.images"
          :key="idx"
          :src="img"
          mode="aspectFill"
          class="detail-image"
          @click="uni.previewImage({ urls: detail.images, current: idx })"
        />
      </view>
    </view>

    <view v-if="detail.response" class="detail-section">
      <text class="section-title">管理员回复</text>
      <text class="detail-response">{{ detail.response }}</text>
      <text v-if="detail.responseTime" class="response-time">
        回复时间: {{ detail.responseTime }}
      </text>
    </view>

    <view v-if="detail.userRating" class="detail-section">
      <text class="section-title">您的评分</text>
      <view class="rating-display">
        <text v-for="i in 5" :key="i" class="star" :class="{ active: i <= detail.userRating }">⭐</text>
        <text v-if="detail.userRatingNote" class="rating-note">{{ detail.userRatingNote }}</text>
      </view>
    </view>

    <view v-if="detail.status === 'resolved' && !detail.userRating" class="rate-section">
      <wd-button type="primary" block @click="openRatingDialog">
        评价反馈处理
      </wd-button>
    </view>

    <wd-popup v-model="showRatingDialog" position="bottom">
      <view class="rating-dialog">
        <text class="dialog-title">请为本次反馈处理评分</text>

        <view class="rating-stars">
          <text
            v-for="i in 5"
            :key="i"
            class="star-btn"
            :class="{ active: i <= rating }"
            @click="rating = i"
          >⭐</text>
        </view>

        <wd-textarea
          v-model="ratingNote"
          placeholder="请输入评分备注（可选）"
          :maxlength="200"
        />

        <view class="dialog-actions">
          <wd-button @click="showRatingDialog = false">取消</wd-button>
          <wd-button type="primary" @click="submitRating">提交评分</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>

  <wd-loading v-else type="circle" />
</template>

<style lang="scss" scoped>
.feedback-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.detail-section {
  background: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.detail-type {
  font-size: 26rpx;
  color: #666;
}

.detail-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
  margin-bottom: 12rpx;
}

.detail-time {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.detail-content {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

.detail-images {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.detail-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
}

.detail-response {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  background: #f0f9ff;
  padding: 16rpx;
  border-radius: 8rpx;
}

.response-time {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.star {
  font-size: 32rpx;
  opacity: 0.3;

  &.active {
    opacity: 1;
  }
}

.rating-note {
  font-size: 26rpx;
  color: #666;
  margin-left: 12rpx;
}

.rate-section {
  padding: 32rpx 24rpx;
}

.rating-dialog {
  padding: 32rpx;
}

.dialog-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32rpx;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.star-btn {
  font-size: 48rpx;
  opacity: 0.3;
  transition: all 0.2s;

  &.active {
    opacity: 1;
    transform: scale(1.1);
  }
}

.dialog-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}
</style>
