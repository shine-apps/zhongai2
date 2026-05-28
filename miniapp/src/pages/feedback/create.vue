<script setup lang="ts">
import { ref } from 'vue'
import { post } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

const feedbackTypes = [
  { value: 'suggestion', label: '功能建议', icon: '💡' },
  { value: 'bug', label: 'Bug反馈', icon: '🐛' },
  { value: 'complaint', label: '投诉举报', icon: '🚨' },
  { value: 'question', label: '使用咨询', icon: '❓' },
  { value: 'other', label: '其他反馈', icon: '📝' },
]

const form = ref({
  type: 'suggestion',
  title: '',
  content: '',
  images: [] as string[],
  contactInfo: '',
})

const submitting = ref(false)

function chooseImage() {
  uni.chooseImage({
    count: 5 - form.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.images = [...form.value.images, ...res.tempFilePaths]
    },
  })
}

function removeImage(index: number) {
  form.value.images.splice(index, 1)
}

async function submit() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  if (!form.value.title.trim() || form.value.title.length < 5) {
    uni.showToast({ title: '标题至少5个字符', icon: 'none' })
    return
  }
  if (!form.value.content.trim() || form.value.content.length < 20) {
    uni.showToast({ title: '内容至少20个字符', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await post('/api/feedbacks', form.value)
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="feedback-create-page">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">反馈类型</text>
        <view class="type-grid">
          <view
            v-for="ft in feedbackTypes"
            :key="ft.value"
            :class="['type-item', form.type === ft.value ? 'active' : '']"
            @click="form.type = ft.value"
          >
            <text class="type-icon">{{ ft.icon }}</text>
            <text class="type-label">{{ ft.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">标题</text>
        <wd-input
          v-model="form.title"
          placeholder="请输入标题（5-100字符）"
          maxlength="100"
          clearable
        />
      </view>

      <view class="form-item">
        <text class="form-label">详细描述</text>
        <wd-textarea
          v-model="form.content"
          placeholder="请详细描述您的问题或建议（20-2000字符）"
          :maxlength="2000"
          :autosize="{ minRows: 4, maxRows: 10 }"
        />
        <text class="char-count">{{ form.content.length }}/2000</text>
      </view>

      <view class="form-item">
        <text class="form-label">图片（最多5张）</text>
        <view class="image-uploader">
          <view
            v-for="(img, idx) in form.images"
            :key="idx"
            class="uploaded-image"
          >
            <image :src="img" mode="aspectFill" />
            <view class="delete-btn" @click="removeImage(idx)">
              <wd-icon name="close" size="24rpx" color="#fff" />
            </view>
          </view>
          <view v-if="form.images.length < 5" class="upload-btn" @click="chooseImage">
            <wd-icon name="plus" size="48rpx" color="#ccc" />
            <text>添加图片</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">联系方式（可选）</text>
        <wd-input
          v-model="form.contactInfo"
          placeholder="手机号/微信号"
          clearable
        />
      </view>
    </view>

    <view class="submit-section">
      <wd-button
        type="primary"
        block
        :loading="submitting"
        @click="submit"
      >
        提交反馈
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.feedback-create-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.form-section {
  background: #fff;
  padding: 24rpx 32rpx;
}

.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  position: relative;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  min-width: 120rpx;
  transition: all 0.3s;

  &.active {
    border-color: #e54d42;
    background: #fff5f5;
  }
}

.type-icon {
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.type-label {
  font-size: 24rpx;
  color: #666;
}

.char-count {
  position: absolute;
  right: 0;
  bottom: 24rpx;
  font-size: 24rpx;
  color: #999;
}

.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.uploaded-image {
  width: 160rpx;
  height: 160rpx;
  position: relative;
  border-radius: 8rpx;
  overflow: hidden;

  image {
    width: 100%;
    height: 100%;
  }

  .delete-btn {
    position: absolute;
    top: 4rpx;
    right: 4rpx;
    width: 36rpx;
    height: 36rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  text {
    font-size: 24rpx;
    color: #ccc;
  }
}

.submit-section {
  padding: 32rpx 24rpx;
}
</style>
