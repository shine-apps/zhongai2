<template>
  <div class="donations-page">
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
            {{ row.donorName || row.donor?.nickname || '-' }}
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
            <span v-else>{{ row.goodsDescription || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="凭证" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.proofImage"
              :src="row.proofImage"
              :preview-src-list="[row.proofImage]"
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
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              link
              @click="openAuditDialog(row)"
            >
              审核
            </el-button>
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

    <el-dialog v-model="auditDialogVisible" title="审核捐助" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.result">
            <el-radio value="approved">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="auditSubmitting" @click="handleAudit">确认</el-button>
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
const auditDialogVisible = ref(false)
const auditSubmitting = ref(false)
const currentDonation = ref<any>(null)

const searchForm = reactive({
  status: '',
  donationType: '',
  dateRange: null as [string, string] | null,
})

const auditForm = reactive({
  result: 'approved',
  reason: '',
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
    donations.value = res.data || res.items || []
    pagination.total = res.total || 0
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

const openAuditDialog = (row: any) => {
  currentDonation.value = row
  auditForm.result = 'approved'
  auditForm.reason = ''
  auditDialogVisible.value = true
}

const handleAudit = async () => {
  if (!currentDonation.value) return
  auditSubmitting.value = true
  try {
    await fetchWithAuth(`/api/donations/${currentDonation.value.id}/audit`, {
      method: 'PUT',
      body: {
        status: auditForm.result,
        reason: auditForm.reason,
      },
    })
    ElMessage.success('审核成功')
    auditDialogVisible.value = false
    loadDonations()
  } catch {
    ElMessage.error('审核失败')
  } finally {
    auditSubmitting.value = false
  }
}

onMounted(() => {
  loadDonations()
})
</script>

<style scoped>
.donations-page {
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
