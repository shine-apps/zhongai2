<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { isLoggedIn } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const quickMenus = [
  { icon: 'calendar', text: '我的报名', url: '/pages/activity/list' },
  { icon: 'check', text: '我的签到', url: '' },
  { icon: 'wallet', text: '我的捐助', url: '/pages/donation/list' },
  { icon: 'certificate', text: '实名认证', url: '/pages/user/realname' },
]

const menuList = [
  { icon: 'user', text: '个人资料', url: '/pages/user/profile' },
  { icon: 'star', text: '积分明细', url: '/pages/points/index' },
  { icon: 'goods', text: '我的帖子', url: '/pages/market/my-posts' },
  { icon: 'star-filled', text: '我的收藏', url: '/pages/market/favorites' },
  { icon: 'medal', text: '荣誉等级', url: '' },
  { icon: 'info', text: '关于我们', url: '' },
]

function handleQuickMenu(item: typeof quickMenus[0]) {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  if (!item.url) {
    uni.showToast({ title: '功能开发中', icon: 'none' })
    return
  }
  uni.navigateTo({ url: item.url })
}

function handleMenuClick(item: typeof menuList[0]) {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  if (!item.url) {
    uni.showToast({ title: '功能开发中', icon: 'none' })
    return
  }
  uni.navigateTo({ url: item.url })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

onShow(() => {
  if (isLoggedIn()) {
    userStore.fetchUserInfo()
  }
})
</script>

<template>
  <view class="user-page">
    <view class="user-header">
      <view class="user-info" v-if="isLoggedIn()">
        <image class="user-avatar" :src="userStore.userInfo.avatar || '/static/tab/user.png'" mode="aspectFill" />
        <view class="user-detail">
          <text class="user-name">{{ userStore.userInfo.nickname || '未设置昵称' }}</text>
          <view class="user-meta">
            <text class="user-member" v-if="userStore.userInfo.id">会员号: {{ userStore.userInfo.id }}</text>
            <wd-tag type="primary" size="small" plain v-if="userStore.userInfo.level">
              Lv.{{ userStore.userInfo.level }}
            </wd-tag>
          </view>
        </view>
      </view>
      <view class="user-info" v-else>
        <view class="user-avatar placeholder">
          <wd-icon name="user" size="64rpx" color="#ccc" />
        </view>
        <view class="user-detail">
          <text class="user-name">未登录</text>
          <wd-button size="small" type="primary" plain @click="goLogin">点击登录</wd-button>
        </view>
      </view>
    </view>

    <view class="quick-menu">
      <wd-grid :column="4" :border="false" clickable>
        <wd-grid-item
          v-for="(item, index) in quickMenus"
          :key="index"
          :icon="item.icon"
          :text="item.text"
          @click="handleQuickMenu(item)"
        />
      </wd-grid>
    </view>

    <view class="menu-section">
      <view
        class="menu-item"
        v-for="(item, index) in menuList"
        :key="index"
        @click="handleMenuClick(item)"
      >
        <view class="menu-left">
          <wd-icon :name="item.icon" size="36rpx" color="#e54d42" />
          <text class="menu-text">{{ item.text }}</text>
        </view>
        <wd-icon name="arrow-right" size="28rpx" color="#ccc" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-header {
  background: linear-gradient(180deg, #e54d42 0%, #f56c6c 100%);
  padding: 60rpx 32rpx 40rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);

  &.placeholder {
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.user-detail {
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8rpx;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.user-member {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.quick-menu {
  margin: -20rpx 24rpx 16rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.menu-section {
  margin: 0 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-text {
  font-size: 28rpx;
  color: #333;
  margin-left: 16rpx;
}
</style>
