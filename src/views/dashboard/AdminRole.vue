<template>
  <div class="role-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">角色管理</h1>
      <p class="page-desc">管理系统角色和权限配置，定义不同角色的功能访问权限。</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-section">
      <el-button type="primary" @click="handleAddRole">
        <el-icon><Plus /></el-icon>
        新增角色
      </el-button>
    </div>

    <!-- 角色列表 -->
    <div class="role-list">
      <el-table :data="roleList" style="width: 100%">
        <el-table-column prop="name" label="角色名称" width="200" />
        <el-table-column prop="code" label="权限字符" width="180" />
        <el-table-column prop="sort" label="显示顺序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="handleEditRole(row)">编辑</el-button>
            <el-button type="text" @click="handleDeleteRole(row)" style="color: #F56C6C;">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑角色弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      align-center
    >
      <div class="role-dialog-body">
      <el-form :model="form" label-width="100px">
        <el-form-item label="角色名称" required>
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" required>
          <el-input v-model="form.code" placeholder="请输入权限字符" :disabled="!!form.id">
            <template #append>
              <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize("@ss.hasRole('admin')")" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="角色顺序" required>
          <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" required>
          <el-radio-group v-model="form.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 菜单权限 -->
        <el-form-item label="菜单权限">
          <div class="menu-permission-section">
            <div class="permission-toolbar">
              <el-checkbox v-model="expandAll" @change="handleExpandAll">展开/折叠</el-checkbox>
              <el-checkbox v-model="checkAll" @change="handleCheckAll">全选/全不选</el-checkbox>
              <el-checkbox v-model="checkStrictly">父子联动</el-checkbox>
            </div>
            <div class="tree-container">
              <el-tree
                ref="menuTreeRef"
                :data="menuTreeData"
                show-checkbox
                node-key="id"
                :check-strictly="!checkStrictly"
                :default-expand-all="expandAll"
                :props="{ label: 'label', children: 'children' }"
                @check-change="handleTreeCheckChange"
              />
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, QuestionFilled } from '@element-plus/icons-vue'

// 菜单树数据
const menuTreeData = ref([
  {
    id: 'home',
    label: '首页',
    children: []
  },
  {
    id: 'merchant',
    label: '商户管理',
    children: [
      { id: 'merchant:list', label: '商户列表' },
      { id: 'merchant:add', label: '新增商户' },
      { id: 'merchant:edit', label: '编辑商户' },
      { id: 'merchant:delete', label: '删除商户' },
      { id: 'merchant:import', label: '批量导入' }
    ]
  },
  {
    id: 'merchant-apply',
    label: '商户申请审核',
    children: [
      { id: 'merchant-apply:audit', label: '审核申请' },
      { id: 'merchant-apply:assign', label: '分配负责人' }
    ]
  },
  {
    id: 'map',
    label: '监控地图',
    children: []
  },
  {
    id: 'audit',
    label: '审核中心',
    children: [
      { id: 'audit:list', label: '审核列表' },
      { id: 'audit:approve', label: '通过审核' },
      { id: 'audit:reject', label: '拒绝审核' }
    ]
  },
  {
    id: 'service-provider',
    label: '清理商管理',
    children: [
      { id: 'service-provider:list', label: '清理商列表' },
      { id: 'service-provider:add', label: '新增清理商' },
      { id: 'service-provider:edit', label: '编辑清理商' }
    ]
  },
  {
    id: 'admin',
    label: '权限管理',
    children: [
      { id: 'admin:role', label: '角色管理' },
      { id: 'admin:user', label: '用户管理' }
    ]
  }
])

// 角色列表
const roleList = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    sort: 1,
    status: 0,
    permissions: ['home', 'merchant', 'merchant:list', 'merchant:add', 'merchant:edit', 'merchant:delete', 'merchant:import', 'merchant-apply', 'merchant-apply:audit', 'merchant-apply:assign', 'map', 'audit', 'audit:list', 'audit:approve', 'audit:reject', 'service-provider', 'service-provider:list', 'service-provider:add', 'service-provider:edit', 'admin', 'admin:role', 'admin:user'],
    remark: '拥有所有权限',
    createdAt: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    name: '区县级管理',
    code: 'level1',
    sort: 2,
    status: 0,
    permissions: ['home', 'merchant', 'merchant:list', 'merchant:add', 'merchant:edit', 'merchant:delete', 'merchant:import', 'merchant-apply', 'merchant-apply:audit', 'merchant-apply:assign', 'map', 'audit', 'audit:list', 'audit:approve', 'audit:reject', 'service-provider', 'service-provider:list', 'service-provider:add', 'service-provider:edit', 'admin', 'admin:role', 'admin:user'],
    remark: '区/县级管理员，拥有所有权限',
    createdAt: '2024-01-16 10:00:00'
  },
  {
    id: 3,
    name: '乡镇街道级管理',
    code: 'level2',
    sort: 3,
    status: 0,
    permissions: ['home', 'merchant', 'merchant:list', 'merchant:add', 'merchant:edit', 'merchant:delete', 'merchant:import', 'merchant-apply', 'merchant-apply:audit', 'merchant-apply:assign', 'map', 'audit', 'audit:list', 'audit:approve', 'audit:reject', 'service-provider', 'service-provider:list', 'service-provider:add', 'service-provider:edit'],
    remark: '街道级管理员，拥有商户管理、审核等权限',
    createdAt: '2024-01-17 10:00:00'
  },
  {
    id: 4,
    name: '负责人管理',
    code: 'level3',
    sort: 4,
    status: 0,
    permissions: ['home', 'merchant', 'merchant:list', 'merchant:edit', 'map', 'audit', 'audit:list', 'audit:approve', 'audit:reject'],
    remark: '具体负责人，拥有查看和审核权限',
    createdAt: '2024-01-18 10:00:00'
  }
])

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加角色')
const form = ref({
  id: null,
  name: '',
  code: '',
  sort: 0,
  status: 0,
  remark: '',
  permissions: []
})

// 树形控件相关
const menuTreeRef = ref(null)
const expandAll = ref(true)
const checkAll = ref(false)
const checkStrictly = ref(true)

// 展开/折叠
const handleExpandAll = (val) => {
  const nodes = menuTreeRef.value?.store.nodesMap
  if (nodes) {
    Object.values(nodes).forEach(node => {
      node.expanded = val
    })
  }
}

// 全选/全不选
const handleCheckAll = (val) => {
  if (val) {
    // 全选 - 获取所有节点ID
    const allIds = getAllMenuIds(menuTreeData.value)
    menuTreeRef.value?.setCheckedKeys(allIds)
  } else {
    // 全不选
    menuTreeRef.value?.setCheckedKeys([])
  }
}

// 获取所有菜单ID
const getAllMenuIds = (menus) => {
  let ids = []
  menus.forEach(menu => {
    ids.push(menu.id)
    if (menu.children && menu.children.length > 0) {
      ids = ids.concat(getAllMenuIds(menu.children))
    }
  })
  return ids
}

// 树节点选中变化
const handleTreeCheckChange = () => {
  // 更新checkAll状态
  const allIds = getAllMenuIds(menuTreeData.value)
  const checkedIds = menuTreeRef.value?.getCheckedKeys() || []
  checkAll.value = checkedIds.length === allIds.length && allIds.length > 0
}

// 新增角色
const handleAddRole = () => {
  dialogTitle.value = '添加角色'
  form.value = {
    id: null,
    name: '',
    code: '',
    sort: 0,
    status: 0,
    remark: '',
    permissions: []
  }
  expandAll.value = true
  checkAll.value = false
  checkStrictly.value = true
  dialogVisible.value = true
  
  // 清空树选中
  nextTick(() => {
    menuTreeRef.value?.setCheckedKeys([])
  })
}

// 编辑角色
const handleEditRole = (row) => {
  dialogTitle.value = '编辑角色'
  form.value = { 
    id: row.id,
    name: row.name,
    code: row.code,
    sort: row.sort,
    status: row.status,
    remark: row.remark || '',
    permissions: row.permissions || []
  }
  expandAll.value = true
  checkAll.value = false
  checkStrictly.value = true
  dialogVisible.value = true
  
  // 设置树选中
  nextTick(() => {
    menuTreeRef.value?.setCheckedKeys(form.value.permissions)
  })
}

// 删除角色
const handleDeleteRole = (row) => {
  ElMessageBox.confirm(
    `确定要删除角色「${row.name}」吗？删除后该角色将无法使用。`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = roleList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      roleList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

// 提交表单
const handleSubmit = () => {
  if (!form.value.name || !form.value.code) {
    ElMessage.warning('请填写必填项')
    return
  }

  // 获取选中的菜单权限
  const checkedKeys = menuTreeRef.value?.getCheckedKeys() || []
  const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() || []
  form.value.permissions = [...checkedKeys, ...halfCheckedKeys]

  if (form.value.id) {
    // 编辑
    const index = roleList.value.findIndex(item => item.id === form.value.id)
    if (index !== -1) {
      roleList.value[index] = {
        ...roleList.value[index],
        name: form.value.name,
        sort: form.value.sort,
        status: form.value.status,
        remark: form.value.remark,
        permissions: form.value.permissions
      }
      ElMessage.success('修改成功')
    }
  } else {
    // 新增
    roleList.value.push({
      id: Date.now(),
      name: form.value.name,
      code: form.value.code,
      sort: form.value.sort,
      status: form.value.status,
      remark: form.value.remark,
      permissions: form.value.permissions,
      createdAt: new Date().toLocaleString('zh-CN')
    })
    ElMessage.success('新增成功')
  }

  dialogVisible.value = false
}
</script>

<style scoped>
.role-container {
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

.action-section {
  margin-bottom: 20px;
}

.role-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.menu-permission-section {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background: #fafafa;
}

.permission-toolbar {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.tree-container {
  max-height: 300px;
  overflow-y: auto;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
}

/* 树形控件样式优化 */
:deep(.el-tree-node__content) {
  height: 32px;
  line-height: 32px;
}

:deep(.el-tree-node__label) {
  font-size: 14px;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #409eff;
}

/* 弹窗内部滚动 */
.role-dialog-body {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}
</style>
