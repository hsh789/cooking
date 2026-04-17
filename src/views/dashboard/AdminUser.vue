<template>
  <div class="user-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <p class="page-desc">管理系统用户账号，分配角色和权限。</p>
    </div>
    
    <!-- 操作栏 -->
    <div class="action-section">
      <el-button type="primary" @click="handleAddUser">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
      <el-button type="success" @click="handleAddDistrict">
        <el-icon><Plus /></el-icon>
        添加区域
      </el-button>
    </div>

    <!-- 用户列表 -->
    <div class="user-table-container">
      <el-table :data="filteredAdminList" style="width: 100%" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="用户头像" width="100" align="center">
          <template #default="{ row }">
            <div class="table-avatar">{{ getInitials(row.realName) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column label="所属角色" width="150">
          <template #default="{ row }">
            <el-tag size="small" type="primary" effect="light">{{ row.roleName || '未分配' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="负责片区" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.district }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button type="text" @click="handleEditAdmin(row)">编辑</el-button>
            <el-button type="text" @click="handleDeleteAdmin(row)" style="color: #F56C6C;">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 添加/编辑用户弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle === '添加用户' ? '新增用户账号' : '编辑用户账号'"
      width="550px"
      :before-close="handleClose"
    >
      <div class="dialog-content">
        <p class="dialog-desc">配置账号基础资料和权限。</p>
        <el-form :model="form" label-width="100px" class="admin-form">
          <el-form-item label="姓名" prop="realName" required>
            <el-input v-model="form.realName" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone" required>
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="所属角色" prop="roleId" required>
            <el-select v-model="form.roleId" placeholder="请选择所属角色" style="width: 100%;" @change="handleRoleChange">
              <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              >
                <span>{{ role.name }}</span>
                <el-tag size="small" :type="role.status === 0 ? 'success' : 'danger'" style="margin-left: 8px;">
                  {{ role.status === 0 ? '正常' : '停用' }}
                </el-tag>
              </el-option>
            </el-select>
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
          <el-form-item label="角色权限">
            <div class="role-permission-preview">
              <div class="preview-title">该角色拥有的权限：</div>
              <div class="permission-tags" v-if="currentRolePermissions.length > 0">
                <el-tag v-for="perm in currentRolePermissions" :key="perm" size="small" effect="plain" class="perm-tag">
                  {{ getPermissionLabel(perm) }}
                </el-tag>
              </div>
              <div class="no-permission" v-else>请先选择角色</div>
            </div>
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
import { Plus, UserFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 权限检查
onMounted(() => {
  if (userInfo.value.adminLevel !== 'level1') {
    ElMessage.warning('权限不足，无法访问此页面')
    router.push('/dashboard/map')
  }
})

// 角色列表
const roleList = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    sort: 1,
    status: 0,
    level: 'level1',
    permissions: ['home', 'merchant', 'merchant:list', 'merchant:add', 'merchant:edit', 'merchant:delete', 'merchant:import', 'merchant-apply', 'merchant-apply:audit', 'merchant-apply:assign', 'map', 'audit', 'audit:list', 'audit:approve', 'audit:reject', 'service-provider', 'service-provider:list', 'service-provider:add', 'service-provider:edit', 'admin', 'admin:role', 'admin:user']
  },
  {
    id: 2,
    name: '乡镇街道级管理',
    code: 'LEVEL2',
    sort: 2,
    status: 0,
    level: 'level2',
    permissions: ['home', 'map', 'merchant', 'merchant:list', 'audit', 'audit:list']
  },
  {
    id: 3,
    name: '负责人管理',
    code: 'LEVEL3',
    sort: 3,
    status: 0,
    level: 'level3',
    permissions: ['home', 'map', 'merchant', 'merchant:list']
  }
])

// 管理员列表
const adminList = ref([
  {
    id: 1,
    username: 'admin1',
    realName: '张三',
    phone: '13800138001',
    district: '开发区',
    level: 'level1',
    roleId: 1,
    roleName: '超级管理员',
    permissions: ['home', 'merchant', 'merchant:list', 'merchant:add', 'merchant:edit', 'merchant:delete', 'merchant:import', 'merchant-apply', 'merchant-apply:audit', 'merchant-apply:assign', 'map', 'audit', 'audit:list', 'audit:approve', 'audit:reject', 'service-provider', 'service-provider:list', 'service-provider:add', 'service-provider:edit', 'admin', 'admin:role', 'admin:user'],
    createdAt: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    username: 'admin2',
    realName: '李四',
    phone: '13800138002',
    district: '开发区',
    level: 'level2',
    roleId: 2,
    roleName: '乡镇街道级管理',
    permissions: ['home', 'map', 'merchant', 'merchant:list', 'audit', 'audit:list'],
    createdAt: '2024-01-16 10:00:00'
  },
  {
    id: 3,
    username: 'admin3',
    realName: '王五',
    phone: '13800138003',
    district: '城关镇',
    level: 'level2',
    roleId: 2,
    roleName: '乡镇街道级管理',
    permissions: ['home', 'map', 'merchant', 'merchant:list', 'audit', 'audit:list'],
    createdAt: '2024-01-17 10:00:00'
  },
  {
    id: 4,
    username: 'admin4',
    realName: '赵六',
    phone: '13800138004',
    district: '开发区',
    level: 'level3',
    roleId: 3,
    roleName: '负责人管理',
    permissions: ['home', 'map', 'merchant', 'merchant:list'],
    createdAt: '2024-01-18 10:00:00'
  }
])

// 权限标签映射
const permissionLabelMap = {
  'home': '首页',
  'merchant': '商户管理',
  'merchant:list': '商户列表',
  'merchant:add': '新增商户',
  'merchant:edit': '编辑商户',
  'merchant:delete': '删除商户',
  'merchant:import': '批量导入',
  'merchant-apply': '商户申请审核',
  'merchant-apply:audit': '审核申请',
  'merchant-apply:assign': '分配负责人',
  'map': '监控地图',
  'audit': '审核中心',
  'audit:list': '审核列表',
  'audit:approve': '通过审核',
  'audit:reject': '拒绝审核',
  'service-provider': '清理商管理',
  'service-provider:list': '清理商列表',
  'service-provider:add': '新增清理商',
  'service-provider:edit': '编辑清理商',
  'admin': '权限管理',
  'admin:role': '角色管理',
  'admin:user': '用户管理'
}

// 获取权限标签
const getPermissionLabel = (perm) => {
  return permissionLabelMap[perm] || perm
}

// 当前角色权限
const currentRolePermissions = computed(() => {
  if (!form.value.roleId) return []
  const role = roleList.value.find(r => r.id === form.value.roleId)
  return role ? role.permissions : []
})

// 角色变更处理
const handleRoleChange = (roleId) => {
  const role = roleList.value.find(r => r.id === roleId)
  if (role) {
    form.value.level = role.level
    form.value.permissions = role.permissions
  }
}

// 片区列表
const districtList = ref({
  development: '开发区',
  town: '城关镇',
  industry: '工业园区'
})

// 统计数量
const level1Count = computed(() => adminList.value.filter(a => a.level === 'level1').length)
const level2Count = computed(() => adminList.value.filter(a => a.level === 'level2').length)
const level3Count = computed(() => adminList.value.filter(a => a.level === 'level3').length)

// 过滤后的管理员列表
const filteredAdminList = computed(() => adminList.value)

// 可用的管理级别
const availableLevels = computed(() => {
  const levels = [
    { value: 'level1', label: '区县级管理（区/县级）' },
    { value: 'level2', label: '乡镇街道级管理（街道级）' },
    { value: 'level3', label: '负责人管理（具体负责人）' }
  ]
  
  // 如果已经有level1管理员，则不显示level1选项
  const hasLevel1 = adminList.value.some(a => a.level === 'level1')
  if (hasLevel1) {
    return levels.filter(l => l.value !== 'level1')
  }
  
  return levels
})

// 是否可以创建管理员
const canCreateAdmin = computed(() => {
  const hasLevel1 = adminList.value.some(a => a.level === 'level1')
  const hasLevel2 = adminList.value.some(a => a.level === 'level2')
  
  if (!hasLevel1) {
    return true // 可以创建level1
  }
  if (!hasLevel2) {
    return true // 可以创建level2
  }
  return true // 可以创建level3
})

// 获取下一个级别的文本
const getNextLevelText = () => {
  const hasLevel1 = adminList.value.some(a => a.level === 'level1')
  const hasLevel2 = adminList.value.some(a => a.level === 'level2')
  
  if (!hasLevel1) return '一级'
  if (!hasLevel2) return '二级'
  return '三级'
}

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加管理员')
const form = ref({
  id: null,
  username: '',
  realName: '',
  phone: '',
  roleId: null,
  level: 'level3',
  district: '',
  password: '',
  permissions: []
})

// 区域弹窗相关
const districtDialogVisible = ref(false)
const districtForm = ref({
  name: ''
})

// 获取级别标签类型
const getLevelTagType = (level) => {
  const typeMap = {
    level1: 'danger',
    level2: 'warning',
    level3: 'success'
  }
  return typeMap[level] || 'info'
}

// 获取级别文本
const getLevelText = (level) => {
  const textMap = {
    level1: '一级',
    level2: '二级',
    level3: '三级'
  }
  return textMap[level] || '未知'
}

// 获取姓名首字母
const getInitials = (name) => {
  if (!name) return 'A'
  return name.substring(0, 2).toUpperCase()
}

// 新增用户
const handleAddUser = () => {
  dialogTitle.value = '添加用户'
  form.value = {
    id: null,
    username: '',
    realName: '',
    phone: '',
    roleId: null,
    level: 'level3',
    district: '',
    password: '',
    permissions: []
  }
  dialogVisible.value = true
}

// 编辑用户
const handleEditUser = (admin) => {
  dialogTitle.value = '编辑用户'
  form.value = { 
    id: admin.id,
    username: admin.username,
    realName: admin.realName,
    phone: admin.phone,
    roleId: admin.roleId,
    level: admin.level,
    district: admin.district,
    permissions: admin.permissions || []
  }
  dialogVisible.value = true
}

// 删除用户
const handleDeleteUser = (admin) => {
  ElMessageBox.confirm(
    `确定要删除管理员「${admin.realName}」吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = adminList.value.findIndex(a => a.id === admin.id)
    if (index !== -1) {
      adminList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

// 提交表单
const handleSubmit = () => {
  if (!form.value.realName || !form.value.phone || !form.value.roleId || !form.value.district) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  if (!form.value.id && !form.value.password) {
    ElMessage.warning('请输入初始密码')
    return
  }

  // 获取角色信息
  const role = roleList.value.find(r => r.id === form.value.roleId)

  if (form.value.id) {
    // 编辑
    const index = adminList.value.findIndex(a => a.id === form.value.id)
    if (index !== -1) {
      adminList.value[index] = {
        ...adminList.value[index],
        realName: form.value.realName,
        phone: form.value.phone,
        roleId: form.value.roleId,
        roleName: role ? role.name : '',
        district: form.value.district,
        permissions: form.value.permissions
      }
      ElMessage.success('修改成功')
    }
  } else {
    // 新增
    adminList.value.push({
      id: Date.now(),
      username: `user${Date.now()}`,
      realName: form.value.realName,
      phone: form.value.phone,
      roleId: form.value.roleId,
      roleName: role ? role.name : '',
      district: form.value.district,
      permissions: form.value.permissions,
      createdAt: new Date().toLocaleString('zh-CN')
    })
    ElMessage.success('新增成功')
  }

  dialogVisible.value = false
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 添加区域
const handleAddDistrict = () => {
  districtForm.value = {
    name: ''
  }
  districtDialogVisible.value = true
}

// 保存区域
const handleSaveDistrict = () => {
  if (!districtForm.value.name) {
    ElMessage.warning('请输入区域名称')
    return
  }
  
  const key = districtForm.value.name.toLowerCase().replace(/\s+/g, '')
  districtList.value[key] = districtForm.value.name
  
  ElMessage.success('区域添加成功')
  districtDialogVisible.value = false
}
</script>

<style scoped>
.user-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #409EFF;
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

.action-section {
  margin-bottom: 20px;
}

.action-section {
  margin-bottom: 20px;
}

.user-table-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.table-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4338ca;
  font-size: 14px;
  font-weight: 600;
  margin: 0 auto;
}

.dialog-content {
  padding: 10px 0;
}

.dialog-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 20px 0;
}

.permission-section {
  padding: 10px 0;
}

.permission-group {
  margin-bottom: 16px;
}

.permission-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

/* 角色权限预览样式 */
.form-hint {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.role-permission-preview {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
  min-height: 80px;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.perm-tag {
  margin: 0;
}

.no-permission {
  font-size: 13px;
  color: #909399;
  font-style: italic;
}
</style>
