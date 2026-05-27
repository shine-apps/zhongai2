<script setup lang="ts">

interface PointTransaction {
  id: string
  pointType: string
  amount: number
  description: string
  createdAt: string
}

interface Props {
  list: PointTransaction[]
  loading: boolean
}

defineProps<Props>()

const typeIcons: Record<string, string> = {
  activity: 'calendar',
  donation: 'wallet',
  exchange: 'goods',
  sign: 'check',
}
</script>

<template>
  <view class="points-history-list">
    <view v-if="loading" class="list-loading">
      <wd-loading />
    </view>

    <template v-else>
      <view class="transaction-list" v-if="list.length">
        <view class="transaction-item" v-for="item in list" :key="item.id">
          <view class="item-left">
            <view class="item-icon">
              <wd-icon :name="typeIcons[item.pointType] || 'star'" size="36rpx" color="#e54d42" />
            </view>
            <view class="item-info">
              <text class="item-desc">{{ item.description }}</text>
              <text class="item-time">{{ item.createdAt }}</text>
            </view>
          </view>
          <text
            class="item-amount"
            :class="{ positive: item.amount > 0, negative: item.amount < 0 }"
          >
            {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
          </text>
        </view>
      </view>

      <wd-empty v-else image="content" description="暂无积分记录" />
    </template>
  </view>
</template>

<style lang="scss" scoped>
.points-history-list {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
}

.list-loading {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
}

.transaction-list {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.item-left {
  display: flex;
  align-items: center;
}

.item-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(229, 77, 66, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-desc {
  font-size: 28rpx;
  color: #333;
}

.item-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}

.item-amount {
  font-size: 32rpx;
  font-weight: 600;

  &.positive {
    color: #07c160;
  }

  &.negative {
    color: #e54d42;
  }
}
</style>
