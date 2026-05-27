<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface Activity {
  id: number
  title: string
  coverImage: string
  category: string
  startTime: string
  endTime: string
  location: string
  organizer: string
  description: string
  currentParticipants: number
  maxParticipants: number
  rewardPoints: number
  status: string
  isRegistered: boolean
}

const activityId = ref(0)
const activity = ref<Activity | null>(null)
const loading = ref(true)
const remark = ref('')
const submitting = ref(false)

async function fetchDetail() {
  loading.value = true
  try {
    const data = await get<Activity>(`/api/activities/${activityId.value}`)
    activity.value = data
  } catch {
    uni.showToast({ title: '获取活动详情失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  if (activity.value?.isRegistered) {
    uni.showToast({ title: '您已报名该活动', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await post(`/api/activities/${activityId.value}/register`, {
      remark: remark.value,
    })
    uni.showToast({ title: '报名成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    uni.showToast({ title: '报名失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onLoad((query) => {
  if (query?.activityId) {
    activityId.value = Number(query.activityId)
    fetchDetail()
  }
})
</script>

<template>
  <view class="register-page" v-if="activity">
    <view class="info-card">
      <text class="card-title">活动信息</text>
      <view class="info-row">
        <wd-icon name="calendar" size="28rpx" color="#e54d42" />
        <text class="info-label">活动名称</text>
        <text class="info-value">{{ activity.title }}</text>
      </view>
      <view class="info-row">
        <wd-icon name="clock" size="28rpx" color="#e54d42" />
        <text class="info-label">活动时间</text>
        <text class="info-value">{{ activity.startTime }} ~ {{ activity.endTime }}</text>
      </view>
      <view class="info-row">
        <wd-icon name="location" size="28rpx" color="#e54d42" />
        <text class="info-label">活动地点</text>
        <text class="info-value">{{ activity.location }}</text>
      </view>
      <view class="info-row">
        <wd-icon name="star" size="28rpx" color="#e54d42" />
        <text class="info-label">奖励积分</text>
        <text class="info-value points">{{ activity.rewardPoints }} 分</text>
      </view>
    </view>

    <view class="notice-card">
      <text class="card-title">报名须知</text>
      <view class="notice-item">
        <text class="notice-index">1.</text>
        <text class="notice-text">报名成功后请按时参加活动，迟到或缺席将影响您的信用积分。</text>
      </view>
      <view class="notice-item">
        <text class="notice-index">2.</text>
        <text class="notice-text">活动开始前可在活动详情页取消报名，活动开始后不可取消。</text>
      </view>
      <view class="notice-item">
        <text class="notice-index">3.</text>
        <text class="notice-text">参加活动需现场签到，签到成功后方可获得活动积分奖励。</text>
      </view>
      <view class="notice-item">
        <text class="notice-index">4.</text>
        <text class="notice-text">请遵守活动组织方的相关规定，注意人身及财产安全。</text>
      </view>
    </view>

    <view class="remark-card">
      <text class="card-title">备注信息</text>
      <wd-textarea
        v-model="remark"
        placeholder="请输入备注信息（选填）"
        :maxlength="200"
        show-word-limit
      />
    </view>

    <view class="submit-area">
      <wd-button
        type="primary"
        block
        :loading="submitting"
        :disabled="activity.isRegistered"
        custom-style="height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        @click="handleSubmit"
      >
        {{ activity.isRegistered ? '已报名' : '确认报名' }}
      </wd-button>
    </view>
  </view>

  <view class="loading-page" v-else>
    <wd-loading />
  </view>
</template>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16rpx 24rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.info-card,
.notice-card,
.remark-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-top: 16rpx;

  &:first-of-type {
    margin-top: 0;
  }
}

.info-label {
  font-size: 26rpx;
  color: #999;
  margin-left: 8rpx;
  width: 120rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;

  &.points {
    color: #e54d42;
    font-weight: 500;
  }
}

.notice-item {
  display: flex;
  align-items: flex-start;
  margin-top: 16rpx;

  &:first-of-type {
    margin-top: 0;
  }
}

.notice-index {
  font-size: 26rpx;
  color: #e54d42;
  font-weight: 500;
  margin-right: 8rpx;
  flex-shrink: 0;
}

.notice-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.submit-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.loading-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
