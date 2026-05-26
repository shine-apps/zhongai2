<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { post } from '@/utils/request'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const realName = ref('')
const idCard = ref('')
const submitting = ref(false)

const isVerified = computed(() => userStore.userInfo.isRealNameVerified)

const idCardPattern = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/

function validateIdCard(): boolean {
  if (!idCardPattern.test(idCard.value)) {
    uni.showToast({ title: '请输入有效的身份证号', icon: 'none' })
    return false
  }
  return true
}

async function handleSubmit() {
  if (!realName.value.trim()) {
    uni.showToast({ title: '请输入真实姓名', icon: 'none' })
    return
  }
  if (!validateIdCard()) return

  submitting.value = true
  try {
    await post('/api/users/me/realname', {
      realName: realName.value,
      idCard: idCard.value,
    })
    await userStore.fetchUserInfo()
    uni.showToast({ title: '认证成功', icon: 'success' })
  } catch {
    uni.showToast({ title: '认证失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onShow(() => {
  if (userStore.userInfo.isRealNameVerified && userStore.userInfo.realName) {
    realName.value = userStore.userInfo.realName
  }
})
</script>

<template>
  <view class="realname-page">
    <view class="verified-status" v-if="isVerified">
      <view class="verified-icon">
        <wd-icon name="check-outline" size="64rpx" color="#07c160" />
      </view>
      <text class="verified-text">已通过实名认证</text>
      <text class="verified-name">{{ realName }}</text>
    </view>

    <view class="form-area" v-else>
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <wd-input v-model="realName" placeholder="请输入真实姓名" clearable :maxlength="20" />
        </view>
        <view class="form-item">
          <text class="form-label">身份证号</text>
          <wd-input v-model="idCard" placeholder="请输入身份证号" clearable :maxlength="18" />
        </view>
      </view>

      <view class="privacy-notice">
        <wd-icon name="info" size="24rpx" color="#999" />
        <text class="privacy-text">您的身份信息将加密存储，仅用于实名认证，不会泄露给第三方</text>
      </view>

      <view class="submit-area">
        <wd-button
          type="primary"
          block
          :loading="submitting"
          custom-style="height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
          @click="handleSubmit"
        >
          提交认证
        </wd-button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.realname-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.verified-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}

.verified-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(7, 193, 96, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.verified-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #07c160;
  margin-bottom: 12rpx;
}

.verified-name {
  font-size: 28rpx;
  color: #666;
}

.form-area {
  padding: 24rpx;
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 0 32rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  font-size: 28rpx;
  color: #333;
  width: 160rpx;
  flex-shrink: 0;
}

.privacy-notice {
  display: flex;
  align-items: flex-start;
  margin: 24rpx 8rpx;
}

.privacy-text {
  font-size: 24rpx;
  color: #999;
  margin-left: 8rpx;
  line-height: 1.6;
}

.submit-area {
  margin-top: 40rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
