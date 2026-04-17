<template>
  <div class="menu-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">菜单管理</h1>
      <p class="page-desc">管理系统菜单结构，配置菜单的显示、路由和权限。</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-section">
      <el-button type="primary" @click="handleAddMenu">
        <el-icon><Plus /></el-icon>
        新增菜单
      </el-button>
    </div>

    <!-- 菜单列表（树形表格） -->
    <div class="menu-list">
      <el-table
        :data="menuList"
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column prop="name" label="菜单名称" width="200" />
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="menuType" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" v-if="row.menuType === 'M'" type="info">目录</el-tag>
            <el-tag size="small" v-else-if="row.menuType === 'C'" type="success">菜单</el-tag>
            <el-tag size="small" v-else-if="row.menuType === 'F'" type="warning">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" width="80" align="center" />
        <el-table-column prop="perms" label="权限标识" width="180" />
        <el-table-column prop="path" label="路由地址" width="180" />
        <el-table-column prop="component" label="组件路径" width="200" />
        <el-table-column prop="visible" label="显示状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.visible === '0' ? 'success' : 'info'">
              {{ row.visible === '0' ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '0' ? 'success' : 'danger'">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="handleAddMenu(row)">新增</el-button>
            <el-button type="text" @click="handleEditMenu(row)">编辑</el-button>
            <el-button type="text" @click="handleDeleteMenu(row)" style="color: #F56C6C;">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑菜单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      align-center
    >
      <div class="menu-dialog-body">
        <el-form :model="form" label-width="100px">
          <el-form-item label="上级菜单">
            <el-tree-select
              v-model="form.parentId"
              :data="menuTreeOptions"
              :props="{ label: 'name', value: 'id', children: 'children' }"
              placeholder="选择上级菜单"
              check-strictly
              clearable
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="菜单类型" required>
            <el-radio-group v-model="form.menuType">
              <el-radio value="M">目录</el-radio>
              <el-radio value="C">菜单</el-radio>
              <el-radio value="F">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单图标" v-if="form.menuType !== 'F'">
            <el-input v-model="form.icon" placeholder="请输入图标组件名" clearable>
              <template #prepend>
                <el-icon v-if="form.icon"><component :is="form.icon" /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="菜单名称" required>
            <el-input v-model="form.name" placeholder="请输入菜单名称" />
          </el-form-item>
          <el-form-item label="排序" required>
            <el-input-number v-model="form.orderNum" :min="0" :max="999" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="路由地址" v-if="form.menuType !== 'F'">
            <el-input v-model="form.path" placeholder="请输入路由地址" />
          </el-form-item>
          <el-form-item label="组件路径" v-if="form.menuType === 'C'">
            <el-input v-model="form.component" placeholder="请输入组件路径" />
          </el-form-item>
          <el-form-item label="权限标识" v-if="form.menuType !== 'M'">
            <el-input v-model="form.perms" placeholder="请输入权限标识，如：system:user:list" />
          </el-form-item>
          <el-form-item label="显示状态" v-if="form.menuType !== 'F'">
            <el-radio-group v-model="form.visible">
              <el-radio value="0">显示</el-radio>
              <el-radio value="1">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单状态">
            <el-radio-group v-model="form.status">
              <el-radio value="0">正常</el-radio>
              <el-radio value="1">停用</el-radio>
            </el-radio-group>
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
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 菜单列表数据
const menuList = ref([
  {
    id: 1,
    parentId: 0,
    name: '首页',
    icon: 'HomeFilled',
    orderNum: 1,
    path: 'home',
    component: '',
    perms: '',
    visible: '0',
    status: '0',
    menuType: 'M',
    createTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 2,
        parentId: 1,
        name: '仪表盘',
        icon: 'DataAnalysis',
        orderNum: 1,
        path: '/dashboard/home',
        component: 'dashboard/Home',
        perms: 'dashboard:home:view',
        visible: '0',
        status: '0',
        menuType: 'C',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 3,
        parentId: 1,
        name: '油烟清洗审核',
        icon: 'DocumentChecked',
        orderNum: 2,
        path: '/dashboard/audit',
        component: 'dashboard/Audit',
        perms: 'dashboard:audit:view',
        visible: '0',
        status: '0',
        menuType: 'C',
        createTime: '2024-01-01 10:00:00',
        children: [
          {
            id: 301,
            parentId: 3,
            name: '审核功能',
            icon: '',
            orderNum: 1,
            path: '',
            component: '',
            perms: 'dashboard:audit:operate',
            visible: '0',
            status: '0',
            menuType: 'F',
            createTime: '2024-01-01 10:00:00'
          }
        ]
      }
    ]
  },
  {
    id: 4,
    parentId: 0,
    name: '商户管理',
    icon: 'Shop',
    orderNum: 2,
    path: '/dashboard/merchant',
    component: 'dashboard/Merchant',
    perms: 'dashboard:merchant:view',
    visible: '0',
    status: '0',
    menuType: 'C',
    createTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 401,
        parentId: 4,
        name: '新增商户',
        icon: '',
        orderNum: 1,
        path: '',
        component: '',
        perms: 'dashboard:merchant:add',
        visible: '0',
        status: '0',
        menuType: 'F',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 402,
        parentId: 4,
        name: '编辑商户',
        icon: '',
        orderNum: 2,
        path: '',
        component: '',
        perms: 'dashboard:merchant:edit',
        visible: '0',
        status: '0',
        menuType: 'F',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 403,
        parentId: 4,
        name: '删除商户',
        icon: '',
        orderNum: 3,
        path: '',
        component: '',
        perms: 'dashboard:merchant:remove',
        visible: '0',
        status: '0',
        menuType: 'F',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 404,
        parentId: 4,
        name: '查看详情',
        icon: '',
        orderNum: 4,
        path: '',
        component: '',
        perms: 'dashboard:merchant:detail',
        visible: '0',
        status: '0',
        menuType: 'F',
        createTime: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    id: 5,
    parentId: 0,
    name: '监控地图',
    icon: 'MapLocation',
    orderNum: 3,
    path: '/dashboard/map',
    component: 'dashboard/Map',
    perms: 'dashboard:map:view',
    visible: '0',
    status: '0',
    menuType: 'C',
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 6,
    parentId: 0,
    name: '清理商管理',
    icon: 'Tools',
    orderNum: 4,
    path: '/dashboard/service-provider',
    component: 'dashboard/ServiceProvider',
    perms: 'dashboard:serviceProvider:view',
    visible: '0',
    status: '0',
    menuType: 'C',
    createTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 601,
        parentId: 6,
        name: '新增清理商',
        icon: '',
        orderNum: 1,
        path: '',
        component: '',
        perms: 'dashboard:serviceProvider:add',
        visible: '0',
        status: '0',
        menuType: 'F',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 602,
        parentId: 6,
        name: '编辑清理商',
        icon: '',
        orderNum: 2,
        path: '',
        component: '',
        perms: 'dashboard:serviceProvider:edit',
        visible: '0',
        status: '0',
        menuType: 'F',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 603,
        parentId: 6,
        name: '删除清理商',
        icon: '',
        orderNum: 3,
        path: '',
        component: '',
        perms: 'dashboard:serviceProvider:remove',
        visible: '0',
        status: '0',
        menuType: 'F',
        createTime: '2024-01-01 10:00:00'
      }
    ]
  }
])

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')

// 表单数据
const form = ref({
  id: null,
  parentId: 0,
  name: '',
  icon: '',
  orderNum: 0,
  path: '',
  component: '',
  perms: '',
  visible: '0',
  status: '0',
  menuType: 'M'
})

// 菜单树选项（用于上级菜单选择）
const menuTreeOptions = computed(() => {
  const buildTree = (list, parentId = 0) => {
    const result = []
    list.forEach(item => {
      if (item.parentId === parentId) {
        const node = {
          id: item.id,
          name: item.name,
          children: []
        }
        const children = buildTree(list, item.id)
        if (children.length > 0) {
          node.children = children
        }
        result.push(node)
      }
    })
    return result
  }
  // 添加根节点
  return [
    { id: 0, name: '主类目', children: buildTree(menuList.value) }
  ]
})

// 新增菜单
const handleAddMenu = (row = null) => {
  dialogTitle.value = '新增菜单'
  form.value = {
    id: null,
    parentId: row ? row.id : 0,
    name: '',
    icon: '',
    orderNum: 0,
    path: '',
    component: '',
    perms: '',
    visible: '0',
    status: '0',
    menuType: row && row.menuType === 'M' ? 'C' : 'M'
  }
  dialogVisible.value = true
}

// 编辑菜单
const handleEditMenu = (row) => {
  dialogTitle.value = '编辑菜单'
  form.value = {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    icon: row.icon || '',
    orderNum: row.orderNum,
    path: row.path || '',
    component: row.component || '',
    perms: row.perms || '',
    visible: row.visible,
    status: row.status,
    menuType: row.menuType
  }
  dialogVisible.value = true
}

// 删除菜单
const handleDeleteMenu = (row) => {
  // 检查是否有子菜单
  const hasChildren = (parentId) => {
    return menuList.value.some(item => item.parentId === parentId)
  }

  if (hasChildren(row.id)) {
    ElMessage.warning('该菜单下还有子菜单，无法删除')
    return
  }

  ElMessageBox.confirm(
    `确定要删除菜单「${row.name}」吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 从列表中删除
    const index = menuList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      menuList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = () => {
  if (!form.value.name) {
    ElMessage.warning('请输入菜单名称')
    return
  }

  const now = new Date().toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  }).replace(/\//g, '-')

  if (form.value.id) {
    // 编辑
    const index = menuList.value.findIndex(item => item.id === form.value.id)
    if (index !== -1) {
      menuList.value[index] = {
        ...menuList.value[index],
        parentId: form.value.parentId,
        name: form.value.name,
        icon: form.value.icon,
        orderNum: form.value.orderNum,
        path: form.value.path,
        component: form.value.component,
        perms: form.value.perms,
        visible: form.value.visible,
        status: form.value.status,
        menuType: form.value.menuType
      }
      ElMessage.success('修改成功')
    }
  } else {
    // 新增
    const newId = Math.max(...menuList.value.map(item => item.id)) + 1
    const newMenu = {
      id: newId,
      parentId: form.value.parentId,
      name: form.value.name,
      icon: form.value.icon,
      orderNum: form.value.orderNum,
      path: form.value.path,
      component: form.value.component,
      perms: form.value.perms,
      visible: form.value.visible,
      status: form.value.status,
      menuType: form.value.menuType,
      createTime: now
    }
    menuList.value.push(newMenu)
    ElMessage.success('新增成功')
  }

  dialogVisible.value = false
}
</script>

<style scoped>
.menu-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
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

.menu-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.menu-dialog-body {
  padding: 10px 0;
}
</style>
