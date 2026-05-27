<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { post } from '@/utils/request'
import { isLoggedIn } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const title = ref('')
const category = ref('')
const description = ref('')
const coverImage = ref('')
const startTime = ref('')
const endTime = ref('')
const location = ref('')
const latitude = ref(0)
const longitude = ref(0)
const checkinRadius = ref(200)
const maxParticipants = ref(50)
const rewardPoints = ref(10)
const submitting = ref(false)

const categoryOptions = [
  { value: 'elder_care', label: '助老' },
  { value: 'education', label: '助学' },
  { value: 'env', label: '环保' },
  { value: 'disaster', label: '救灾' },
  { value: 'other', label: '其他' },
]

const categoryPickerVisible = ref(false)
const categoryColumns = categoryOptions.map((o) => ({ value: o.value, label: o.label }))

const startTimePickerVisible = ref(false)
const endTimePickerVisible = ref(false)

const currentDatetime = Date.now()

const categoryLabel = computed(() => {
  const opt = categoryOptions.find((o) => o.value === category.value)
  return opt ? opt.label : '请选择分类'
})

const isLeader = computed(() => {
  const role = (userStore.userInfo as Record<string, unknown>).role
  return role === 'leader' || role === 'admin'
})

function onCategoryConfirm({ value }: { value: string }) {
  category.value = value
  categoryPickerVisible.value = false
}

function onStartTimeConfirm({ value }: { value: number }) {
  const d = new Date(value)
  startTime.value = formatDate(d)
  startTimePickerVisible.value = false
}

function onEndTimeConfirm({ value }: { value: number }) {
  const d = new Date(value)
  endTime.value = formatDate(d)
  endTimePickerVisible.value = false
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function chooseCoverImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      uploadCoverImage(res.tempFilePaths[0])
    },
  })
}

async function uploadCoverImage(filePath: string) {
  try {
    const url = await new Promise<string>((resolve, reject) => {
      uni.uploadFile({
        url: `${import.meta.env.VITE_API_BASE_URL || 'https://api.zhongai.example.com'}/api/upload`,
        filePath,
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
    coverImage.value = url
  } catch {
    uni.showToast({ title: '封面上传失败', icon: 'none' })
  }
}

function chooseLocation() {
  uni.chooseLocation({
    success: (res) => {
      location.value = res.name || res.address
      latitude.value = res.latitude
      longitude.value = res.longitude
    },
    fail: () => {
      uni.showToast({ title: '选择位置失败', icon: 'none' })
    },
  })
}

function validate(): boolean {
  if (!title.value.trim()) {
    uni.showToast({ title: '请输入活动标题', icon: 'none' })
    return false
  }
  if (!category.value) {
    uni.showToast({ title: '请选择活动分类', icon: 'none' })
    return false
  }
  if (!description.value.trim()) {
    uni.showToast({ title: '请输入活动描述', icon: 'none' })
    return false
  }
  if (!startTime.value) {
    uni.showToast({ title: '请选择开始时间', icon: 'none' })
    return false
  }
  if (!endTime.value) {
    uni.showToast({ title: '请选择结束时间', icon: 'none' })
    return false
  }
  if (!location.value.trim()) {
    uni.showToast({ title: '请选择活动地点', icon: 'none' })
    return false
  }
  if (maxParticipants.value <= 0) {
    uni.showToast({ title: '请输入有效的参与人数上限', icon: 'none' })
    return false
  }
  if (rewardPoints.value < 0) {
    uni.showToast({ title: '奖励积分不能为负数', icon: 'none' })
    return false
  }
  return true
}

async function handleSubmit() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  if (!isLeader.value) {
    uni.showToast({ title: '仅队长/管理员可创建活动', icon: 'none' })
    return
  }

  if (!validate()) return

  submitting.value = true
  try {
    await post('/api/activities', {
      title: title.value,
      category: category.value,
      description: description.value,
      coverImage: coverImage.value,
      startTime: startTime.value,
      endTime: endTime.value,
      location: location.value,
      latitude: latitude.value,
      longitude: longitude.value,
      checkinRadius: checkinRadius.value,
      maxParticipants: maxParticipants.value,
      rewardPoints: rewardPoints.value,
    })
    uni.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    uni.showToast({ title: '创建失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onLoad(() => {
  if (!isLeader.value) {
    uni.showModal({
      title: '提示',
      content: '仅队长/管理员可创建活动',
      showCancel: false,
      success: () => {
        uni.navigateBack()
      },
    })
  }
})
</script>

<template>
  <view class="create-page">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">活动标题</text>
        <wd-input v-model="title" placeholder="请输入活动标题" clearable :maxlength="50" />
      </view>
      <view class="form-item" @click="categoryPickerVisible = true">
        <text class="form-label">活动分类</text>
        <view class="picker-value">
          <text :class="['picker-text', { placeholder: !category }]">{{ categoryLabel }}</text>
          <wd-icon name="arrow-right" size="28rpx" color="#999" />
        </view>
      </view>
    </view>

    <view class="form-section">
      <view class="form-item vertical">
        <text class="form-label">活动描述</text>
        <wd-textarea v-model="description" placeholder="请输入活动描述" :maxlength="2000" show-word-limit />
      </view>
    </view>

    <view class="form-section">
      <view class="form-item vertical">
        <text class="form-label">封面图片</text>
        <view class="cover-upload" @click="chooseCoverImage">
          <image v-if="coverImage" class="cover-preview" :src="coverImage" mode="aspectFill" />
          <view v-else class="cover-placeholder">
            <wd-icon name="add" size="48rpx" color="#ccc" />
            <text class="cover-tip">上传封面</text>
          </view>
        </view>
      </view>
    </view>

    <view class="form-section">
      <view class="form-item" @click="startTimePickerVisible = true">
        <text class="form-label">开始时间</text>
        <view class="picker-value">
          <text :class="['picker-text', { placeholder: !startTime }]">{{ startTime || '请选择开始时间' }}</text>
          <wd-icon name="arrow-right" size="28rpx" color="#999" />
        </view>
      </view>
      <view class="form-item" @click="endTimePickerVisible = true">
        <text class="form-label">结束时间</text>
        <view class="picker-value">
          <text :class="['picker-text', { placeholder: !endTime }]">{{ endTime || '请选择结束时间' }}</text>
          <wd-icon name="arrow-right" size="28rpx" color="#999" />
        </view>
      </view>
    </view>

    <view class="form-section">
      <view class="form-item" @click="chooseLocation">
        <text class="form-label">活动地点</text>
        <view class="picker-value">
          <text :class="['picker-text', { placeholder: !location }]">{{ location || '请选择活动地点' }}</text>
          <wd-icon name="arrow-right" size="28rpx" color="#999" />
        </view>
      </view>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">签到半径(米)</text>
        <wd-input v-model="checkinRadius" type="number" placeholder="签到范围（米）" />
      </view>
      <view class="form-item">
        <text class="form-label">人数上限</text>
        <wd-input v-model="maxParticipants" type="number" placeholder="最大参与人数" />
      </view>
      <view class="form-item">
        <text class="form-label">奖励积分</text>
        <wd-input v-model="rewardPoints" type="number" placeholder="活动奖励积分" />
      </view>
    </view>

    <view class="submit-area">
      <wd-button
        type="primary"
        block
        :loading="submitting"
        custom-style="height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        @click="handleSubmit"
      >
        创建活动
      </wd-button>
    </view>

    <wd-picker
      v-model="category"
      :columns="categoryColumns"
      :visible="categoryPickerVisible"
      @confirm="onCategoryConfirm"
      @close="categoryPickerVisible = false"
    />

    <wd-datetime-picker
      v-model="currentDatetime"
      :visible="startTimePickerVisible"
      type="datetime"
      @confirm="onStartTimeConfirm"
      @close="startTimePickerVisible = false"
    />

    <wd-datetime-picker
      v-model="currentDatetime"
      :visible="endTimePickerVisible"
      type="datetime"
      @confirm="onEndTimeConfirm"
      @close="endTimePickerVisible = false"
    />
  </view>
</template>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16rpx 24rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 0 32rpx;
  margin-bottom: 16rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &.vertical {
    flex-direction: column;
    align-items: flex-start;
  }
}

.form-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  width: 180rpx;
  flex-shrink: 0;

  .vertical & {
    width: auto;
    margin-bottom: 16rpx;
  }
}

.picker-value {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-text {
  font-size: 28rpx;
  color: #333;

  &.placeholder {
    color: #ccc;
  }
}

.cover-upload {
  width: 100%;
}

.cover-preview {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
}

.cover-placeholder {
  width: 100%;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cover-tip {
  font-size: 24rpx;
  color: #ccc;
  margin-top: 8rpx;
}

.submit-area {
  margin-top: 40rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
