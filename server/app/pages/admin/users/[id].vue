<template>
  <div class="user-detail">
    <el-page-header @back="router.push('/admin/users')" title="返回用户列表" content="用户详情" />

    <el-row :gutter="20" class="detail-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>用户信息</span>
          </template>
          <div class="info-section">
            <div class="avatar-wrap">
              <el-avatar :size="80" :src="user.avatarUrl" />
            </div>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="昵称">{{ user.nickname }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ user.phone }}</el-descriptions-item>
              <el-descriptions-item label="会员号">{{ user.memberNo }}</el-descriptions-item>
              <el-descriptions-item label="角色">
                <el-tag>{{ roleMap[user.role] || user.role }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="statusTypeMap[user.status]">{{ statusMap[user.status] || user.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="荣誉等级">{{ user.honorLevel }}</el-descriptions-item>
              <el-descriptions-item label="实名认证">
                <el-tag :type="user.realNameVerified ? 'success' : 'info'">
                  {{ user.realNameVerified ? '已认证' : '未认证' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>积分账户</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="活动积分余额">{{ user.activityPointsBalance }}</el-descriptions-item>
            <el-descriptions-item label="活动积分累计">{{ user.activityPointsTotal }}</el-descriptions-item>
            <el-descriptions-item label="捐助积分余额">{{ user.donationPointsBalance }}</el-descriptions-item>
            <el-descriptions-item label="捐助积分累计">{{ user.donationPointsTotal }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { fetchWithAuth } = useAdminAuth()
const route = useRoute()
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

const user = reactive({
  avatarUrl: '',
  nickname: '',
  phone: '',
  memberNo: '',
  role: '',
  status: '',
  honorLevel: '',
  realNameVerified: false,
  activityPointsBalance: 0,
  activityPointsTotal: 0,
  donationPointsBalance: 0,
  donationPointsTotal: 0,
})

const loadUser = async () => {
  try {
    const res: any = await fetchWithAuth(`/api/admin/users/${route.params.id}`)
    const data = res.data || res
    Object.assign(user, {
      ...data,
      activityPointsBalance: data.points?.activityPointsBalance ?? 0,
      activityPointsTotal: data.points?.activityPointsTotal ?? 0,
      donationPointsBalance: data.points?.donationPointsBalance ?? 0,
      donationPointsTotal: data.points?.donationPointsTotal ?? 0,
    })
  } catch {
    ElMessage.error('加载用户信息失败')
  }
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.user-detail {
  padding: 0;
}

.detail-row {
  margin-top: 20px;
}

.avatar-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
