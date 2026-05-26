<script setup lang="ts">
import { ref } from 'vue'
import { post } from '@/utils/request'
import { setToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const loading = ref(false)
const userStore = useUserStore()

function handleGetPhoneNumber(e: any) {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '需要授权手机号才能登录', icon: 'none' })
    return
  }
  const phoneCode = e.detail.code
  doLogin(phoneCode)
}

async function doLogin(phoneCode: string) {
  loading.value = true
  try {
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      })
    })

    await new Promise<void>((resolve, reject) => {
      uni.checkSession({
        success: resolve,
        fail: reject,
      })
    })

    const data = await post<{ token: string }>('/api/auth/login', {
      code: loginRes.code,
      phoneCode,
    })

    setToken(data.token)
    await userStore.fetchUserInfo()
    uni.switchTab({ url: '/pages/index/index' })
  } catch {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="login-page">
    <view class="login-content">
      <view class="logo-area">
        <view class="logo-icon">
          <wd-icon name="heart-fill" size="120rpx" color="#fff" />
        </view>
        <text class="app-name">众爱联盟</text>
        <text class="app-subtitle">公益积分平台</text>
      </view>

      <view class="login-actions">
        <button
          open-type="getPhoneNumber"
          @getphonenumber="handleGetPhoneNumber"
          class="phone-btn"
          :disabled="loading"
        >
          <wd-button type="primary" block :loading="loading" custom-style="border-radius: 48rpx; height: 96rpx; font-size: 32rpx;">
            微信一键登录
          </wd-button>
        </button>
        <text class="login-tip">登录即代表同意《用户协议》和《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e54d42 0%, #f56c6c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-content {
  width: 100%;
  padding: 0 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 200rpx;
}

.logo-icon {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.app-name {
  font-size: 56rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}

.app-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.phone-btn {
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  line-height: normal;

  &::after {
    border: none;
  }
}

.login-tip {
  margin-top: 32rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}
</style>
