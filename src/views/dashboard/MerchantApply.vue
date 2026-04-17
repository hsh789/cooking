<template>
  <div class="merchant-apply-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">商户申请审核</h1>
      <p class="page-desc">审核商户申请信息，通过或拒绝新店铺的注册申请。</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-value">{{ pendingCount }}</div>
        <div class="stat-label">待审核</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ approvedCount }}</div>
        <div class="stat-label">已审核</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ rejectedCount }}</div>
        <div class="stat-label">已拒绝</div>
      </div>
    </div>

    <!-- 申请列表 -->
    <div class="apply-list">
      <el-table :data="pagedApplyList" style="width: 100%" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="storeName" label="店面名称" width="150" />
        <el-table-column prop="responsiblePerson" label="负责人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="location" label="所在位置" width="200" />
        <el-table-column label="门头照片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.storefrontPhoto"
              :src="row.storefrontPhoto"
              :preview-src-list="[row.storefrontPhoto]"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px;"
            />
            <span v-else>未上传</span>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120" align="center">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="text" @click="handleViewDetail(row)" size="small">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredApplyList.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 审核详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`商户申请详情 - 负责人：${currentApply?.responsiblePerson || ''}`"
      width="600px"
    >
      <div v-if="currentApply" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="店面名称">{{ currentApply.storeName }}</el-descriptions-item>
          <el-descriptions-item label="负责人姓名">{{ currentApply.responsiblePerson }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentApply.phone }}</el-descriptions-item>
          <el-descriptions-item label="所在位置">{{ currentApply.location }}</el-descriptions-item>
          <el-descriptions-item label="门头照片">
            <el-image
              v-if="currentApply.storefrontPhoto"
              :src="currentApply.storefrontPhoto"
              :preview-src-list="[currentApply.storefrontPhoto]"
              fit="cover"
              style="width: 200px; height: 200px; border-radius: 4px;"
            />
            <span v-else>未上传</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentApply.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusTagType(currentApply.status)">{{ getStatusText(currentApply.status) }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 一级/乡镇街道级管理指派区域 -->
        <div v-if="showAssignSection" class="assign-section">
          <div class="assign-header">指派操作</div>
          <div class="assign-tabs">
            <span
              class="assign-tab"
              :class="{ active: assignMode === 'direct' }"
              @click="assignMode = 'direct'"
            >直接指派</span>
            <!-- 只有区县级管理显示"下发指派"选项 -->
            <span
              v-if="userInfo.adminLevel === 'level1'"
              class="assign-tab"
              :class="{ active: assignMode === 'delegate' }"
              @click="assignMode = 'delegate'"
            >下发指派</span>
          </div>

          <!-- 直接指派：选择负责人管理 -->
          <div v-if="assignMode === 'direct'" class="assign-body">
            <div class="assign-label">选择直接负责人：</div>
            <el-select v-model="selectedLevel3Admin" placeholder="请选择负责该商户的负责人管理" style="width: 100%;" filterable>
              <el-option
                v-for="admin in level3Admins"
                :key="admin.id"
                :label="`${admin.name}（${admin.districtText}）`"
                :value="admin.id"
              >
                <span>{{ admin.name }}</span>
                <span class="admin-district-tag">{{ admin.districtText }}</span>
              </el-option>
            </el-select>
          </div>

          <!-- 下发指派：选择乡镇街道级管理（仅一级） -->
          <div v-if="assignMode === 'delegate'" class="assign-body">
            <div class="assign-label">选择乡镇街道级管理（下转后由其分配给具体负责人）：</div>
            <el-select v-model="selectedLevel2Admin" placeholder="请选择要下转的乡镇街道级管理" style="width: 100%;">
              <el-option
                v-for="admin in level2Admins"
                :key="admin.id"
                :label="admin.name"
                :value="admin.id"
              >
                <span>{{ admin.name }}</span>
                <span class="admin-district-tag">{{ admin.districtText }}</span>
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <!-- 一级/乡镇街道级管理显示指派按钮 -->
          <el-button v-if="showAssignSection" type="warning" @click="handleAssign">确认指派</el-button>
          <el-button type="danger" @click="handleReject(currentApply)" :disabled="currentApply?.status !== 'pending'">拒绝</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 商户申请列表
const applyList = ref([
  {
    id: 1,
    storeName: '美味小厨餐厅',
    responsiblePerson: '张三',
    phone: '13800138001',
    location: '开发区商业街123号',
    storefrontPhoto: 'https://via.placeholder.com/200',
    district: '开发区',
    status: 'pending',
    applyTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    storeName: '时尚服装店',
    responsiblePerson: '李四',
    phone: '13800138002',
    location: '城关镇步行街45号',
    storefrontPhoto: 'https://via.placeholder.com/200',
    district: '城关镇',
    status: 'pending',
    applyTime: '2024-01-16 14:30:00'
  },
  {
    id: 3,
    storeName: '城关镇饭店',
    responsiblePerson: '王五',
    phone: '13800138003',
    location: '工业园区路78号',
    storefrontPhoto: 'https://via.placeholder.com/200',
    district: '工业园区',
    status: 'approved',
    applyTime: '2024-01-17 09:15:00'
  },
  {
    id: 4,
    storeName: '开发区大酒店',
    responsiblePerson: '赵六',
    phone: '13800138004',
    location: '开发区中心路56号',
    storefrontPhoto: 'https://via.placeholder.com/200',
    district: '开发区',
    status: 'rejected',
    applyTime: '2024-01-18 16:20:00'
  }
])

// 统计数量
const pendingCount = computed(() => applyList.value.filter(a => a.status === 'pending').length)
const approvedCount = computed(() => applyList.value.filter(a => a.status === 'approved').length)
const rejectedCount = computed(() => applyList.value.filter(a => a.status === 'rejected').length)

// 过滤后的申请列表（根据用户级别和负责片区过滤）
const filteredApplyList = computed(() => {
  const currentUserLevel = userInfo.value.adminLevel || 'level1'
  const currentUserDistrict = userInfo.value.district || ''

  if (currentUserLevel === 'level1') {
    // 区县级管理：查看所有申请
    return applyList.value
  } else {
    // 二级和负责人管理：只能查看自己负责片区的申请
    return applyList.value.filter(a => a.district === currentUserDistrict)
  }
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(5)

// 分页后的申请列表
const pagedApplyList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredApplyList.value.slice(start, end)
})

// 当前页变化
const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 详情弹窗
const detailDialogVisible = ref(false)
const currentApply = ref(null)

// 指派功能相关
const assignMode = ref('direct') // 'direct' 直接指派 | 'delegate' 下发指派
const selectedLevel3Admin = ref('')
const selectedLevel2Admin = ref('')

// 是否显示指派区域（一级和乡镇街道级管理可见）
const showAssignSection = computed(() => {
  const level = userInfo.value.adminLevel || ''
  return level === 'level1' || level === 'level2'
})

// 乡镇街道级管理列表（模拟数据）
const level2Admins = ref([
  { id: 'l2_1', name: '张区管', district: 'development', districtText: '开发区' },
  { id: 'l2_2', name: '李区管', district: 'town', districtText: '城关镇' },
  { id: 'l2_3', name: '王区管', district: 'industry', districtText: '工业区' }
])

// 负责人管理列表（模拟数据）
const level3Admins = ref([
  { id: 'l3_1', name: '赵专员', district: 'development', districtText: '开发区' },
  { id: 'l3_2', name: '钱专员', district: 'town', districtText: '城关镇' },
  { id: 'l3_3', name: '孙专员', district: 'industry', districtText: '工业区' },
  { id: 'l3_4', name: '周专员', district: 'development', districtText: '开发区' }
])

// 确认指派操作
const handleAssign = () => {
  if (assignMode.value === 'direct') {
    if (!selectedLevel3Admin.value) {
      ElMessage.warning('请选择要指派的三级负责人')
      return
    }
    const admin = level3Admins.value.find(a => a.id === selectedLevel3Admin.value)
    ElMessage.success(`已将「${currentApply.value.storeName}」的商户申请直接指派给 ${admin.name}（${admin.districtText}）`)
  } else {
    // 下发指派仅区县级管理可操作
    if (!selectedLevel2Admin.value) {
      ElMessage.warning('请选择要下转的乡镇街道级管理')
      return
    }
    const admin = level2Admins.value.find(a => a.id === selectedLevel2Admin.value)
    ElMessage.success(`已将「${currentApply.value.storeName}」下转给 ${admin.name}，等待其分配具体负责人`)
  }

  // 更新申请状态为已指派/已下转
  const index = applyList.value.findIndex(item => item.id === currentApply.value.id)
  if (index !== -1) {
    applyList.value[index].status = assignMode.value === 'direct' ? 'assigned' : 'delegated'
  }

  detailDialogVisible.value = false
}

// 查看详情时重置指派状态
const handleViewDetail = (apply) => {
  currentApply.value = apply
  // 重置指派选项
  assignMode.value = 'direct'
  selectedLevel3Admin.value = ''
  selectedLevel2Admin.value = ''
  detailDialogVisible.value = true
}
const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    assigned: 'info',
    delegated: ''
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已审核',
    rejected: '已拒绝',
    assigned: '已指派',
    delegated: '已下转'
  }
  return textMap[status] || '未知'
}

// 通过申请
const handleApprove = (apply) => {
  ElMessageBox.confirm(
    `确定要通过商户申请 "${apply.storeName}" 吗？`,
    '审核确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    const index = applyList.value.findIndex(item => item.id === apply.id)
    if (index !== -1) {
      applyList.value[index].status = 'approved'
    }
    ElMessage.success('审核通过')
    detailDialogVisible.value = false
  }).catch(() => {
    // 取消审核
  })
}

// 拒绝申请
const handleReject = (apply) => {
  ElMessageBox.confirm(
    `确定要拒绝商户申请 "${apply.storeName}" 吗？`,
    '审核确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = applyList.value.findIndex(item => item.id === apply.id)
    if (index !== -1) {
      applyList.value[index].status = 'rejected'
    }
    ElMessage.success('已拒绝申请')
    detailDialogVisible.value = false
  }).catch(() => {
    // 取消审核
  })
}

// 初始化
onMounted(() => {
  // 这里可以添加获取商户申请列表的API调用
})
</script>

<style scoped>
.merchant-apply-container {
  width: 100%;
  padding: 20px;
  background-color: #f5f7fa;
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

/* 统计卡片 */
.stats-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #409EFF;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

/* 申请列表 */
.apply-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 详情弹窗 */
.detail-content {
  padding: 10px 0;
}

/* 弹窗底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 指派区域样式 */
.assign-section {
  margin-top: 20px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
}

.assign-header {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.assign-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  background: #e9ecf2;
  border-radius: 8px;
  overflow: hidden;
}

.assign-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.25s;
  position: relative;
  z-index: 1;
}

.assign-tab.active {
  background: #fff;
  color: #409eff;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.assign-tab:hover:not(.active) {
  color: #409eff;
}

.assign-body {
  padding-top: 4px;
}

.assign-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.admin-district-tag {
  float: right;
  font-size: 11px;
  color: #909399;
  background: #f4f4f5;
  padding: 1px 8px;
  border-radius: 10px;
}

/* 弹窗样式 */
.merchant-apply-container :deep(.el-dialog) {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0 !important;
}

.merchant-apply-container :deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
