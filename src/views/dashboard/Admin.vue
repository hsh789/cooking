<template>
  <div class="admin-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">子管理员账号管理</h1>
      <p class="page-desc">管理系统子管理员账号，分配片区权限，监控账号运行状态。</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-value">{{ adminList.length }}</div>
        <div class="stat-label">本片区管理员</div>
        <div class="stat-change">↗ 本月 +2</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ adminList.length }}</div>
        <div class="stat-label">管理片区</div>
        <div class="stat-sub-label">全部覆盖</div>
      </div>
    </div>
    
    <!-- 操作栏 -->
    <div class="action-section">
      <el-button type="primary" @click="handleAddAdmin" class="add-button">
        <el-icon><Plus /></el-icon>
        新增子管理员
      </el-button>
      <el-button type="success" @click="handleAddDistrict" class="add-button">
        <el-icon><Plus /></el-icon>
        添加区域
      </el-button>
    </div>
    
    <!-- 子管理员列表 -->
    <div class="admin-list">
      <div
        v-for="admin in filteredAdminList"
        :key="admin.id"
        class="admin-card"
      >
        <div class="admin-card-header">
          <div class="admin-avatar">{{ getInitials(admin.realName) }}</div>
          <div class="admin-info">
            <div class="admin-name">{{ admin.realName }}</div>
            <div class="admin-username">{{ admin.username }}</div>
          </div>
          <el-tag size="small" type="success">正常</el-tag>
        </div>
        <div class="admin-card-body">
          <div class="admin-detail">
            <span class="detail-label">手机号：</span>
            <span class="detail-value">{{ admin.phone }}</span>
          </div>
          <div class="admin-detail">
            <span class="detail-label">负责片区：</span>
            <el-tag size="small" effect="plain">{{ admin.district }}</el-tag>
          </div>
          <div class="admin-detail">
            <span class="detail-label">创建时间：</span>
            <span class="detail-value">{{ admin.createdAt }}</span>
          </div>
        </div>
        <div class="admin-card-footer">
          <div class="admin-actions">
            <el-button type="text" @click="handleEditAdmin(admin)">编辑</el-button>
            <el-button type="text" @click="handleDeleteAdmin(admin)" style="color: #F56C6C;">删除</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑子管理员弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle === '添加子管理员' ? '新增管理员账号' : '编辑管理员账号'"
      width="500px"
      :before-close="handleClose"
    >
      <div class="dialog-content">
        <p class="dialog-desc">配置账号基础资料和权限。</p>
        <el-form :model="form" label-width="80px" class="admin-form">
          <el-form-item label="姓名" prop="realName" required>
            <el-input v-model="form.realName" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone" required>
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="负责片区" prop="district" required>
            <el-select v-model="form.district" placeholder="请选择负责片区" style="width: 100%;">
              <el-option
                v-for="(label, key) in districtList"
                :key="key"
                :label="label"
                :value="label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="初始密码" prop="password" v-if="!form.id">
            <el-input v-model="form.password" type="password" placeholder="请输入初始密码" show-password />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">{{ form.id ? '保存修改' : '保存账号' }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新建区域弹窗 -->
    <el-dialog
      v-model="districtDialogVisible"
      title="新建区域"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="districtForm" label-width="80px">
        <el-form-item label="区域名称" required>
          <el-input v-model="districtForm.name" placeholder="请输入区域名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="districtDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDistrict">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, UserFilled, Edit, Delete } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 权限检查
onMounted(() => {
  if (userInfo.value.role !== 'admin') {
    ElMessage.warning('权限不足，无法访问此页面')
    router.push('/dashboard/map')
  }
})

// 子管理员列表
const adminList = ref([
  {
    id: 1,
    username: 'admin1',
    realName: '张三',
    phone: '13800138001',
    district: '开发区',
    createdAt: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    username: 'admin2',
    realName: '李四',
    phone: '13800138002',
    district: '城关镇',
    createdAt: '2024-01-16 14:30:00'
  }
])

// 管理员列表（直接使用原始列表，不需要筛选）
const filteredAdminList = computed(() => {
  return adminList.value
})

// 弹窗状态
const dialogVisible = ref(false)
const dialogTitle = ref('添加子管理员')

// 表单数据
const form = ref({
  id: '',
  username: '',
  realName: '',
  phone: '',
  district: '',
  password: ''
})

// 负责片区列表
const districtList = ref({
  development: '开发区',
  town: '城关镇',
  industry: '工业园区'
})

// 负责片区复选框选项
const districtOptions = ref({
  development: false,
  town: false,
  industry: false
})

// 新建区域弹窗
const districtDialogVisible = ref(false)
const districtForm = ref({
  name: ''
})

// 生成姓名首字母
const getInitials = (name) => {
  if (!name) return 'U'
  return name.substring(0, 2).toUpperCase()
}

// 初始化
onMounted(() => {
  // 这里可以添加获取子管理员列表的API调用
})

// 打开添加子管理员弹窗
const handleAddAdmin = () => {
  dialogTitle.value = '添加子管理员'
  form.value = {
    id: '',
    username: '',
    realName: '',
    phone: '',
    district: '',
    password: ''
  }
  dialogVisible.value = true
}

// 打开新建区域弹窗
const handleAddDistrict = () => {
  districtForm.value = {
    name: ''
  }
  districtDialogVisible.value = true
}

// 保存新建区域
const handleSaveDistrict = () => {
  if (!districtForm.value.name) {
    ElMessage.warning('请填写区域名称')
    return
  }

  // 添加新区域到districtList
  const code = 'district_' + Date.now()
  districtList.value[code] = districtForm.value.name
  districtOptions.value[code] = false

  ElMessage.success('区域添加成功')
  districtDialogVisible.value = false
}

// 打开编辑子管理员弹窗
const handleEditAdmin = (row) => {
  dialogTitle.value = '编辑子管理员'
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除子管理员
const handleDeleteAdmin = (row) => {
  ElMessageBox.confirm(
    `确定要删除子管理员 ${row.realName} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加删除子管理员的API调用
    const index = adminList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      adminList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = () => {
  // 这里可以添加表单验证
  if (!form.value.realName || !form.value.phone || !form.value.district) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (form.value.id) {
    // 编辑子管理员
    // 这里可以添加编辑子管理员的API调用
    const index = adminList.value.findIndex(item => item.id === form.value.id)
    if (index !== -1) {
      adminList.value[index] = { ...form.value }
    }
    ElMessage.success('编辑成功')
  } else {
    // 添加子管理员
    // 这里可以添加添加子管理员的API调用
    const newAdmin = {
      id: adminList.value.length + 1,
      username: form.value.realName.toLowerCase().replace(/\s/g, ''),
      ...form.value,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    adminList.value.push(newAdmin)
    ElMessage.success('添加成功')
  }
  
  dialogVisible.value = false
}
</script>

<style scoped>
.admin-container {
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
  margin-bottom: 4px;
}

.stat-sub-label {
  font-size: 12px;
  color: #909399;
}

.stat-change {
  font-size: 12px;
  color: #67C23A;
}

/* 操作栏 */
.action-section {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.add-button {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #409EFF;
  color: #fff;
  border: none;
}

.add-button:hover {
  background: #66B1FF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 管理员列表 */
.admin-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.admin-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.admin-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.admin-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.admin-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #409EFF;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  margin-right: 16px;
}

.admin-info {
  flex: 1;
}

.admin-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.admin-username {
  font-size: 12px;
  color: #909399;
}

.admin-card-body {
  margin-bottom: 16px;
}

.admin-detail {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-label {
  font-size: 14px;
  color: #909399;
  min-width: 80px;
}

.detail-value {
  font-size: 14px;
  color: #606266;
}

.admin-card-footer {
  border-top: 1px solid #f0f2f5;
  padding-top: 16px;
}

.admin-actions {
  display: flex;
  gap: 16px;
}

/* 表单样式 */
.admin-form {
  padding: 10px 0;
}

.district-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.district-checkbox-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 弹窗样式 */
:deep(.el-dialog__header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px 20px 15px;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #f0f0f0;
  padding: 15px 20px 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 弹窗内容样式 */
.dialog-content {
  width: 100%;
}

.dialog-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
  margin-top: 0;
}

/* 复选框组样式 */
.district-checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.district-checkbox-group :deep(.el-checkbox) {
  margin-right: 0;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .admin-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .stats-section {
    flex-direction: column;
  }
  
  .search-action-section {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .filter-info {
    margin-left: 0;
    text-align: center;
  }
  
  .admin-list {
    grid-template-columns: 1fr;
  }
}
</style>