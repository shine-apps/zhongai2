<template>
  <div class="market-page">
    <el-card shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable>
            <el-option label="招聘" value="job" />
            <el-option label="求职" value="resume" />
            <el-option label="闲置" value="idle" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索标题/内容" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="posts" v-loading="loading" stripe>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type]" size="small">{{ typeMap[row.type] || row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="发布者" width="120">
          <template #default="{ row }">
            {{ row.authorNickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.contactInfo || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]" size="small">
              {{ statusMap[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="浏览/收藏" width="120">
          <template #default="{ row }">
            {{ row.viewCount }} / {{ row.favoriteCount }}
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">查看</el-button>
            <template v-if="row.status === 'pending'">
              <el-button type="success" link @click="handleReview(row, 'approved')">通过</el-button>
              <el-button type="danger" link @click="handleReview(row, 'rejected')">拒绝</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadPosts"
          @current-change="loadPosts"
        />
      </div>
    </el-card>

    <!-- Detail dialog -->
    <el-dialog v-model="detailVisible" title="帖子详情" width="600px">
      <div v-if="currentPost" class="detail-dialog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="类型">{{ typeMap[currentPost.type] }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTypeMap[currentPost.status]">{{ statusMap[currentPost.status] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标题" :span="2">{{ currentPost.title }}</el-descriptions-item>
          <el-descriptions-item label="发布者">{{ currentPost.authorNickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentPost.contactInfo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ currentPost.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="价格">{{ currentPost.price ? `¥${currentPost.price}` : '-' }}</el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">
            <div class="content-preview">{{ currentPost.content }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="图片" :span="2">
            <div v-if="currentPost.images && currentPost.images.length" class="image-preview">
              <el-image
                v-for="(img, idx) in currentPost.images"
                :key="idx"
                :src="img"
                :preview-src-list="currentPost.images"
                :initial-index="idx as number"
                style="width: 80px; height: 80px; margin-right: 8px"
                fit="cover"
              />
            </div>
            <span v-else>无图片</span>
          </el-descriptions-item>
          <el-descriptions-item label="浏览/收藏">{{ currentPost.viewCount }} / {{ currentPost.favoriteCount }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDate(currentPost.createdAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="currentPost.reviewNote" label="审核备注" :span="2">
            {{ currentPost.reviewNote }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- Review dialog -->
    <el-dialog v-model="reviewVisible" :title="reviewAction === 'approved' ? '审核通过' : '审核拒绝'" width="500px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="审核备注">
          <el-input
            v-model="reviewForm.reviewNote"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button
          :type="reviewAction === 'approved' ? 'success' : 'danger'"
          :loading="reviewSubmitting"
          @click="submitReview"
        >
          确认{{ reviewAction === 'approved' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { fetchWithAuth } = useAdminAuth()

const typeMap: Record<string, string> = {
  job: '招聘',
  resume: '求职',
  idle: '闲置',
}

const typeTagMap: Record<string, 'primary' | 'success' | 'warning'> = {
  job: 'primary',
  resume: 'success',
  idle: 'warning',
}

const statusMap: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
}

const statusTypeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const loading = ref(false)
const posts = ref<any[]>([])
const detailVisible = ref(false)
const reviewVisible = ref(false)
const reviewSubmitting = ref(false)
const currentPost = ref<any>(null)
const reviewAction = ref<'approved' | 'rejected'>('approved')

const searchForm = reactive({
  status: '',
  type: '',
  keyword: '',
})

const reviewForm = reactive({
  reviewNote: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadPosts = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status || undefined,
      type: searchForm.type || undefined,
      keyword: searchForm.keyword || undefined,
    }
    const res: any = await fetchWithAuth('/api/admin/market/posts', { params })
    posts.value = res.data?.list || res.data || []
    pagination.total = res.data?.pagination?.total || res.total || 0
  } catch {
    ElMessage.error('加载帖子列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadPosts()
}

const handleReset = () => {
  searchForm.status = ''
  searchForm.type = ''
  searchForm.keyword = ''
  pagination.page = 1
  loadPosts()
}

const showDetail = (row: any) => {
  currentPost.value = row
  detailVisible.value = true
}

const handleReview = (row: any, action: 'approved' | 'rejected') => {
  currentPost.value = row
  reviewAction.value = action
  reviewForm.reviewNote = ''
  reviewVisible.value = true
}

const submitReview = async () => {
  if (!currentPost.value) return
  reviewSubmitting.value = true
  try {
    await fetchWithAuth(`/api/admin/market/posts/${currentPost.value.id}/review`, {
      method: 'PATCH',
      body: {
        status: reviewAction.value,
        reviewNote: reviewForm.reviewNote || undefined,
      },
    })
    ElMessage.success(reviewAction.value === 'approved' ? '已通过' : '已拒绝')
    reviewVisible.value = false
    loadPosts()
  } catch {
    ElMessage.error('审核操作失败')
  } finally {
    reviewSubmitting.value = false
  }
}

useAsyncData('market-posts', () => loadPosts(), { server: false })
</script>

<style scoped>
.market-page {
  padding: 0;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.table-card {
  margin-top: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-dialog {
  max-height: 60vh;
  overflow-y: auto;
}

.content-preview {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
}
</style>
