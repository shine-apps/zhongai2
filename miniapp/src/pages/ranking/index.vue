<script setup lang="ts">
import { ref, onShow } from 'vue'
import { get } from '@/utils/request'

interface RankItem {
  id: number
  nickname: string
  avatar: string
  score: number
  rank: number
  honorLevel: number
  rankChange: 'up' | 'down' | 'same'
}

const tabs = [
  { value: 'activity', label: '活动积分' },
  { value: 'donation', label: '捐助大爱' },
  { value: 'active', label: '活跃之星' },
]

const activeTab = ref('activity')
const rankings = ref<RankItem[]>([])
const loading = ref(false)

async function fetchRankings() {
  loading.value = true
  try {
    const data = await get<RankItem[]>(`/api/rankings/${activeTab.value}`)
    rankings.value = data
  } catch {
    rankings.value = []
  } finally {
    loading.value = false
  }
}

function getRankIcon(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return ''
}

function getRankClass(rank: number) {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return ''
}

function getRankChangeIcon(change: string) {
  if (change === 'up') return '↑'
  if (change === 'down') return '↓'
  return '-'
}

function getRankChangeColor(change: string) {
  if (change === 'up') return '#e54d42'
  if (change === 'down') return '#07c160'
  return '#999'
}

function switchTab(tab: string) {
  activeTab.value = tab
  fetchRankings()
}

onShow(() => {
  fetchRankings()
})
</script>

<template>
  <view class="ranking-page">
    <view class="tabs-header">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', activeTab === tab.value ? 'active' : '']"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>

    <view class="ranking-content">
      <view v-if="rankings.length" class="ranking-list">
        <view
          v-for="item in rankings"
          :key="item.id"
          :class="['ranking-item', getRankClass(item.rank)]"
        >
          <view class="rank-number">
            <text v-if="item.rank <= 3" class="rank-emoji">{{ getRankIcon(item.rank) }}</text>
            <text v-else class="rank-text">{{ item.rank }}</text>
          </view>
          
          <image class="user-avatar" :src="item.avatar || '/static/tab/user.png'" mode="aspectFill" />
          
          <view class="user-info">
            <text class="user-name">{{ item.nickname }}</text>
            <view class="user-meta">
              <text class="honor-badge">Lv.{{ item.honorLevel }}</text>
              <text :style="{ color: getRankChangeColor(item.rankChange) }" class="rank-change">
                {{ getRankChangeIcon(item.rankChange) }}
              </text>
            </view>
          </view>
          
          <view class="score-info">
            <text class="score-value">{{ item.score }}</text>
            <text class="score-label">{{ activeTab === 'donation' ? '元' : '分' }}</text>
          </view>
        </view>
      </view>
      
      <wd-status-tip v-else-if="!loading" image="content" tip="暂无排行数据" />
      
      <wd-loading v-else type="circle" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.ranking-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.tabs-header {
  display: flex;
  background: #fff;
  padding: 8rpx 16rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  transition: all 0.3s;
  
  &.active {
    color: #e54d42;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background: #e54d42;
      border-radius: 2rpx;
    }
  }
}

.ranking-content {
  padding: 16rpx;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ranking-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  
  &.rank-1 {
    background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
    border: 2rpx solid #ffc107;
  }
  
  &.rank-2 {
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    border: 2rpx solid #9e9e9e;
  }
  
  &.rank-3 {
    background: linear-gradient(135deg, #e6f0fa 0%, #d1ecf1 100%);
    border: 2rpx solid #03a9f4;
  }
}

.rank-number {
  width: 60rpx;
  text-align: center;
}

.rank-emoji {
  font-size: 36rpx;
}

.rank-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #666;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-left: 16rpx;
}

.user-info {
  flex: 1;
  margin-left: 16rpx;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.honor-badge {
  font-size: 22rpx;
  background: linear-gradient(135deg, #e54d42 0%, #f56c6c 100%);
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.rank-change {
  font-size: 24rpx;
}

.score-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.score-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #e54d42;
}

.score-label {
  font-size: 22rpx;
  color: #999;
}
</style>
