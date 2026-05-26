<template>
  <div class="users-page">
    <el-card shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="昵称/手机号/会员号" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="全部" clearable>
            <el-option label="志愿者" value="volunteer" />
            <el-option label="领队" value="leader" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="正常" value="active" />
            <el-option label="冻结" value="frozen" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="memberNo" label="会员号" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            {{ roleMap[row.role] || row.role }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="honorLevel" label="荣誉等级" width="100" />
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              :type="row.status === 'frozen' ? 'success' : 'danger'"
              link
              @click="handleToggleFreeze(row)"
            >
              {{ row.status === 'frozen' ? '解冻' : '冻结' }}
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
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { fetchWithAuth } = useAdminAuth()
const router = useRouter()

const roleMap: Record<string, string> = {
  volunteer: '志愿者',
  leader: '领队',
  admin: '管理员',
}

const statusMap: Record<string, string> = {
  active: '正常',
  frozen: '冻结',
  disabled: '禁用',
}

const statusTypeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  active: 'success',
  frozen: 'danger',
  disabled: 'info',
}

const loading = ref(false)
const users = ref<any[]>([])

const searchForm = reactive({
  keyword: '',
  role: '',
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

const loadUsers = async () => {
  loading.value = true
  try {
    const res: any = await fetchWithAuth('/api/admin/users', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        role: searchForm.role || undefined,
        status: searchForm.status || undefined,
      },
    })
    users.value = res.data || res.items || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadUsers()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.role = ''
  searchForm.status = ''
  pagination.page = 1
  loadUsers()
}

const handleView = (row: any) => {
  router.push(`/admin/users/${row.id}`)
}

const handleToggleFreeze = async (row: any) => {
  const action = row.status === 'frozen' ? '解冻' : '冻结'
  try {
    await fetchWithAuth(`/api/admin/users/${row.id}/status`, {
      method: 'PUT',
      body: { status: row.status === 'frozen' ? 'active' : 'frozen' },
    })
    ElMessage.success(`${action}成功`)
    loadUsers()
  } catch {
    ElMessage.error(`${action}失败`)
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
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
