<template>
  <div class="points-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="积分规则" name="rules">
        <el-card shadow="hover">
          <div class="tab-header">
            <el-button type="primary" @click="openRuleDialog()">
              <el-icon><Plus /></el-icon>
              添加规则
            </el-button>
          </div>
          <el-table :data="rules" v-loading="rulesLoading" stripe>
            <el-table-column prop="name" label="规则名称" />
            <el-table-column prop="pointType" label="积分类型" width="120">
              <template #default="{ row }">
                {{ row.pointType === 'activity' ? '活动积分' : '捐助积分' }}
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="积分值" width="100" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openRuleDialog(row)">编辑</el-button>
                <el-button type="danger" link @click="handleDeleteRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="积分调整" name="adjust">
        <el-card shadow="hover">
          <el-form
            ref="adjustFormRef"
            :model="adjustForm"
            :rules="adjustRules"
            label-width="100px"
            style="max-width: 500px"
          >
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="adjustForm.userId" placeholder="请输入用户ID" />
            </el-form-item>
            <el-form-item label="积分类型" prop="pointType">
              <el-select v-model="adjustForm.pointType" placeholder="请选择积分类型">
                <el-option label="活动积分" value="activity" />
                <el-option label="捐助积分" value="donation" />
              </el-select>
            </el-form-item>
            <el-form-item label="调整数量" prop="amount">
              <el-input-number v-model="adjustForm.amount" style="width: 100%" />
            </el-form-item>
            <el-form-item label="调整说明" prop="description">
              <el-input
                v-model="adjustForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入调整说明"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="adjustSubmitting" @click="handleAdjust">提交</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="ruleDialogVisible" :title="isEditingRule ? '编辑规则' : '添加规则'" width="500px">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleFormRules"
        label-width="100px"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="积分类型" prop="pointType">
          <el-select v-model="ruleForm.pointType" placeholder="请选择积分类型">
            <el-option label="活动积分" value="activity" />
            <el-option label="捐助积分" value="donation" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分值" prop="amount">
          <el-input-number v-model="ruleForm.amount" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="ruleForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="ruleSubmitting" @click="handleSaveRule">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { fetchWithAuth } = useAdminAuth()

const activeTab = ref('rules')

const rulesLoading = ref(false)
const rules = ref<any[]>([])

const ruleDialogVisible = ref(false)
const ruleSubmitting = ref(false)
const isEditingRule = ref(false)
const editingRuleId = ref<string | null>(null)
const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive({
  name: '',
  pointType: 'activity',
  amount: 0,
  description: '',
})

const ruleFormRules: FormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  pointType: [{ required: true, message: '请选择积分类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入积分值', trigger: 'blur' }],
}

const adjustFormRef = ref<FormInstance>()
const adjustSubmitting = ref(false)

const adjustForm = reactive({
  userId: '',
  pointType: 'activity',
  amount: 0,
  description: '',
})

const adjustRules: FormRules = {
  userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  pointType: [{ required: true, message: '请选择积分类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入调整数量', trigger: 'blur' }],
  description: [{ required: true, message: '请输入调整说明', trigger: 'blur' }],
}

const loadRules = async () => {
  rulesLoading.value = true
  try {
    const res: any = await fetchWithAuth('/api/points/rules')
    rules.value = res.data || res.items || res || []
  } catch {
    ElMessage.error('加载积分规则失败')
  } finally {
    rulesLoading.value = false
  }
}

const openRuleDialog = (row?: any) => {
  if (row) {
    isEditingRule.value = true
    editingRuleId.value = row.id
    ruleForm.name = row.name
    ruleForm.pointType = row.pointType
    ruleForm.amount = row.amount
    ruleForm.description = row.description || ''
  } else {
    isEditingRule.value = false
    editingRuleId.value = null
    ruleForm.name = ''
    ruleForm.pointType = 'activity'
    ruleForm.amount = 0
    ruleForm.description = ''
  }
  ruleDialogVisible.value = true
}

const handleSaveRule = async () => {
  const valid = await ruleFormRef.value?.validate().catch(() => false)
  if (!valid) return

  ruleSubmitting.value = true
  try {
    if (isEditingRule.value && editingRuleId.value) {
      await fetchWithAuth(`/api/points/rules/${editingRuleId.value}`, {
        method: 'PUT',
        body: ruleForm,
      })
    } else {
      await fetchWithAuth('/api/points/rules', {
        method: 'POST',
        body: ruleForm,
      })
    }
    ElMessage.success(isEditingRule.value ? '更新规则成功' : '添加规则成功')
    ruleDialogVisible.value = false
    loadRules()
  } catch {
    ElMessage.error('保存规则失败')
  } finally {
    ruleSubmitting.value = false
  }
}

const handleDeleteRule = async (row: any) => {
  try {
    await fetchWithAuth(`/api/points/rules/${row.id}`, {
      method: 'DELETE',
    })
    ElMessage.success('删除规则成功')
    loadRules()
  } catch {
    ElMessage.error('删除规则失败')
  }
}

const handleAdjust = async () => {
  const valid = await adjustFormRef.value?.validate().catch(() => false)
  if (!valid) return

  adjustSubmitting.value = true
  try {
    await fetchWithAuth('/api/points/adjust', {
      method: 'POST',
      body: adjustForm,
    })
    ElMessage.success('积分调整成功')
    adjustForm.userId = ''
    adjustForm.pointType = 'activity'
    adjustForm.amount = 0
    adjustForm.description = ''
  } catch {
    ElMessage.error('积分调整失败')
  } finally {
    adjustSubmitting.value = false
  }
}

onMounted(() => {
  loadRules()
})
</script>

<style scoped>
.points-page {
  padding: 0;
}

.tab-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>
