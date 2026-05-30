<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { get } from '@/utils/request'

interface Activity {
  id: string
  title: string
  coverImage: string
  startTime: string
  location: string
  category: string
  status: string
  rewardPoints: number
  currentParticipants: number
  maxParticipants: number
}

const tabs = [
  { name: '全部', value: '' },
  { name: '环保', value: 'environment' },
  { name: '助老', value: 'elderly' },
  { name: '助学', value: 'education' },
  { name: '社区', value: 'community' },
  { name: '医疗', value: 'medical' },
]

const currentTab = ref(0)
const activities = ref<Activity[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const finished = ref(false)
const keyword = ref('')

const currentCategory = computed(() => tabs[currentTab.value].value)

const statusMap: Record<string, { label: string; type: string }> = {
  draft: { label: '草稿', type: 'default' },
  published: { label: '报名中', type: 'success' },
  ongoing: { label: '进行中', type: 'warning' },
  completed: { label: '已完成', type: 'primary' },
  cancelled: { label: '已取消', type: 'danger' },
}

async function fetchActivities(reset = false) {
  if (loading.value) return
  if (!reset && finished.value) return

  if (reset) {
    page.value = 1
    finished.value = false
    activities.value = []
  }

  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize,
    }
    if (currentCategory.value) {
      params.category = currentCategory.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    const data = await get<{ list: Activity[]; pagination: { total: number; page: number; pageSize: number; totalPages: number } }>('/api/activities', params)
    if (reset) {
      activities.value = data.list
    } else {
      activities.value.push(...data.list)
    }
    total.value = data.pagination.total
    if (activities.value.length >= data.pagination.total) {
      finished.value = true
    }
  } catch {
    finished.value = true
  } finally {
    loading.value = false
  }
}

function onTabChange({ index }: { index: number }) {
  currentTab.value = index
  fetchActivities(true)
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/activity/detail?activityId=${id}` })
}

onLoad((query) => {
  if (query?.keyword) {
    keyword.value = query.keyword
  }
  fetchActivities(true)
})

onReachBottom(() => {
  if (!finished.value) {
    page.value++
    fetchActivities()
  }
})

onPullDownRefresh(async () => {
  await fetchActivities(true)
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="activity-list-page">
    <wd-tabs v-model="currentTab" @change="onTabChange">
      <wd-tab v-for="tab in tabs" :key="tab.value" :name="tab.name" />
    </wd-tabs>

    <view class="list-content">
      <view
        class="activity-item"
        v-for="item in activities"
        :key="item.id"
        @click="goDetail(item.id)"
      >
        <image class="item-cover" :src="item.coverImage" mode="aspectFill" />
        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <view class="item-meta">
            <wd-icon name="clock" size="22rpx" color="#999" />
            <text class="meta-text">{{ item.startTime }}</text>
          </view>
          <view class="item-meta">
            <wd-icon name="location" size="22rpx" color="#999" />
            <text class="meta-text">{{ item.location }}</text>
          </view>
          <view class="item-bottom">
            <wd-tag :type="(statusMap[item.status]?.type || 'default') as any" size="small" plain>
              {{ statusMap[item.status]?.label || item.status }}
            </wd-tag>
            <view class="points-badge">
              <wd-icon name="star" size="20rpx" color="#e54d42" />
              <text class="points-text">+{{ item.rewardPoints }}</text>
            </view>
          </view>
        </view>
      </view>

      <wd-loadmore :state="finished ? 'finished' : loading ? 'loading' : 'error'" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.activity-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.list-content {
  padding: 16rpx 24rpx;
}

.activity-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.item-cover {
  width: 200rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  margin-top: 6rpx;
}

.meta-text {
  font-size: 22rpx;
  color: #999;
  margin-left: 6rpx;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.points-badge {
  display: flex;
  align-items: center;
  background: rgba(229, 77, 66, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.points-text {
  font-size: 22rpx;
  color: #e54d42;
  font-weight: 500;
  margin-left: 4rpx;
}
</style>
