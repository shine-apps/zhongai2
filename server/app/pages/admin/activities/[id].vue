<template>
  <div class="activity-detail">
    <el-page-header @back="navigateTo('/admin/activities')" title="返回活动列表" content="活动详情" />

    <el-card v-loading="loading" shadow="hover" class="detail-card">
      <template v-if="activity">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动标题" :span="2">{{ activity.title }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ categoryMap[activity.category] || activity.category }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTypeMap[activity.status]">{{ statusMap[activity.status] || activity.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDate(activity.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDate(activity.endTime) }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ activity.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="参与人数">{{ activity.currentParticipants || 0 }} / {{ activity.maxParticipants || '-' }}</el-descriptions-item>
          <el-descriptions-item label="奖励积分">{{ activity.rewardPoints }}</el-descriptions-item>
          <el-descriptions-item label="签到半径">{{ activity.checkinRadius || 200 }}米</el-descriptions-item>
          <el-descriptions-item label="组织者">{{ activity.organizerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ activity.publishedAt ? formatDate(activity.publishedAt) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(activity.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(activity.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="封面图片" :span="2">
            <el-image
              v-if="activity.coverImage"
              :src="activity.coverImage"
              style="max-width: 300px; max-height: 200px"
              fit="cover"
            />
            <span v-else>无</span>
          </el-descriptions-item>
          <el-descriptions-item label="活动描述" :span="2">
            {{ activity.description || '无描述' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="actions" style="margin-top: 20px">
          <el-button
            v-if="activity.status === 'draft'"
            type="success"
            @click="handlePublish"
          >
            发布活动
          </el-button>
          <el-button
            v-if="activity.status === 'published' || activity.status === 'ongoing'"
            type="danger"
            @click="handleCancel"
          >
            取消活动
          </el-button>
          <el-button
            v-if="activity.status === 'draft'"
            type="danger"
            plain
            @click="handleDelete"
          >
            删除活动
          </el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { fetchWithAuth } = useAdminAuth()

const categoryMap: Record<string, string> = {
  environment: '环保',
  elderly: '助老',
  education: '助学',
  community: '社区',
  medical: '医疗',
  health: '健康',
  poverty: '扶贫',
  other: '其他',
}

const statusMap: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  ongoing: '进行中',
  completed: '已完成',
  cancelled: '已取消',
}

const statusTypeMap: Record<string, string> = {
  draft: 'info',
  published: 'success',
  ongoing: 'warning',
  completed: 'primary',
  cancelled: 'danger',
}

const loading = ref(false)
const activity = ref<any>(null)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadActivity = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res: any = await fetchWithAuth(`/api/activities/${id}`)
    activity.value = res.data
  } catch {
    ElMessage.error('加载活动详情失败')
  } finally {
    loading.value = false
  }
}

const handlePublish = async () => {
  try {
    await fetchWithAuth(`/api/activities/${activity.value.id}/publish`, {
      method: 'POST',
    })
    ElMessage.success('发布成功')
    loadActivity()
  } catch {
    ElMessage.error('发布失败')
  }
}

const handleCancel = async () => {
  try {
    await fetchWithAuth(`/api/activities/${activity.value.id}/cancel`, {
      method: 'POST',
    })
    ElMessage.success('取消成功')
    loadActivity()
  } catch {
    ElMessage.error('取消失败')
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该活动吗？此操作不可恢复。', '确认删除', {
      type: 'warning',
    })
    await fetchWithAuth(`/api/activities/${activity.value.id}`, {
      method: 'DELETE',
    })
    ElMessage.success('删除成功')
    navigateTo('/admin/activities')
  } catch {
    // cancelled by user or error
  }
}

onMounted(() => {
  loadActivity()
})
</script>

<style scoped>
.activity-detail {
  padding: 0;
}

.detail-card {
  margin-top: 20px;
}
</style>
