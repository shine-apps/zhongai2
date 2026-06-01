<template>
  <el-container class="admin-layout">
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="admin-aside">
      <div class="aside-header">
        <h2 v-if="!isCollapsed" class="aside-title">众爱联盟</h2>
        <span v-else class="aside-title-icon">众</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin">
          <el-icon><Odometer /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/activities">
          <el-icon><Calendar /></el-icon>
          <template #title>活动管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/points">
          <el-icon><Coin /></el-icon>
          <template #title>积分管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/audit">
          <el-icon><Document /></el-icon>
          <template #title>审核管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/market">
          <el-icon><ShoppingCart /></el-icon>
          <template #title>集市管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <el-icon
          class="collapse-btn"
          @click="isCollapsed = !isCollapsed"
        >
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
        <div class="header-right">
          <el-dropdown>
            <span class="admin-user">
              管理员
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Odometer,
  User,
  Calendar,
  Coin,
  Document,
  ShoppingCart,
  Fold,
  Expand,
  ArrowDown,
} from '@element-plus/icons-vue'

const { clearToken } = useAdminAuth()
const isCollapsed = ref(false)
const route = useRoute()

const activeMenu = computed(() => route.path)

const handleLogout = async () => {
  clearToken()
  await navigateTo('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.admin-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.aside-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
}

.aside-title {
  margin: 0;
  color: #fff;
  font-size: 18px;
  white-space: nowrap;
}

.aside-title-icon {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  height: 60px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.admin-main {
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
}
</style>
