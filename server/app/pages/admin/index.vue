<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="总用户数" :value="stats.totalUsers">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="活动数量" :value="stats.totalActivities">
            <template #prefix>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="待审核捐助" :value="stats.pendingDonations">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="本月积分发放" :value="stats.monthlyPointsIssued">
            <template #prefix>
              <el-icon><Coin /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="action-card">
      <template #header>
        <span>快捷操作</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-button type="primary" size="large" class="action-btn" @click="navigateTo('/admin/activities/create')">
            <el-icon><Plus /></el-icon>
            创建活动
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="warning" size="large" class="action-btn" @click="navigateTo('/admin/donations')">
            <el-icon><Document /></el-icon>
            审核捐助
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="success" size="large" class="action-btn" @click="navigateTo('/admin/points')">
            <el-icon><Coin /></el-icon>
            积分调整
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User, Calendar, Document, Coin, Plus } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { fetchWithAuth } = useAdminAuth()

const stats = reactive({
  totalUsers: 0,
  totalActivities: 0,
  pendingDonations: 0,
  monthlyPointsIssued: 0,
})

const loadStats = async () => {
  try {
    const res: any = await fetchWithAuth('/api/admin/stats')
    Object.assign(stats, res.data || res)
  } catch {}
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.action-card {
  margin-top: 20px;
}

.action-btn {
  width: 100%;
}
</style>
