<script setup lang="ts">
import { ref, computed } from 'vue'
import { post } from '@/utils/request'

const typeOptions = [
  { label: '招聘', value: 'job' },
  { label: '求职', value: 'resume' },
  { label: '闲置', value: 'idle' },
]

const form = ref({
  type: 'job',
  title: '',
  content: '',
  contactInfo: '',
  location: '',
  price: '',
  images: [] as string[],
})

const submitting = ref(false)

const isIdle = computed(() => form.value.type === 'idle')

const typeColumns = computed(() => {
  const cols: any[] = [
    { label: '帖子类型', prop: 'type', type: 'select' },
    { label: '标题', prop: 'title', type: 'input', placeholder: '请输入标题（5-100字符）' },
    { label: '详细内容', prop: 'content', type: 'textarea', placeholder: '请输入详细内容（20-2000字符）' },
    { label: '联系方式', prop: 'contactInfo', type: 'input', placeholder: '手机号或微信号' },
    { label: '地点', prop: 'location', type: 'input', placeholder: '请输入地点（选填）' },
  ]
  if (isIdle.value) {
    cols.push({ label: '价格', prop: 'price', type: 'number', placeholder: '0表示赠送' })
  }
  return cols
})

function onTypeChange({ value }: any) {
  form.value.type = value
}

function chooseImage() {
  const remaining = 9 - form.value.images.length
  if (remaining <= 0) {
    uni.showToast({ title: '最多上传9张图片', icon: 'none' })
    return
  }
  uni.chooseImage({
    count: remaining,
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

function validate(): boolean {
  if (!form.value.title || form.value.title.length < 5 || form.value.title.length > 100) {
    uni.showToast({ title: '标题长度需在5-100字符之间', icon: 'none' })
    return false
  }
  if (!form.value.content || form.value.content.length < 20 || form.value.content.length > 2000) {
    uni.showToast({ title: '内容长度需在20-2000字符之间', icon: 'none' })
    return false
  }
  if (!form.value.contactInfo) {
    uni.showToast({ title: '请填写联系方式', icon: 'none' })
    return false
  }
  if (isIdle.value && form.value.price && Number(form.value.price) < 0) {
    uni.showToast({ title: '价格不能为负数', icon: 'none' })
    return false
  }
  return true
}

async function submitForm() {
  if (!validate()) return
  submitting.value = true
  try {
    const payload: Record<string, unknown> = {
      type: form.value.type,
      title: form.value.title,
      content: form.value.content,
      contactInfo: form.value.contactInfo,
      location: form.value.location || undefined,
      images: form.value.images.length > 0 ? form.value.images : undefined,
    }
    if (isIdle.value && form.value.price) {
      payload.price = Number(form.value.price)
    }

    await post('/api/market/posts', payload)
    uni.showToast({ title: '发布成功，等待审核', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    // error handled by request util
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="create-page">
    <wd-form ref="formRef">
      <!-- Type selector -->
      <wd-cell-group border>
        <wd-select-picker
          v-model="form.type"
          :columns="typeOptions"
          label="帖子类型"
          @confirm="onTypeChange"
        />
      </wd-cell-group>

      <!-- Form fields -->
      <wd-cell-group border>
        <wd-input
          v-model="form.title"
          label="标题"
          placeholder="请输入标题（5-100字符）"
          :maxlength="100"
          clearable
        />
        <wd-textarea
          v-model="form.content"
          label="详细内容"
          placeholder="请输入详细内容（20-2000字符）"
          :maxlength="2000"
          show-word-limit
          :rows="6"
        />
        <wd-input
          v-model="form.contactInfo"
          label="联系方式"
          placeholder="手机号或微信号"
          clearable
        />
        <wd-input
          v-model="form.location"
          label="地点"
          placeholder="请输入地点（选填）"
          clearable
        />
        <wd-input
          v-if="isIdle"
          v-model="form.price"
          label="价格"
          type="number"
          placeholder="0表示赠送"
          clearable
        />
      </wd-cell-group>

      <!-- Image upload -->
      <view class="image-section">
        <view class="section-title">图片（最多9张）</view>
        <view class="image-grid">
          <view
            v-for="(img, idx) in form.images"
            :key="idx"
            class="image-item"
          >
            <image :src="img" mode="aspectFill" class="upload-img" />
            <view class="remove-btn" @click="removeImage(idx)">
              <wd-icon name="close" size="24rpx" color="#fff" />
            </view>
          </view>
          <view v-if="form.images.length < 9" class="image-add" @click="chooseImage">
            <wd-icon name="add" size="48rpx" color="#999" />
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>
    </wd-form>

    <!-- Submit button -->
    <view class="submit-area">
      <wd-button type="primary" block :loading="submitting" @click="submitForm">
        发布帖子
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.image-section {
  background: #fff;
  margin-top: 16rpx;
  padding: 24rpx 32rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.upload-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 8rpx;
}

.remove-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-add {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.add-text {
  font-size: 22rpx;
  color: #999;
}

.submit-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: #fff;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
}
</style>
