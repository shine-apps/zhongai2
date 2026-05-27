<script setup lang="ts">
import { ref } from 'vue'
import { post } from '@/utils/request'

const postTypes = [
  { value: 'job', label: '招聘' },
  { value: 'resume', label: '求职' },
  { value: 'idle', label: '闲置' },
]

const form = ref({
  postType: 'job',
  title: '',
  content: '',
  images: [] as string[],
  contactInfo: '',
})

const submitting = ref(false)

function chooseImage() {
  uni.chooseImage({
    count: 9,
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
  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  if (!form.value.content.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  if (!form.value.contactInfo.trim()) {
    uni.showToast({ title: '请输入联系方式', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await post('/api/market/posts', form.value)
    uni.showToast({ title: '发布成功，等待审核', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    uni.showToast({ title: '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="create-post-page">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">帖子类型</text>
        <wd-picker :columns="postTypes" v-model="form.postType" placeholder="请选择类型">
          <view class="picker-value">
            {{ postTypes.find(t => t.value === form.postType)?.label }}
            <wd-icon name="arrow-down" size="28rpx" color="#999" />
          </view>
        </wd-picker>
      </view>

      <view class="form-item">
        <text class="form-label">标题</text>
        <wd-input
          v-model="form.title"
          placeholder="请输入标题"
          maxlength="50"
          clearable
        />
      </view>

      <view class="form-item">
        <text class="form-label">内容</text>
        <wd-textarea
          v-model="form.content"
          placeholder="请输入详细内容"
          :maxlength="500"
          :autosize="{ minRows: 4, maxRows: 10 }"
        />
        <text class="char-count">{{ form.content.length }}/500</text>
      </view>

      <view class="form-item">
        <text class="form-label">图片</text>
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
          <view v-if="form.images.length < 9" class="upload-btn" @click="chooseImage">
            <wd-icon name="plus" size="48rpx" color="#ccc" />
            <text>添加图片</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">联系方式</text>
        <wd-input
          v-model="form.contactInfo"
          placeholder="请输入联系方式（手机号/微信等）"
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
        发布帖子
      </wd-button>
      <text class="submit-tip">发布后需要审核才能展示</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.create-post-page {
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

.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;
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

.submit-tip {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}
</style>
