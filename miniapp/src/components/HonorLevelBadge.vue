<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  level: number
}

const props = defineProps<Props>()

const levelConfig: Record<number, { icon: string; name: string; bg: string }> = {
  0: { icon: '🌱', name: '新手上路', bg: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)' },
  1: { icon: '🥉', name: '铜牌志愿者', bg: 'linear-gradient(135deg, #cd7f32 0%, #e8a859 100%)' },
  2: { icon: '🥈', name: '银牌志愿者', bg: 'linear-gradient(135deg, #a0a0a0 0%, #c0c0c0 100%)' },
  3: { icon: '🥇', name: '金牌志愿者', bg: 'linear-gradient(135deg, #ffd700 0%, #ffec8b 100%)' },
  4: { icon: '💎', name: '钻石志愿者', bg: 'linear-gradient(135deg, #6a5acd 0%, #9b8ce8 100%)' },
}

const currentLevel = computed(() => {
  return levelConfig[props.level] || levelConfig[0]
})
</script>

<template>
  <view class="honor-level-badge" :style="{ background: currentLevel.bg }">
    <text class="badge-icon">{{ currentLevel.icon }}</text>
    <text class="badge-name">{{ currentLevel.name }}</text>
  </view>
</template>

<style lang="scss" scoped>
.honor-level-badge {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
}

.badge-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.badge-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.15);
}
</style>
