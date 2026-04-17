<template>
  <div class="settings-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">片区参数设置</h2>
      <p class="page-desc">设置各片区的清洗周期和其他参数</p>
    </div>
    
    <!-- 片区设置列表 -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>片区参数设置</span>
        </div>
      </template>
      <el-table :data="filteredSettings" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="district" label="片区名称" min-width="150" />
        <el-table-column prop="cleaningCycle" label="清洗周期（天）" width="150">
          <template #default="scope">
            <el-input-number v-model="scope.row.cleaningCycle" :min="7" :max="30" size="small" @change="handleCycleChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="warningThreshold" label="预警阈值（天）" width="150">
          <template #default="scope">
            <el-input-number v-model="scope.row.warningThreshold" :min="1" :max="29" size="small" @change="handleThresholdChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleSave(scope.row)">
              保存
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 片区设置列表
const districtSettings = ref([
  {
    id: 1,
    district: '开发区',
    cleaningCycle: 15,
    warningThreshold: 13,
    updatedAt: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    district: '城关镇',
    cleaningCycle: 15,
    warningThreshold: 13,
    updatedAt: '2024-01-16 14:30:00'
  },
  {
    id: 3,
    district: '工业园区',
    cleaningCycle: 15,
    warningThreshold: 13,
    updatedAt: '2024-01-17 09:15:00'
  }
])

// 过滤后的片区设置（二级和负责人管理只能看到自己的片区）
const filteredSettings = computed(() => {
  if (userInfo.value.adminLevel === 'level1') {
    return districtSettings.value
  }
  return districtSettings.value.filter(item => item.district === userInfo.value.district)
})

// 初始化
onMounted(() => {
  // 这里可以添加获取片区设置的API调用
})

// 处理清洗周期变更
const handleCycleChange = (row) => {
  // 确保预警阈值小于清洗周期
  if (row.warningThreshold >= row.cleaningCycle) {
    row.warningThreshold = row.cleaningCycle - 1
    ElMessage.warning('预警阈值必须小于清洗周期')
  }
}

// 处理预警阈值变更
const handleThresholdChange = (row) => {
  // 确保预警阈值小于清洗周期
  if (row.warningThreshold >= row.cleaningCycle) {
    row.warningThreshold = row.cleaningCycle - 1
    ElMessage.warning('预警阈值必须小于清洗周期')
  }
}

// 保存设置
const handleSave = (row) => {
  // 这里可以添加保存设置的API调用
  row.updatedAt = new Date().toLocaleString('zh-CN')
  ElMessage.success('保存成功')
}
</script>

<style scoped>
.settings-container {
  width: 100%;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

/* 页面标题 */
.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 卡片样式 */
.settings-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .settings-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 20px;
  }
}
</style>