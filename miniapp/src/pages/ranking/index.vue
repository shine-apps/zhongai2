<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { get } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

interface RankingItem {
  rank: number
  userId: string
  nickname: string
  avatarUrl: string | null
  score: number
}

interface RankingResponse {
  type: string
  list: RankingItem[]
  myRank: RankingItem | null
  total: number
  page: number
  pageSize: number
}

const tabs = [
  { name: '活动榜', value: 'activity' },
  { name: '捐助榜', value: 'donation' },
]

const currentTab = ref(0)
const loading = ref(false)
const rankingList = ref<RankingItem[]>([])
const myRank = ref<RankingItem | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = 20

const currentType = computed(() => tabs[currentTab.value].value)
const top3 = computed(() => rankingList.value.filter((item) => item.rank <= 3))
const restList = computed(() => rankingList.value.filter((item) => item.rank > 3))
const hasMore = computed(() => rankingList.value.length < total.value)

// Podium display order: 2nd, 1st, 3rd
const podiumOrder = computed(() => {
  const order: RankingItem[] = []
  const second = top3.value.find((i) => i.rank === 2)
  const first = top3.value.find((i) => i.rank === 1)
  const third = top3.value.find((i) => i.rank === 3)
  if (second) order.push(second)
  if (first) order.push(first)
  if (third) order.push(third)
  return order
})

const crownIcons: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

async function fetchRanking(reset = false) {
  if (reset) {
    page.value = 1
    rankingList.value = []
  }
  loading.value = true
  try {
    const data = await get<RankingResponse>(`/api/rankings/${currentType.value}`, {
      page: page.value,
      pageSize,
    })
    if (reset) {
      rankingList.value = data.list
    } else {
      rankingList.value = [...rankingList.value, ...data.list]
    }
    myRank.value = data.myRank
    total.value = data.total
  } catch {
    if (reset) rankingList.value = []
  } finally {
    loading.value = false
  }
}

function onTabChange({ name }: { name: string }) {
  const idx = tabs.findIndex((t) => t.name === name)
  if (idx >= 0) {
    currentTab.value = idx
    fetchRanking(true)
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchRanking()
}

onShow(() => {
  fetchRanking(true)
})

onPullDownRefresh(async () => {
  await fetchRanking(true)
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="ranking-page">
    <!-- Tabs -->
    <wd-tabs v-model="currentTab" @change="onTabChange">
      <wd-tab v-for="tab in tabs" :key="tab.value" :name="tab.name" :title="tab.name" />
    </wd-tabs>

    <!-- TOP 3 Podium -->
    <view class="podium-section" v-if="top3.length > 0">
      <view class="podium-container">
        <view
          v-for="item in podiumOrder"
          :key="item.rank"
          class="podium-item"
          :class="`rank-${item.rank}`"
        >
          <text class="crown">{{ crownIcons[item.rank] }}</text>
          <image
            v-if="item.avatarUrl"
            class="avatar"
            :src="item.avatarUrl"
            mode="aspectFill"
          />
          <view v-else class="avatar avatar-placeholder">
            <text class="avatar-text">{{ item.nickname?.charAt(0) || '?' }}</text>
          </view>
          <text class="nickname">{{ item.nickname }}</text>
          <text class="score">{{ item.score }}</text>
          <text class="score-label">积分</text>
        </view>
      </view>
    </view>

    <!-- Ranking List (rank 4+) -->
    <scroll-view
      class="ranking-list"
      scroll-y
      @scrolltolower="loadMore"
    >
      <view v-if="restList.length > 0" class="list-content">
        <view
          class="ranking-item"
          v-for="item in restList"
          :key="item.rank"
        >
          <view class="rank-number">
            <text>{{ item.rank }}</text>
          </view>
          <image
            v-if="item.avatarUrl"
            class="item-avatar"
            :src="item.avatarUrl"
            mode="aspectFill"
          />
          <view v-else class="item-avatar avatar-placeholder-sm">
            <text class="avatar-text-sm">{{ item.nickname?.charAt(0) || '?' }}</text>
          </view>
          <view class="item-info">
            <text class="item-nickname">{{ item.nickname }}</text>
          </view>
          <view class="item-score">
            <text class="score-value">{{ item.score }}</text>
            <text class="score-unit">积分</text>
          </view>
        </view>
      </view>

      <wd-loading v-if="loading && restList.length === 0" />
      <wd-status-tip
        v-else-if="!loading && rankingList.length === 0"
        image="content"
        tip="暂无排行数据"
      />

      <view v-if="hasMore && !loading" class="load-more" @tap="loadMore">
        <text>加载更多</text>
      </view>
      <wd-loading v-if="loading && restList.length > 0" />
    </scroll-view>

    <!-- My Rank (fixed bottom) -->
    <view class="my-rank-bar" v-if="isLoggedIn() && myRank">
      <view class="my-rank-content">
        <view class="my-rank-left">
          <text class="my-rank-label">我的排名</text>
          <text class="my-rank-number">第 {{ myRank.rank }} 名</text>
        </view>
        <view class="my-rank-right">
          <text class="my-score-value">{{ myRank.score }}</text>
          <text class="my-score-unit">积分</text>
        </view>
      </view>
    </view>
    <view class="my-rank-bar" v-else-if="isLoggedIn() && !myRank">
      <view class="my-rank-content">
        <view class="my-rank-left">
          <text class="my-rank-label">我的排名</text>
          <text class="my-rank-number">暂无上榜</text>
        </view>
        <view class="my-rank-right">
          <text class="my-score-value">0</text>
          <text class="my-score-unit">积分</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.ranking-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* Podium Section */
.podium-section {
  background: linear-gradient(180deg, #fff5f5 0%, #f5f5f5 100%);
  padding: 40rpx 24rpx 32rpx;
}

.podium-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 20rpx;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200rpx;

  &.rank-1 {
    order: 2;
    .avatar {
      width: 120rpx;
      height: 120rpx;
      border: 4rpx solid #ffd700;
    }
    .crown {
      font-size: 48rpx;
    }
  }

  &.rank-2 {
    order: 1;
    .avatar {
      width: 100rpx;
      height: 100rpx;
      border: 4rpx solid #c0c0c0;
    }
    .crown {
      font-size: 40rpx;
    }
  }

  &.rank-3 {
    order: 3;
    .avatar {
      width: 100rpx;
      height: 100rpx;
      border: 4rpx solid #cd7f32;
    }
    .crown {
      font-size: 40rpx;
    }
  }
}

.crown {
  margin-bottom: 8rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-bottom: 12rpx;
  background: #eee;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e54d42, #f56c6c);
}

.avatar-text {
  font-size: 36rpx;
  color: #fff;
  font-weight: 600;
}

.nickname {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180rpx;
}

.score {
  font-size: 28rpx;
  font-weight: 600;
  color: #e54d42;
  margin-top: 4rpx;
}

.score-label {
  font-size: 20rpx;
  color: #999;
}

/* Ranking List */
.ranking-list {
  flex: 1;
  padding: 0 24rpx 140rpx;
}

.list-content {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.rank-number {
  width: 60rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #999;
  text-align: center;
}

.item-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin: 0 20rpx;
  background: #eee;
}

.avatar-placeholder-sm {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e54d42, #f56c6c);
}

.avatar-text-sm {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.item-info {
  flex: 1;
}

.item-nickname {
  font-size: 28rpx;
  color: #333;
}

.item-score {
  display: flex;
  align-items: baseline;
}

.score-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #e54d42;
}

.score-unit {
  font-size: 22rpx;
  color: #999;
  margin-left: 4rpx;
}

.load-more {
  padding: 24rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

/* My Rank Bar */
.my-rank-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.my-rank-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.my-rank-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.my-rank-label {
  font-size: 26rpx;
  color: #666;
}

.my-rank-number {
  font-size: 30rpx;
  font-weight: 600;
  color: #e54d42;
}

.my-rank-right {
  display: flex;
  align-items: baseline;
}

.my-score-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #e54d42;
}

.my-score-unit {
  font-size: 24rpx;
  color: #999;
  margin-left: 4rpx;
}
</style>
