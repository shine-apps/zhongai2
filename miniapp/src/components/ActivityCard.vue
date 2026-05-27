<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id: string
  title: string
  category: string
  coverImage?: string
  startTime: string
  endTime: string
  location?: string
  currentParticipants: number
  maxParticipants?: number
  rewardPoints: number
  status: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [id: string]
}>()

const statusMap: Record<string, { label: string; type: string }> = {
  draft: { label: '草稿', type: 'info' },
  published: { label: '报名中', type: 'success' },
  ongoing: { label: '进行中', type: 'warning' },
  completed: { label: '已完成', type: 'primary' },
  cancelled: { label: '已取消', type: 'danger' },
}

const statusInfo = computed(() => statusMap[props.status] || { label: props.status, type: 'info' })

const participantText = computed(() => {
  if (props.maxParticipants) {
    return `${props.currentParticipants}/${props.maxParticipants}`
  }
  return `${props.currentParticipants}`
})

function handleClick() {
  emit('click', props.id)
}
</script>

<template>
  <view class="activity-card" @click="handleClick">
    <image
      v-if="coverImage"
      class="card-cover"
      :src="coverImage"
      mode="aspectFill"
    />
    <view v-else class="card-cover placeholder">
      <wd-icon name="pic" size="48rpx" color="#ccc" />
    </view>

    <view class="card-body">
      <view class="card-header">
        <text class="card-title">{{ title }}</text>
        <wd-tag :type="statusInfo.type as any" size="small" plain>
          {{ statusInfo.label }}
        </wd-tag>
      </view>

      <view class="card-meta">
        <wd-icon name="clock" size="22rpx" color="#999" />
        <text class="meta-text">{{ startTime }} ~ {{ endTime }}</text>
      </view>

      <view class="card-meta" v-if="location">
        <wd-icon name="location" size="22rpx" color="#999" />
        <text class="meta-text">{{ location }}</text>
      </view>

      <view class="card-footer">
        <view class="footer-left">
          <view class="participant-info">
            <wd-icon name="user" size="20rpx" color="#999" />
            <text class="participant-text">{{ participantText }}</text>
          </view>
        </view>
        <view class="points-badge">
          <wd-icon name="star" size="20rpx" color="#e54d42" />
          <text class="points-text">+{{ rewardPoints }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.activity-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.card-cover {
  width: 200rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;

  &.placeholder {
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.card-body {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  flex: 1;
  margin-right: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  margin-top: 6rpx;
}

.meta-text {
  font-size: 22rpx;
  color: #999;
  margin-left: 6rpx;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.footer-left {
  display: flex;
  align-items: center;
}

.participant-info {
  display: flex;
  align-items: center;
}

.participant-text {
  font-size: 22rpx;
  color: #999;
  margin-left: 4rpx;
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
