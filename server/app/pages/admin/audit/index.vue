<template>
  <div class="audit-page">
    <el-card shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="捐助类型">
          <el-select v-model="searchForm.donationType" placeholder="全部" clearable>
            <el-option label="资金" value="money" />
            <el-option label="物资" value="goods" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="donations" v-loading="loading" stripe>
        <el-table-column label="捐助人" min-width="120">
          <template #default="{ row }">
            {{ row.donorNickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            {{ row.donationType === 'money' ? '资金' : '物资' }}
          </template>
        </el-table-column>
        <el-table-column label="金额/物资" min-width="120">
          <template #default="{ row }">
            <span v-if="row.donationType === 'money'">¥{{ row.amount }}</span>
            <span v-else>{{ row.materialDesc || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="凭证" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.evidenceImages && row.evidenceImages.length > 0"
              :src="row.evidenceImages[0]"
              :preview-src-list="row.evidenceImages"
              style="width: 50px; height: 50px"
              fit="cover"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button type="success" link @click="handleApprove(row)">通过</el-button>
              <el-button type="danger" link @click="openRejectDialog(row)">拒绝</el-button>
            </template>
            <span v-else>-</span>
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
          @size-change="loadDonations"
          @current-change="loadDonations"
        />
      </div>
    </el-card>

    <!-- Approve dialog -->
    <el-dialog v-model="approveDialogVisible" title="审核通过" width="500px">
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="赠送积分">
          <el-input-number v-model="approveForm.pointsToGrant" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="approveForm.reviewRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="auditSubmitting" @click="submitApprove">确认通过</el-button>
      </template>
    </el-dialog>

    <!-- Reject dialog -->
    <el-dialog v-model="rejectDialogVisible" title="审核拒绝" width="500px">
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="拒绝原因">
          <el-input
            v-model="rejectForm.reviewRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因（必填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="auditSubmitting" @click="submitReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { fetchWithAuth } = useAdminAuth()

const statusMap: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
}

const statusTypeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const loading = ref(false)
const donations = ref<any[]>([])
const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const auditSubmitting = ref(false)
const currentDonation = ref<any>(null)

const searchForm = reactive({
  status: '',
  donationType: '',
  dateRange: null as [string, string] | null,
})

const approveForm = reactive({
  pointsToGrant: 0,
  reviewRemark: '',
})

const rejectForm = reactive({
  reviewRemark: '',
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

const loadDonations = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status || undefined,
      donationType: searchForm.donationType || undefined,
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    const res: any = await fetchWithAuth('/api/donations', { params })
    donations.value = res.data?.list || []
    pagination.total = res.data?.pagination?.total || 0
  } catch {
    ElMessage.error('加载捐助列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadDonations()
}

const handleReset = () => {
  searchForm.status = ''
  searchForm.donationType = ''
  searchForm.dateRange = null
  pagination.page = 1
  loadDonations()
}

const handleApprove = (row: any) => {
  currentDonation.value = row
  approveForm.pointsToGrant = 0
  approveForm.reviewRemark = ''
  approveDialogVisible.value = true
}

const submitApprove = async () => {
  if (!currentDonation.value) return
  auditSubmitting.value = true
  try {
    await fetchWithAuth(`/api/donations/${currentDonation.value.id}/approve`, {
      method: 'PATCH',
      body: {
        pointsToGrant: approveForm.pointsToGrant,
        reviewRemark: approveForm.reviewRemark || undefined,
      },
    })
    ElMessage.success('审核通过')
    approveDialogVisible.value = false
    loadDonations()
  } catch {
    ElMessage.error('审核操作失败')
  } finally {
    auditSubmitting.value = false
  }
}

const openRejectDialog = (row: any) => {
  currentDonation.value = row
  rejectForm.reviewRemark = ''
  rejectDialogVisible.value = true
}

const submitReject = async () => {
  if (!currentDonation.value) return
  if (!rejectForm.reviewRemark.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  auditSubmitting.value = true
  try {
    await fetchWithAuth(`/api/donations/${currentDonation.value.id}/reject`, {
      method: 'PATCH',
      body: {
        reviewRemark: rejectForm.reviewRemark,
      },
    })
    ElMessage.success('已拒绝')
    rejectDialogVisible.value = false
    loadDonations()
  } catch {
    ElMessage.error('审核操作失败')
  } finally {
    auditSubmitting.value = false
  }
}

useAsyncData('audit-list', () => loadDonations(), { server: false })
</script>

<style scoped>
.audit-page {
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
</style>
