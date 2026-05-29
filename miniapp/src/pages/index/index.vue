<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { get } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface Banner {
  id: string
  image: string
  title: string
  link: string
}

interface Activity {
  id: string
  title: string
  coverImage: string
  startTime: string
  location: string
  currentParticipants: number
  maxParticipants: number
  rewardPoints: number
  status: string
}

const banners = ref<Banner[]>([])
const activities = ref<Activity[]>([])
const loading = ref(false)

async function fetchBanners() {
  try {
    const data = await get<Banner[]>('/api/banners')
    banners.value = data
  } catch {
    banners.value = []
  }
}

async function fetchActivities() {
  loading.value = true
  try {
    const data = await get<{ list: Activity[]; pagination: { total: number } }>('/api/activities', { pageSize: 4, status: 'published' })
    activities.value = data.list
  } catch {
    activities.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(val: string) {
  if (!val.trim()) return
  uni.navigateTo({ url: `/pages/activity/list?keyword=${encodeURIComponent(val)}` })
}

function handleGridClick(index: number) {
  const routes = [
    '/pages/activity/list',
    '/pages/donation/submit',
    '/pages/points/index',
    '/pages/user/realname',
  ]
  const url = routes[index]
  if (index === 0) {
    uni.switchTab({ url })
  } else if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
  } else {
    uni.navigateTo({ url })
  }
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/activity/detail?activityId=${id}` })
}

onShow(() => {
  fetchBanners()
  fetchActivities()
})

onPullDownRefresh(async () => {
  await Promise.all([fetchBanners(), fetchActivities()])
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="home-page">
    <view class="search-bar">
      <wd-search placeholder="搜索公益活动" @search="handleSearch" />
    </view>

    <view class="banner-section" v-if="banners.length">
      <wd-swiper :list="banners.map(b => b.image)" autoplay indicator-position="bottom-right" />
    </view>

    <view class="quick-actions">
      <wd-grid :column="4" :border="false" clickable>
        <wd-grid-item icon="calendar" text="活动报名" @click="handleGridClick(0)" />
        <wd-grid-item icon="goods" text="爱心捐助" @click="handleGridClick(1)" />
        <wd-grid-item icon="star" text="积分商城" @click="handleGridClick(2)" />
        <wd-grid-item icon="certificate" text="实名认证" @click="handleGridClick(3)" />
      </wd-grid>
    </view>

    <view class="hot-section">
      <view class="section-header">
        <text class="section-title">热门活动</text>
        <text class="section-more" @click="uni.switchTab({ url: '/pages/activity/list' })">查看更多</text>
      </view>

      <view class="activity-list" v-if="activities.length">
        <view
          class="activity-card"
          v-for="item in activities"
          :key="item.id"
          @click="goDetail(item.id)"
        >
          <image class="activity-cover" :src="item.coverImage" mode="aspectFill" />
          <view class="activity-info">
            <text class="activity-title">{{ item.title }}</text>
            <view class="activity-meta">
              <wd-icon name="clock" size="24rpx" color="#999" />
              <text class="meta-text">{{ item.startTime }}</text>
            </view>
            <view class="activity-meta">
              <wd-icon name="location" size="24rpx" color="#999" />
              <text class="meta-text">{{ item.location }}</text>
            </view>
            <view class="activity-footer">
              <text class="participants">{{ item.currentParticipants }}/{{ item.maxParticipants }}人参与</text>
              <view class="points-badge">
                <wd-icon name="star" size="22rpx" color="#e54d42" />
                <text class="points-text">+{{ item.rewardPoints }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <wd-status-tip v-else-if="!loading" image="content" tip="暂无热门活动" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  padding: 16rpx 24rpx;
  background: #fff;
}

.banner-section {
  margin: 16rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.quick-actions {
  margin: 16rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.hot-section {
  margin: 16rpx 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #999;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.activity-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  padding: 20rpx;
}

.activity-cover {
  width: 220rpx;
  height: 200rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.activity-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999;
  margin-left: 8rpx;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.participants {
  font-size: 24rpx;
  color: #666;
}

.points-badge {
  display: flex;
  align-items: center;
  background: rgba(229, 77, 66, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.points-text {
  font-size: 24rpx;
  color: #e54d42;
  font-weight: 500;
  margin-left: 4rpx;
}
</style>
