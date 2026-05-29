<script setup lang="ts">
import { ref } from 'vue'
import { post } from '@/utils/request'
import { setToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const loading = ref(false)
const passwordLoading = ref(false)
const userStore = useUserStore()

// Username/password login
const loginMode = ref<'wechat' | 'password'>('password')
const username = ref('')
const password = ref('')

function handleGetPhoneNumber(e: any) {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '需要授权手机号才能登录', icon: 'none' })
    return
  }
  const phoneCode = e.detail.code
  doWechatLogin(phoneCode)
}

async function doWechatLogin(phoneCode: string) {
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

    const data = await post<{ accessToken: string; token: string }>('/api/auth/login', {
      code: loginRes.code,
      phoneCode,
    })

    setToken(data.accessToken || data.token)
    await userStore.fetchUserInfo()
    uni.switchTab({ url: '/pages/index/index' })
  } catch {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function doPasswordLogin() {
  if (!username.value.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  passwordLoading.value = true
  try {
    const data = await post<{ accessToken: string; token: string }>('/api/auth/password-login', {
      username: username.value.trim(),
      password: password.value,
    })

    setToken(data.accessToken || data.token)
    await userStore.fetchUserInfo()
    uni.switchTab({ url: '/pages/index/index' })
  } catch {
    uni.showToast({ title: '用户名或密码错误', icon: 'none' })
  } finally {
    passwordLoading.value = false
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

      <!-- Login mode tabs -->
      <view class="login-tabs">
        <view
          class="login-tab"
          :class="{ active: loginMode === 'password' }"
          @tap="loginMode = 'password'"
        >
          账号密码登录
        </view>
        <view class="login-tab-divider" />
        <view
          class="login-tab"
          :class="{ active: loginMode === 'wechat' }"
          @tap="loginMode = 'wechat'"
        >
          微信登录
        </view>
      </view>

      <!-- Password login form -->
      <view v-if="loginMode === 'password'" class="login-form">
        <view class="form-item">
          <wd-icon name="person" size="40rpx" color="rgba(255,255,255,0.8)" />
          <input
            v-model="username"
            class="form-input"
            type="text"
            placeholder="请输入用户名"
            placeholder-class="form-placeholder"
            :maxlength="50"
          />
        </view>
        <view class="form-item">
          <wd-icon name="lock" size="40rpx" color="rgba(255,255,255,0.8)" />
          <input
            v-model="password"
            class="form-input"
            type="password"
            placeholder="请输入密码"
            placeholder-class="form-placeholder"
            :maxlength="50"
          />
        </view>
        <wd-button
          type="primary"
          block
          :loading="passwordLoading"
          :disabled="passwordLoading"
          custom-style="border-radius: 48rpx; height: 96rpx; font-size: 32rpx; margin-top: 40rpx;"
          @click="doPasswordLogin"
        >
          登录
        </wd-button>
      </view>

      <!-- WeChat login -->
      <view v-else class="login-actions">
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
      </view>

      <text class="login-tip">登录即代表同意《用户协议》和《隐私政策》</text>
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
  margin-bottom: 100rpx;
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

.login-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
  width: 100%;
}

.login-tab {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.6);
  padding: 16rpx 0;
  position: relative;

  &.active {
    color: #fff;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 6rpx;
      background: #fff;
      border-radius: 3rpx;
    }
  }
}

.login-tab-divider {
  width: 2rpx;
  height: 30rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 40rpx;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.form-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 48rpx;
  padding: 0 32rpx;
  height: 96rpx;
  margin-bottom: 24rpx;
}

.form-input {
  flex: 1;
  margin-left: 20rpx;
  font-size: 30rpx;
  color: #fff;
  height: 96rpx;
}

.form-placeholder {
  color: rgba(255, 255, 255, 0.5);
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
