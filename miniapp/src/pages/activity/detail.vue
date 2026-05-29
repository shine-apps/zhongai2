<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface Activity {
  id: string
  title: string
  coverImage: string
  category: string
  startTime: string
  endTime: string
  location: string
  organizerName: string
  description: string
  currentParticipants: number
  maxParticipants: number
  rewardPoints: number
  status: string
  isRegistered: boolean
}

const activityId = ref('')
const activity = ref<Activity | null>(null)
const loading = ref(true)
const registering = ref(false)

const statusMap: Record<string, { label: string; type: string }> = {
  draft: { label: '草稿', type: 'info' },
  published: { label: '报名中', type: 'success' },
  ongoing: { label: '进行中', type: 'warning' },
  completed: { label: '已完成', type: 'primary' },
  cancelled: { label: '已取消', type: 'danger' },
}

const buttonText = computed(() => {
  if (!activity.value) return ''
  if (activity.value.isRegistered) return '取消报名'
  if (activity.value.status === 'completed' || activity.value.status === 'cancelled') return '已结束'
  if (activity.value.currentParticipants >= activity.value.maxParticipants) return '已满'
  return '立即报名'
})

const buttonDisabled = computed(() => {
  if (!activity.value) return true
  const s = activity.value.status
  if (s === 'completed' || s === 'cancelled') return true
  if (!activity.value.isRegistered && activity.value.currentParticipants >= activity.value.maxParticipants) return true
  return false
})

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

async function handleRegister() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  if (activity.value?.isRegistered) {
    uni.showModal({
      title: '提示',
      content: '确定要取消报名吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await post(`/api/activities/${activityId.value}/cancel`)
            uni.showToast({ title: '已取消报名', icon: 'success' })
            fetchDetail()
          } catch {
            uni.showToast({ title: '取消报名失败', icon: 'none' })
          }
        }
      },
    })
    return
  }

  registering.value = true
  try {
    await post(`/api/activities/${activityId.value}/register`)
    uni.showToast({ title: '报名成功', icon: 'success' })
    fetchDetail()
  } catch {
    uni.showToast({ title: '报名失败', icon: 'none' })
  } finally {
    registering.value = false
  }
}

onLoad((query) => {
  if (query?.activityId) {
    activityId.value = String(query.activityId)
    fetchDetail()
  }
})
</script>

<template>
  <view class="detail-page" v-if="activity">
    <image class="cover-image" :src="activity.coverImage" mode="aspectFill" />

    <view class="info-section">
      <view class="title-row">
        <text class="detail-title">{{ activity.title }}</text>
        <wd-tag :type="(statusMap[activity.status]?.type || 'info') as any" plain>
          {{ statusMap[activity.status]?.label || activity.status }}
        </wd-tag>
      </view>

      <view class="info-row">
        <wd-icon name="clock" size="28rpx" color="#999" />
        <text class="info-text">{{ activity.startTime }} ~ {{ activity.endTime }}</text>
      </view>
      <view class="info-row">
        <wd-icon name="location" size="28rpx" color="#999" />
        <text class="info-text">{{ activity.location }}</text>
      </view>
      <view class="info-row">
        <wd-icon name="user" size="28rpx" color="#999" />
        <text class="info-text">{{ activity.organizerName }}</text>
      </view>
    </view>

    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-value">{{ activity.currentParticipants }}/{{ activity.maxParticipants }}</text>
        <text class="stat-label">参与人数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <view class="points-value">
          <wd-icon name="star" size="28rpx" color="#e54d42" />
          <text class="points-number">{{ activity.rewardPoints }}</text>
        </view>
        <text class="stat-label">奖励积分</text>
      </view>
    </view>

    <view class="desc-section">
      <text class="section-title">活动详情</text>
      <rich-text class="desc-content" :nodes="activity.description" />
    </view>

    <view class="bottom-bar">
      <wd-button
        type="primary"
        block
        :disabled="buttonDisabled"
        :loading="registering"
        custom-style="height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        @click="handleRegister"
      >
        {{ buttonText }}
      </wd-button>
    </view>
  </view>

  <view class="loading-page" v-else>
    <wd-loading />
  </view>
</template>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

.cover-image {
  width: 100%;
  height: 420rpx;
}

.info-section {
  background: #fff;
  padding: 28rpx 32rpx;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  margin-right: 16rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-top: 14rpx;
}

.info-text {
  font-size: 26rpx;
  color: #666;
  margin-left: 12rpx;
}

.stats-section {
  display: flex;
  align-items: center;
  background: #fff;
  margin-top: 16rpx;
  padding: 28rpx 32rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.points-value {
  display: flex;
  align-items: center;
}

.points-number {
  font-size: 32rpx;
  font-weight: 600;
  color: #e54d42;
  margin-left: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #eee;
}

.desc-section {
  background: #fff;
  margin-top: 16rpx;
  padding: 28rpx 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.desc-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.bottom-bar {
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
