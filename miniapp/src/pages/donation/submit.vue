<script setup lang="ts">
import { ref, computed } from 'vue'
import { post } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'

const donationType = ref('money')
const amount = ref('')
const materialDesc = ref('')
const estimatedValue = ref('')
const evidenceImages = ref<string[]>([])
const evidenceDesc = ref('')
const submitting = ref(false)

const donationTypes = [
  { value: 'money', label: '资金捐助' },
  { value: 'material', label: '物资捐助' },
]

const isMoney = computed(() => donationType.value === 'money')

function chooseImages() {
  const remaining = 9 - evidenceImages.value.length
  if (remaining <= 0) {
    uni.showToast({ title: '最多上传9张图片', icon: 'none' })
    return
  }
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      evidenceImages.value.push(...res.tempFilePaths)
    },
  })
}

function removeImage(index: number) {
  evidenceImages.value.splice(index, 1)
}

async function uploadImages(): Promise<string[]> {
  const urls: string[] = []
  for (const img of evidenceImages.value) {
    const uploadRes = await new Promise<string>((resolve, reject) => {
      uni.uploadFile({
        url: `${import.meta.env.VITE_API_BASE_URL || 'https://api.zhongai.example.com'}/api/upload`,
        filePath: img,
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
    if (uploadRes) urls.push(uploadRes)
  }
  return urls
}

async function handleSubmit() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  if (isMoney.value) {
    if (!amount.value || Number(amount.value) <= 0) {
      uni.showToast({ title: '请输入有效金额', icon: 'none' })
      return
    }
  } else {
    if (!materialDesc.value.trim()) {
      uni.showToast({ title: '请输入物资描述', icon: 'none' })
      return
    }
  }

  submitting.value = true
  try {
    let imageUrls: string[] = []
    if (evidenceImages.value.length) {
      imageUrls = await uploadImages()
    }

    const payload: Record<string, unknown> = {
      type: donationType.value,
      evidenceImages: imageUrls,
      evidenceDesc: evidenceDesc.value,
    }

    if (isMoney.value) {
      payload.amount = Number(amount.value)
    } else {
      payload.materialDesc = materialDesc.value
      payload.estimatedValue = Number(estimatedValue.value) || 0
    }

    await post('/api/donations', payload)
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
  <view class="donation-submit-page">
    <view class="form-section">
      <view class="form-label">捐助类型</view>
      <wd-radio-group v-model="donationType" shape="button">
        <wd-radio v-for="item in donationTypes" :key="item.value" :value="item.value">
          {{ item.label }}
        </wd-radio>
      </wd-radio-group>
    </view>

    <view class="form-section" v-if="isMoney">
      <view class="form-label">捐助金额（元）</view>
      <wd-input v-model="amount" type="number" placeholder="请输入捐助金额" />
    </view>

    <view class="form-section" v-else>
      <view class="form-label">物资描述</view>
      <wd-textarea v-model="materialDesc" placeholder="请描述捐助的物资" :maxlength="500" show-word-limit />
      <view class="form-label" style="margin-top: 24rpx;">预估价值（元）</view>
      <wd-input v-model="estimatedValue" type="number" placeholder="请输入预估价值" />
    </view>

    <view class="form-section">
      <view class="form-label">凭证图片</view>
      <view class="image-list">
        <view class="image-item" v-for="(img, index) in evidenceImages" :key="index">
          <image class="upload-image" :src="img" mode="aspectFill" />
          <view class="image-delete" @click="removeImage(index)">
            <wd-icon name="close" size="24rpx" color="#fff" />
          </view>
        </view>
        <view class="image-add" @click="chooseImages" v-if="evidenceImages.length < 9">
          <wd-icon name="add" size="48rpx" color="#ccc" />
        </view>
      </view>
    </view>

    <view class="form-section">
      <view class="form-label">凭证说明</view>
      <wd-textarea v-model="evidenceDesc" placeholder="请输入凭证说明（选填）" :maxlength="500" show-word-limit />
    </view>

    <view class="submit-area">
      <wd-button
        type="primary"
        block
        :loading="submitting"
        custom-style="height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        @click="handleSubmit"
      >
        提交捐助
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.donation-submit-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16rpx 24rpx;
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}

.upload-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.image-delete {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-add {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  border: 2rpx dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-area {
  margin-top: 40rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
