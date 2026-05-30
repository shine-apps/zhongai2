<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { get, del } from '@/utils/request'

interface MyPost {
  id: string
  type: string
  title: string
  content: string
  status: string
  viewCount: number
  favoriteCount: number
  reviewNote: string | null
  createdAt: string
}

const typeTextMap: Record<string, string> = {
  job: '招聘',
  resume: '求职',
  idle: '闲置',
}

const statusMap: Record<string, { label: string; type: string }> = {
  pending: { label: '待审核', type: 'warning' },
  approved: { label: '已发布', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' },
}

const tabs = [
  { name: '全部', value: '' },
  { name: '待审核', value: 'pending' },
  { name: '已发布', value: 'approved' },
  { name: '已拒绝', value: 'rejected' },
]

const currentTab = ref(0)
const posts = ref<MyPost[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 20
const total = ref(0)

const currentStatus = computed(() => tabs[currentTab.value].value)
const hasMore = computed(() => posts.value.length < total.value)

async function fetchPosts(reset = false) {
  if (reset) {
    page.value = 1
    posts.value = []
  }
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: page.value, pageSize }
    if (currentStatus.value) params.status = currentStatus.value

    const data = await get<{ list: MyPost[]; pagination: { total: number } }>('/api/market/posts/my', params)
    if (reset) {
      posts.value = data.list
    } else {
      posts.value = [...posts.value, ...data.list]
    }
    total.value = data.pagination.total
  } catch {
    if (reset) posts.value = []
  } finally {
    loading.value = false
  }
}

function onTabChange({ index }: { index: number }) {
  currentTab.value = index
  fetchPosts(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchPosts()
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/market/detail?id=${id}` })
}

async function deletePost(id: string) {
  const res = await uni.showModal({ title: '确认删除', content: '确定要删除这条帖子吗？' })
  if (!res[1].confirm) return
  try {
    await del(`/api/market/posts/${id}`)
    uni.showToast({ title: '删除成功', icon: 'success' })
    fetchPosts(true)
  } catch {
    // error handled
  }
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onShow(() => {
  fetchPosts(true)
})

onPullDownRefresh(async () => {
  await fetchPosts(true)
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="my-posts-page">
    <wd-tabs v-model="currentTab" @change="onTabChange">
      <wd-tab v-for="tab in tabs" :key="tab.value" :name="tab.name" :title="tab.name" />
    </wd-tabs>

    <scroll-view
      class="post-list"
      scroll-y
      @scrolltolower="loadMore"
      style="height: calc(100vh - 120rpx)"
    >
      <view class="post-card" v-for="post in posts" :key="post.id">
        <view class="post-header" @click="goDetail(post.id)">
          <text class="post-type">{{ typeTextMap[post.type] || post.type }}</text>
          <wd-tag :type="(statusMap[post.status]?.type || 'info') as any" size="small" plain>
            {{ statusMap[post.status]?.label || post.status }}
          </wd-tag>
        </view>
        <view class="post-body" @click="goDetail(post.id)">
          <text class="post-title">{{ post.title }}</text>
          <text class="post-time">{{ formatTime(post.createdAt) }}</text>
          <view v-if="post.status === 'rejected' && post.reviewNote" class="reject-note">
            审核备注: {{ post.reviewNote }}
          </view>
        </view>
        <view class="post-actions">
          <view class="action-item" @click="goDetail(post.id)">
            <wd-icon name="view" size="28rpx" /> {{ post.viewCount }}
          </view>
          <view class="action-item" @click="goDetail(post.id)">
            <wd-icon name="star" size="28rpx" /> {{ post.favoriteCount }}
          </view>
          <view class="action-item delete" @click="deletePost(post.id)">
            <wd-icon name="delete" size="28rpx" /> 删除
          </view>
        </view>
      </view>

      <wd-status-tip v-if="!loading && !posts.length" image="content" tip="暂无帖子" />
      <wd-loadmore v-if="posts.length" :state="hasMore ? 'loading' : 'finished'" />
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.my-posts-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.post-list {
  padding: 16rpx 24rpx;
}

.post-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.post-type {
  font-size: 24rpx;
  color: #e54d42;
  font-weight: 500;
}

.post-body {
  margin-bottom: 16rpx;
}

.post-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.reject-note {
  font-size: 24rpx;
  color: #e54d42;
  margin-top: 8rpx;
  padding: 12rpx;
  background: #fff5f5;
  border-radius: 8rpx;
}

.post-actions {
  display: flex;
  gap: 32rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 16rpx;
}

.action-item {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.action-item.delete {
  color: #e54d42;
  margin-left: auto;
}
</style>
