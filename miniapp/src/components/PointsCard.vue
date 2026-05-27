<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  activityPoints: number
  donationPoints: number
  totalPoints: number
  rank?: number
  levelName: string
}

const props = defineProps<Props>()

const rankText = computed(() => {
  if (props.rank == null) return '--'
  return `第${props.rank}名`
})
</script>

<template>
  <view class="points-card">
    <view class="card-header">
      <text class="total-label">我的积分</text>
      <text class="total-number">{{ totalPoints }}</text>
    </view>

    <view class="card-columns">
      <view class="column-item">
        <text class="column-value">{{ activityPoints }}</text>
        <text class="column-label">活动积分</text>
      </view>
      <view class="column-divider" />
      <view class="column-item">
        <text class="column-value">{{ donationPoints }}</text>
        <text class="column-label">捐助积分</text>
      </view>
      <view class="column-divider" />
      <view class="column-item">
        <text class="column-value">{{ rankText }}</text>
        <text class="column-label">排名</text>
      </view>
    </view>

    <view class="card-footer" v-if="levelName">
      <view class="level-badge">
        <wd-icon name="medal" size="28rpx" color="#fff" />
        <text class="level-text">{{ levelName }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.points-card {
  background: linear-gradient(180deg, #e54d42 0%, #f56c6c 100%);
  padding: 40rpx 32rpx;
  border-radius: 16rpx;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36rpx;
}

.total-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12rpx;
}

.total-number {
  font-size: 72rpx;
  font-weight: 700;
  color: #fff;
}

.card-columns {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 28rpx 0;
}

.column-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.column-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.column-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.column-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

.card-footer {
  display: flex;
  justify-content: center;
  margin-top: 24rpx;
}

.level-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
}

.level-text {
  font-size: 24rpx;
  color: #fff;
  margin-left: 8rpx;
}
</style>
