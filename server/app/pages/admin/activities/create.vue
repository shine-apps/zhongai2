<template>
  <div class="activity-create">
    <el-page-header @back="navigateTo('/admin/activities')" title="返回活动列表" content="创建活动" />

    <el-card shadow="hover" class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 700px"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option label="环保" value="environment" />
            <el-option label="助老" value="elderly" />
            <el-option label="助学" value="education" />
            <el-option label="社区" value="community" />
            <el-option label="医疗" value="medical" />
            <el-option label="健康" value="health" />
            <el-option label="扶贫" value="poverty" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入活动描述"
          />
        </el-form-item>
        <el-form-item label="封面图片" prop="coverImage">
          <el-input v-model="form.coverImage" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input-number v-model="form.latitude" :precision="6" :step="0.001" style="width: 100%" />
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input-number v-model="form.longitude" :precision="6" :step="0.001" style="width: 100%" />
        </el-form-item>
        <el-form-item label="签到半径(米)" prop="checkinRadius">
          <el-input-number v-model="form.checkinRadius" :min="0" :step="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="最大人数" prop="maxParticipants">
          <el-input-number v-model="form.maxParticipants" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="奖励积分" prop="rewardPoints">
          <el-input-number v-model="form.rewardPoints" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
          <el-button @click="navigateTo('/admin/activities')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

definePageMeta({
  layout: 'admin',
})

const { fetchWithAuth } = useAdminAuth()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  title: '',
  category: '',
  description: '',
  coverImage: '',
  startTime: null as Date | null,
  endTime: null as Date | null,
  location: '',
  latitude: 0,
  longitude: 0,
  checkinRadius: 500,
  maxParticipants: 50,
  rewardPoints: 10,
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  maxParticipants: [{ required: true, message: '请输入最大人数', trigger: 'blur' }],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await fetchWithAuth('/api/activities', {
      method: 'POST',
      body: {
        ...form,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
      },
    })
    ElMessage.success('创建活动成功')
    navigateTo('/admin/activities')
  } catch {
    ElMessage.error('创建活动失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.activity-create {
  padding: 0;
}

.form-card {
  margin-top: 20px;
}
</style>
