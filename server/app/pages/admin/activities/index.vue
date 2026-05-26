<template>
  <div class="activities-page">
    <el-card shadow="hover">
      <div class="card-header">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="活动标题" clearable />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="searchForm.category" placeholder="全部" clearable>
              <el-option label="环保" value="环保" />
              <el-option label="助老" value="助老" />
              <el-option label="助学" value="助学" />
              <el-option label="社区" value="社区" />
              <el-option label="医疗" value="医疗" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable>
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="进行中" value="ongoing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="navigateTo('/admin/activities/create')">
          <el-icon><Plus /></el-icon>
          创建活动
        </el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="activities" v-loading="loading" stripe>
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              style="width: 60px; height: 60px"
              fit="cover"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="120" />
        <el-table-column label="人数" width="100">
          <template #default="{ row }">
            {{ row.currentParticipants || 0 }}/{{ row.maxParticipants || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rewardPoints" label="积分" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'draft'"
              type="success"
              link
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
              v-if="row.status === 'published' || row.status === 'ongoing'"
              type="danger"
              link
              @click="handleCancel(row)"
            >
              取消
            </el-button>
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
          @size-change="loadActivities"
          @current-change="loadActivities"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { fetchWithAuth } = useAdminAuth()

const statusMap: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  ongoing: '进行中',
  completed: '已完成',
  cancelled: '已取消',
}

const statusTypeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  draft: 'info',
  published: 'success',
  ongoing: 'warning',
  completed: 'primary',
  cancelled: 'danger',
}

const loading = ref(false)
const activities = ref<any[]>([])

const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
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

const loadActivities = async () => {
  loading.value = true
  try {
    const res: any = await fetchWithAuth('/api/activities', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        category: searchForm.category || undefined,
        status: searchForm.status || undefined,
      },
    })
    activities.value = res.data || res.items || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载活动列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadActivities()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.status = ''
  pagination.page = 1
  loadActivities()
}

const handleView = (row: any) => {
  navigateTo(`/admin/activities/${row.id}`)
}

const handlePublish = async (row: any) => {
  try {
    await fetchWithAuth(`/api/activities/${row.id}/publish`, {
      method: 'PUT',
    })
    ElMessage.success('发布成功')
    loadActivities()
  } catch {
    ElMessage.error('发布失败')
  }
}

const handleCancel = async (row: any) => {
  try {
    await fetchWithAuth(`/api/activities/${row.id}/cancel`, {
      method: 'PUT',
    })
    ElMessage.success('取消成功')
    loadActivities()
  } catch {
    ElMessage.error('取消失败')
  }
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.activities-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
</style>
