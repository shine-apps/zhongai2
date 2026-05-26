<script setup lang="ts">
import { ref } from 'vue'
import { patch } from '@/utils/request'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const nickname = ref(userStore.userInfo.nickname)
const avatarUrl = ref(userStore.userInfo.avatar)
const saving = ref(false)

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      avatarUrl.value = res.tempFilePaths[0]
    },
  })
}

async function handleSave() {
  if (!nickname.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  saving.value = true
  try {
    let avatar = avatarUrl.value
    if (avatar && !avatar.startsWith('http')) {
      const uploadRes = await new Promise<string>((resolve, reject) => {
        uni.uploadFile({
          url: `${import.meta.env.VITE_API_BASE_URL || 'https://api.zhongai.example.com'}/api/upload`,
          filePath: avatar,
          name: 'file',
          success(res) {
            if (res.statusCode === 200) {
              const data = JSON.parse(res.data)
              resolve(data.data?.url || '')
            } else {
              reject(new Error('上传失败'))
            }
          },
          fail: reject,
        })
      })
      avatar = uploadRes
    }

    await patch('/api/users/me', {
      nickname: nickname.value,
      avatar,
    })
    await userStore.fetchUserInfo()
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <view class="profile-page">
    <view class="avatar-section" @click="chooseAvatar">
      <text class="section-label">头像</text>
      <view class="avatar-right">
        <image class="avatar-image" :src="avatarUrl || '/static/tab/user.png'" mode="aspectFill" />
        <wd-icon name="arrow-right" size="28rpx" color="#ccc" />
      </view>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">昵称</text>
        <wd-input v-model="nickname" placeholder="请输入昵称" clearable :maxlength="20" />
      </view>
    </view>

    <view class="save-area">
      <wd-button
        type="primary"
        block
        :loading="saving"
        custom-style="height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        @click="handleSave"
      >
        保存
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.avatar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 28rpx 32rpx;
}

.section-label {
  font-size: 28rpx;
  color: #333;
}

.avatar-right {
  display: flex;
  align-items: center;
}

.avatar-image {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.form-section {
  margin-top: 16rpx;
  background: #fff;
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
  width: 120rpx;
  flex-shrink: 0;
}

.save-area {
  margin: 60rpx 32rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
