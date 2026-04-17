<template>
  <div class="service-provider-new">
    <!-- 页面头部 -->
    <div class="page-header-new">
      <div class="header-left">
        <h1 class="page-title-new">第三方清理商管理</h1>
      </div>
      <div class="header-right">
        <el-button class="btn-add-provider" @click="handleAddProvider">
          <el-icon class="btn-icon"><Plus /></el-icon>
          <span>新增清理商</span>
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards-new">
      <div class="stat-card-item">
        <div class="stat-label-new">企业总数</div>
        <div class="stat-value-new blue">{{ filteredProviders.length }}</div>
      </div>
      <div class="stat-card-item">
        <div class="stat-label-new">服务区数量</div>
        <div class="stat-value-new green">{{ serviceAreaCount }}</div>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="search-filter-bar">
      <div class="search-box-new">
        <el-icon class="search-icon-new"><Search /></el-icon>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="按公司名称或服务区域筛选..."
          class="search-input-new"
        >
      </div>
    </div>

    <!-- 服务商列表 -->
    <div class="provider-list-new">
      <!-- 表头 -->
      <div class="list-header">
        <div class="col-name">公司名称</div>
        <div class="col-license">营业执照</div>
        <div class="col-area">服务片区</div>
        <div class="col-contact">联系信息</div>
        <div class="col-action">操作</div>
      </div>

      <!-- 列表内容 -->
      <div class="list-body">
        <div
          v-for="(provider, index) in paginatedProviders"
          :key="provider.id"
          class="provider-row"
        >
          <!-- 公司名称 -->
          <div class="col-name">
            <div class="company-info">
              <div class="company-logo" :style="{ background: getLogoColor(index) }">
                {{ getInitials(provider.name) }}
              </div>
              <div class="company-details">
                <div class="company-name">{{ provider.name }}</div>
                <div class="company-id">ID: PRV-2024-{{ String(provider.id).padStart(3, '0') }}</div>
              </div>
            </div>
          </div>

          <!-- 营业执照 -->
          <div class="col-license">
            <div class="license-thumb" @click="handleViewLicense(provider)">
              <el-image
                v-if="provider.businessLicense"
                :src="provider.businessLicense"
                fit="cover"
                class="license-img"
              />
              <div v-else class="no-license-thumb">暂无</div>
            </div>
          </div>

          <!-- 服务片区 -->
          <div class="col-area">
            <div class="area-tags">
              <span class="area-tag" :class="getDistrictClass(provider.district)">
                {{ getDistrictLabel(provider.district) }}
              </span>
            </div>
          </div>

          <!-- 联系信息 -->
          <div class="col-contact">
            <div class="contact-info">
              <div class="contact-name">{{ provider.contact }}</div>
              <div class="contact-phone">{{ provider.phone }}</div>
            </div>
          </div>

          <!-- 操作 -->
          <div class="col-action">
            <div class="action-btns">
              <el-icon class="action-icon-new edit" @click="handleEditProvider(provider)"><EditPen /></el-icon>
              <el-icon v-if="isAdmin" class="action-icon-new delete" @click="handleDeleteProvider(provider)"><DeleteFilled /></el-icon>
              <el-tooltip content="操作记录" placement="top" :show-after="300">
                <el-icon class="action-icon-new history" @click="handleViewOperationLog(provider)"><Clock /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="list-footer">
        <span class="footer-text">显示 {{ filteredProviders.length }} 家服务商中的前 {{ Math.min(5, filteredProviders.length) }} 家</span>
        <el-pagination
          small
          layout="prev, pager, next"
          :total="filteredProviders.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
          class="custom-pagination"
        />
      </div>
    </div>
    
    <!-- 添加/编辑服务商弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      top="15vh"
      :close-on-click-modal="false"
      transition="el-dialog-fade"
    >
      <div class="provider-dialog-content">
        <el-form :model="form" label-width="120px" class="provider-form">
          <el-form-item label="公司名称" prop="name" required>
            <el-input 
              v-model="form.name" 
              placeholder="请输入公司名称" 
              size="large"
              class="form-input"
            />
          </el-form-item>
          <el-form-item label="联系人" prop="contact">
            <el-input 
              v-model="form.contact" 
              placeholder="请输入联系人" 
              size="large"
              class="form-input"
            />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input 
              v-model="form.phone" 
              placeholder="请输入联系电话" 
              size="large"
              class="form-input"
            />
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input 
              v-model="form.address" 
              placeholder="请输入地址" 
              size="large"
              class="form-input"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
          <el-form-item label="服务片区" prop="district">
            <el-select 
              v-model="form.district" 
              placeholder="请选择服务片区" 
              size="large"
              class="form-input"
              style="width: 100%;"
            >
              <el-option label="开发区" value="development" />
              <el-option label="城关镇" value="town" />
              <el-option label="工业园区" value="industry" />
            </el-select>
          </el-form-item>
          <el-form-item label="营业执照" prop="businessLicense">
            <el-upload
              class="upload-demo"
              action="#"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="fileList"
              :auto-upload="false"
              :limit="1"
            >
              <el-button type="primary" size="large" class="upload-button">
                <el-icon><Upload /></el-icon> 上传营业执照
              </el-button>
              <template #tip>
                <div class="upload-tip">
                  支持JPG、PNG格式，文件大小不超过2MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="large" @click="dialogVisible = false" class="cancel-button">取消</el-button>
          <el-button type="primary" size="large" @click="handleSubmit" class="submit-button">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看营业执照弹窗 -->
    <el-dialog
      v-model="licenseDialogVisible"
      title="查看营业执照"
      width="600px"
      top="15vh"
    >
      <div class="license-dialog">
        <div class="license-info">
          <h3>{{ currentProvider.name }}</h3>
          <p>联系人：{{ currentProvider.contact }}</p>
          <p>联系电话：{{ currentProvider.phone }}</p>
        </div>
        <div class="license-image" v-if="currentProvider.businessLicense">
          <el-image
            :src="currentProvider.businessLicense"
            fit="contain"
            style="width: 100%; max-height: 500px;"
            :preview-src-list="[currentProvider.businessLicense]"
          />
        </div>
        <div class="no-license" v-else>
          <el-empty description="暂无营业执照" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="success" @click="handleExportLicense" :disabled="!currentProvider.businessLicense">
            <el-icon><Download /></el-icon>
            导出营业执照
          </el-button>
          <el-button @click="licenseDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 操作记录弹窗 -->
    <el-dialog
      v-model="operationLogVisible"
      :title="`操作记录 - ${currentProvider.name || ''}`"
      width="620px"
      top="15vh"
      class="operation-log-dialog"
    >
      <div class="operation-log-content">
        <!-- 基本信息卡片 -->
        <div class="log-provider-info">
          <div class="log-info-avatar" :style="{ background: getLogoColor(0) }">
            {{ currentProvider.name ? getInitials(currentProvider.name) : '' }}
          </div>
          <div class="log-info-text">
            <h4>{{ currentProvider.name }}</h4>
            <p>ID: PRV-2024-{{ String(currentProvider.id).padStart(3, '0') }} · {{ getDistrictLabel(currentProvider.district) }}</p>
          </div>
          <el-tag type="info" size="small">共 {{ operationLogs.length }} 条记录</el-tag>
        </div>

        <!-- 时间线 -->
        <div v-if="operationLogs.length > 0" class="log-timeline">
          <div
            v-for="(log, index) in operationLogs"
            :key="index"
            class="log-timeline-item"
          >
            <div class="timeline-dot" :class="getLogDotClass(log.type)">
              <el-icon><component :is="getLogIcon(log.type)" /></el-icon>
            </div>
            <div class="timeline-line" v-if="index < operationLogs.length - 1"></div>
            <div class="timeline-body">
              <div class="timeline-header">
                <span class="timeline-action" :class="getLogActionClass(log.type)">{{ getLogActionText(log.type) }}</span>
                <span class="timeline-time">{{ log.time }}</span>
              </div>
              <p class="timeline-desc">{{ log.description }}</p>
              <div v-if="log.operator" class="timeline-operator">
                操作人：{{ log.operator }}
              </div>
            </div>
          </div>
        </div>

        <!-- 无记录时 -->
        <el-empty v-else description="暂无操作记录" />
      </div>
      <template #footer>
        <el-button @click="operationLogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Upload, View, Download, ArrowRight, Search, Filter, Sort, StarFilled, EditPen, DeleteFilled, Clock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 是否为管理员
const isAdmin = computed(() => userInfo.value.role === 'admin')

// 默认服务商列表
const defaultProviderList = [
  {
    id: 1,
    name: '洁净清洗服务有限公司',
    contact: '王经理',
    phone: '13800138001',
    address: '北京市朝阳区建国路88号',
    district: 'development',
    createdAt: '2024-01-15 10:00:00',
    businessLicense: 'https://picsum.photos/seed/license1/800/600'
  },
  {
    id: 2,
    name: '清新环保科技有限公司',
    contact: '李经理',
    phone: '13800138002',
    address: '北京市海淀区中关村大街1号',
    district: 'town',
    createdAt: '2024-01-16 14:30:00',
    businessLicense: 'https://picsum.photos/seed/license2/800/600'
  },
  {
    id: 3,
    name: '绿色清洁服务公司',
    contact: '张经理',
    phone: '13800138003',
    address: '北京市东城区王府井大街1号',
    district: 'development',
    createdAt: '2024-01-17 09:15:00',
    businessLicense: 'https://picsum.photos/seed/license3/800/600'
  },
  {
    id: 4,
    name: '蓝天环保科技有限公司',
    contact: '刘经理',
    phone: '13800138004',
    address: '北京市西城区西单大街1号',
    district: 'industry',
    createdAt: '2024-01-18 15:30:00',
    businessLicense: 'https://picsum.photos/seed/license4/800/600'
  }
]

// 从 localStorage 加载服务商列表
const loadProviderListFromStorage = () => {
  try {
    const stored = localStorage.getItem('serviceProviderList')
    if (stored) {
      const parsed = JSON.parse(stored)
      // 为从审核页面添加的清洗商补充 businessLicense 字段
      return parsed.map(p => ({
        ...p,
        businessLicense: p.businessLicense || `https://picsum.photos/seed/license${p.id}/800/600`
      }))
    }
  } catch (e) {
    console.error('加载服务商列表失败:', e)
  }
  return [...defaultProviderList]
}

// 保存服务商列表到 localStorage
const saveProviderListToStorage = (list) => {
  try {
    localStorage.setItem('serviceProviderList', JSON.stringify(list))
  } catch (e) {
    console.error('保存服务商列表失败:', e)
  }
}

// 服务商列表（从 localStorage 或默认值加载）
const providerList = ref(loadProviderListFromStorage())

// 搜索关键词
const searchKeyword = ref('')

// 当前页码
const currentPage = ref(1)
const pageSize = 5

// 过滤后的服务商列表（二级和三级管理员只能看到自己区域的服务商）
const filteredProviders = computed(() => {
  let result = providerList.value

  // 二级和三级管理员只能看到自己区域的服务商
  if (userInfo.value.adminLevel !== 'level1' && userInfo.value.district) {
    result = result.filter(item => item.district === userInfo.value.district)
  }

  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.district.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 分页后的服务商列表
const paginatedProviders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredProviders.value.slice(start, end)
})

// 服务区数量统计
const serviceAreaCount = computed(() => {
  // 获取所有唯一的服务区
  const uniqueDistricts = new Set(filteredProviders.value.map(item => item.district))
  return uniqueDistricts.size
})

// 获取公司首字母
const getInitials = (name) => {
  return name.substring(0, 2).toUpperCase()
}

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page
}

// 根据索引获取logo颜色
const getLogoColor = (index) => {
  const colors = [
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
  ]
  return colors[index % colors.length]
}

// 获取片区标签
const getDistrictLabel = (district) => {
  const labels = {
    'development': '开发区',
    'town': '城关镇',
    'industry': '工业区',
    'all': '所有区域'
  }
  return labels[district] || district
}

// 获取片区标签样式
const getDistrictClass = (district) => {
  const classes = {
    'development': 'area-blue',
    'town': 'area-green',
    'industry': 'area-orange',
    'all': 'area-gray'
  }
  return classes[district] || 'area-blue'
}

// 弹窗状态
const dialogVisible = ref(false)
const dialogTitle = ref('添加清洗商')

// 查看营业执照弹窗
const licenseDialogVisible = ref(false)
const currentProvider = ref({})

// 操作记录弹窗
const operationLogVisible = ref(false)
const operationLogs = ref([])

// 表单数据
const form = ref({
  id: '',
  name: '',
  contact: '',
  phone: '',
  address: '',
  district: ''
})

// 文件列表
const fileList = ref([])

// 初始化
onMounted(() => {
  // 这里可以添加获取服务商列表的API调用
})

// 打开添加服务商弹窗
const handleAddProvider = () => {
  dialogTitle.value = '添加清洗商'
  form.value = {
    id: '',
    name: '',
    contact: '',
    phone: '',
    address: '',
    district: ''
  }
  fileList.value = []
  dialogVisible.value = true
}

// 打开编辑服务商弹窗
const handleEditProvider = (row) => {
  dialogTitle.value = '编辑服务商'
  form.value = { ...row }
  fileList.value = []
  dialogVisible.value = true
}

// 删除服务商
const handleDeleteProvider = (row) => {
  // 权限检查：只有管理员可以删除
  if (!isAdmin.value) {
    ElMessage.warning('您没有权限删除服务商')
    return
  }
  ElMessageBox.confirm(
    `确定要删除服务商 ${row.name} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加删除服务商的API调用
    const index = providerList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      providerList.value.splice(index, 1)
      // 保存到 localStorage（与审核页面共享）
      saveProviderListToStorage(providerList.value)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 查看营业执照
const handleViewLicense = (row) => {
  currentProvider.value = { ...row }
  licenseDialogVisible.value = true
}

// 查看操作记录
const handleViewOperationLog = (row) => {
  currentProvider.value = { ...row }
  // 根据清洗商ID生成模拟操作记录
  operationLogs.value = generateOperationLogs(row.id)
  operationLogVisible.value = true
}

// 生成操作记录（模拟数据）
const generateOperationLogs = (providerId) => {
  const baseRecords = [
    { type: 'create', time: '2024-01-15 10:00:00', description: `新增第三方清洗商「${currentProvider.value.name}」`, operator: '管理员' },
    { type: 'edit', time: '2024-01-20 14:30:00', description: '修改了联系人信息和联系电话', operator: '张区管' },
    { type: 'audit', time: '2024-02-05 09:15:00', description: '营业执照审核通过，服务片区确认为开发区', operator: '区县级管理' },
    { type: 'service', time: '2024-03-10 16:20:00', description: '完成阳光咖啡馆油烟机清洗服务（第1次）', operator: '系统自动' },
    { type: 'service', time: '2024-04-02 11:45:00', description: '完成开发区KTV油烟机清洗服务（第2次）', operator: '系统自动' },
    { type: 'edit', time: '2024-04-12 10:30:00', description: '修改了服务片区为开发区', operator: '李区管' },
  ]

  // 根据providerId做差异化处理，让每个清洗商的记录不同
  const extraRecords = []
  if (providerId === 1) {
    extraRecords.push(
      { type: 'service', time: '2024-04-15 13:30:00', description: '完成城关镇饭店油烟机清洗服务（第3次）', operator: '系统自动' },
      { type: 'warning', time: '2024-04-17 09:00:00', description: '商户投诉响应超时，已标记待跟进', operator: '系统自动' }
    )
  } else if (providerId === 2) {
    extraRecords.push({ type: 'audit', time: '2024-04-08 11:00:00', description: '年度资质复核审核通过', operator: '区县级管理' })
  } else if (providerId === 3) {
    extraRecords.push(
      { type: 'edit', time: '2024-04-14 15:00:00', description: '更新营业执照图片', operator: '王区管' },
      { type: 'service', time: '2024-04-16 10:30:00', description: '完成时尚服装店油烟机清洗服务（第1次）', operator: '系统自动' }
    )
  }

  return [...baseRecords, ...extraRecords]
}

// 获取操作类型对应的图标
const getLogIcon = (type) => {
  const iconMap = {
    create: 'Plus',
    edit: 'EditPen',
    delete: 'DeleteFilled',
    audit: 'CircleCheck',
    service: 'Shop',
    warning: 'Warning'
  }
  return iconMap[type] || 'Document'
}

// 获取时间线圆点样式类
const getLogDotClass = (type) => {
  const classMap = {
    create: 'dot-create',
    edit: 'dot-edit',
    delete: 'dot-delete',
    audit: 'dot-audit',
    service: 'dot-service',
    warning: 'dot-warning'
  }
  return classMap[type] || 'dot-default'
}

// 获取操作文字样式类
const getLogActionClass = (type) => {
  const classMap = {
    create: 'action-create',
    edit: 'action-edit',
    delete: 'action-delete',
    audit: 'action-audit',
    service: 'action-service',
    warning: 'action-warning'
  }
  return classMap[type] || ''
}

// 获取操作文字文本
const getLogActionText = (type) => {
  const textMap = {
    create: '新增录入',
    edit: '信息修改',
    delete: '删除移除',
    audit: '审核操作',
    service: '服务记录',
    warning: '异常提醒'
  }
  return textMap[type] || '未知操作'
}

// 提交表单
const handleSubmit = () => {
  // 这里可以添加表单验证
  if (!form.value.name) {
    ElMessage.warning('请填写公司名称')
    return
  }
  
  if (form.value.id) {
    // 编辑服务商
    // 这里可以添加编辑服务商的API调用
    const index = providerList.value.findIndex(item => item.id === form.value.id)
    if (index !== -1) {
      providerList.value[index] = { ...form.value }
      // 保存到 localStorage（与审核页面共享）
      saveProviderListToStorage(providerList.value)
    }
    ElMessage.success('编辑成功')
  } else {
    // 添加服务商
    // 这里可以添加添加服务商的API调用
    const newProvider = {
      id: Date.now(), // 使用时间戳作为唯一ID
      ...form.value,
      createdAt: new Date().toLocaleString('zh-CN'),
      // 模拟营业执照图片
      businessLicense: `https://picsum.photos/seed/license${Date.now()}/800/600`
    }
    providerList.value.push(newProvider)
    // 保存到 localStorage（与审核页面共享）
    saveProviderListToStorage(providerList.value)
    ElMessage.success('添加成功')
  }
  
  dialogVisible.value = false
}

// 预览文件
const handlePreview = (file) => {
  console.log(file)
}

// 删除文件
const handleRemove = (file, fileList) => {
  console.log(file, fileList)
}

// 导出清洗商列表为CSV
const handleExportProviders = () => {
  if (filteredProviders.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  // CSV表头
  const headers = ['ID', '公司名称', '联系人', '联系电话', '地址', '创建时间']
  
  // CSV数据行
  const rows = filteredProviders.value.map(item => [
    item.id,
    item.name,
    item.contact,
    item.phone,
    item.address,
    item.createdAt
  ])
  
  // 构建CSV内容
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  // 添加BOM以支持中文
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = `清洗商列表_${new Date().toLocaleDateString('zh-CN')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success(`已导出 ${filteredProviders.value.length} 条记录`)
}

// 导出营业执照图片
const handleExportLicense = () => {
  if (!currentProvider.value.businessLicense) {
    ElMessage.warning('暂无营业执照可导出')
    return
  }
  
  // 获取图片URL
  const imageUrl = currentProvider.value.businessLicense
  const providerName = currentProvider.value.name
  
  // 使用fetch获取图片并下载
  fetch(imageUrl)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      // 根据图片URL推断扩展名，默认为jpg
      const extension = imageUrl.split('.').pop() || 'jpg'
      link.download = `${providerName}_营业执照.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      ElMessage.success('营业执照导出成功')
    })
    .catch(error => {
      console.error('导出失败:', error)
      ElMessage.error('营业执照导出失败，请重试')
    })
}
</script>

<style scoped>
.service-provider-new {
  width: 100%;
  padding: 24px;
  background-color: #f8f9fc;
  min-height: calc(100vh - 60px);
}

/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.breadcrumb-item {
  color: #6b7280;
}

.breadcrumb-item.active {
  color: #1e3a5f;
  font-weight: 500;
}

.breadcrumb-separator {
  font-size: 12px;
  color: #9ca3af;
}

/* 页面头部 */
.page-header-new {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.page-title-new {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.page-desc-new {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-right {
  flex-shrink: 0;
}

.btn-add-provider {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  height: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  transition: all 0.3s ease;
}

.btn-add-provider:hover {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
}

.btn-icon {
  font-size: 16px;
}

/* 统计卡片 */
.stats-cards-new {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label-new {
  font-size: 13px;
  color: #6b7280;
}

.stat-value-new {
  font-size: 32px;
  font-weight: 700;
}

.stat-value-new.blue {
  color: #1e3a5f;
}

.stat-value-new.green {
  color: #059669;
}

.stat-value-new.orange {
  color: #ea580c;
}

.stat-value-new.dark {
  color: #1f2937;
}

/* 搜索和筛选栏 */
.search-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-box-new {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 400px;
}

.search-icon-new {
  color: #9ca3af;
  font-size: 18px;
}

.search-input-new {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #374151;
  background: transparent;
}

.search-input-new::placeholder {
  color: #9ca3af;
}

.filter-actions {
  display: flex;
  gap: 16px;
}

.filter-btn,
.sort-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.filter-btn:hover,
.sort-btn:hover {
  background-color: #f3f4f6;
}

/* 服务商列表 */
.provider-list-new {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 0.8fr;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.list-body {
  padding: 8px 0;
}

.provider-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 0.8fr;
  gap: 16px;
  padding: 16px 24px;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.3s;
}

.provider-row:last-child {
  border-bottom: none;
}

.provider-row:hover {
  background-color: #f9fafb;
}

/* 公司名称列 */
.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.company-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.company-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.company-id {
  font-size: 12px;
  color: #9ca3af;
}

/* 营业执照列 */
.license-thumb {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.license-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-license-thumb {
  font-size: 12px;
  color: #9ca3af;
}

/* 服务片区列 */
.area-tags {
  display: flex;
  gap: 6px;
}

.area-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.area-tag.area-blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.area-tag.area-green {
  background: #d1fae5;
  color: #047857;
}

.area-tag.area-orange {
  background: #ffedd5;
  color: #c2410c;
}

.area-tag.area-gray {
  background: #f3f4f6;
  color: #4b5563;
}

/* 联系信息列 */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-name {
  font-size: 14px;
  color: #374151;
}

.contact-phone {
  font-size: 12px;
  color: #9ca3af;
}

/* 操作列 */
.action-btns {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-icon-new {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.action-icon-new.edit {
  color: #1d4ed8;
}

.action-icon-new.edit:hover {
  color: #1e40af;
}

.action-icon-new.delete {
  color: #ef4444;
}

.action-icon-new.delete:hover {
  color: #dc2626;
}

.action-icon-new.history {
  color: #8b5cf6;
}

.action-icon-new.history:hover {
  color: #7c3aed;
}

/* 列表底部 */
.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
}

.footer-text {
  font-size: 13px;
  color: #9ca3af;
}

.custom-pagination :deep(.el-pager li) {
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin: 0 4px;
  min-width: 28px;
  height: 28px;
  line-height: 26px;
  font-size: 13px;
  color: #4b5563;
}

.custom-pagination :deep(.el-pager li.active) {
  background: #1e3a5f;
  border-color: #1e3a5f;
  color: #fff;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #4b5563;
}

/* 弹窗样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #eaeaea;
  border-radius: 0 0 8px 8px;
}

/* 添加/编辑服务商弹窗样式 */
.provider-dialog-content {
  padding: 20px;
}

.provider-form {
  margin-bottom: 0;
}

.form-input {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.upload-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.upload-button:hover {
  background-color: #66B1FF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.cancel-button {
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.submit-button {
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #66B1FF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .provider-dialog-content {
    padding: 15px;
  }
  
  .provider-form {
    label-width: 100px;
  }
  
  .dialog-footer {
    padding: 15px;
  }
  
  .upload-button,
  .cancel-button,
  .submit-button {
    padding: 8px 16px;
    font-size: 13px;
  }
}

/* 查看营业执照弹窗样式 */
.license-dialog {
  padding: 20px;
}

.license-info {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaeaea;
}

.license-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.license-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.license-image {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.no-license {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .stats-cards-new {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .list-header,
  .provider-row {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
  
  .col-action {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .service-provider-new {
    padding: 16px;
  }
  
  .page-header-new {
    flex-direction: column;
    gap: 16px;
  }
  
  .page-title-new {
    font-size: 22px;
  }
  
  .search-filter-bar {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-box-new {
    max-width: 100%;
  }
  
  .list-header,
  .provider-row {
    grid-template-columns: 2fr 1fr 1fr;
  }
  
  .col-license,
  .col-contact,
  .col-action {
    display: none;
  }
}

/* ========== 操作记录弹窗样式 ========== */

.operation-log-content {
  padding: 4px 0;
  max-height: 50vh;
  overflow-y: auto;
}

/* 清洗商基本信息卡片 */
.log-provider-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.log-info-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.log-info-text {
  flex: 1;
}

.log-info-text h4 {
  margin: 0 0 3px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.log-info-text p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

/* 时间线容器 */
.log-timeline {
  position: relative;
  padding-left: 28px;
}

/* 时间线单项 */
.log-timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.log-timeline-item:last-child {
  padding-bottom: 0;
}

/* 时间线圆点 */
.timeline-dot {
  position: absolute;
  left: -28px;
  top: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  z-index: 2;
  color: #fff;
}

.timeline-dot.dot-create { background: #10b981; }
.timeline-dot.dot-edit { background: #3b82f6; }
.timeline-dot.dot-delete { background: #ef4444; }
.timeline-dot.dot-audit { background: #8b5cf6; }
.timeline-dot.dot-service { background: #f59e0b; }
.timeline-dot.dot-warning { background: #ec4899; }
.timeline-dot.dot-default { background: #9ca3af; }

/* 时间线连接线 */
.timeline-line {
  position: absolute;
  left: -17px;
  top: 26px;
  width: 2px;
  bottom: -2px;
  background: #e2e8f0;
}

/* 时间线内容区 */
.timeline-body {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.timeline-body:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.timeline-action {
  font-size: 13px;
  font-weight: 600;
}

.timeline-action.action-create { color: #059669; }
.timeline-action.action-edit { color: #2563eb; }
.timeline-action.action-delete { color: #dc2626; }
.timeline-action.action-audit { color: #7c3aed; }
.timeline-action.action-service { color: #d97706; }
.timeline-action.action-warning { color: #db2777; }

.timeline-time {
  font-size: 11px;
  color: #94a3b8;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.timeline-desc {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

.timeline-operator {
  font-size: 11px;
  color: #94a3b8;
  padding-top: 6px;
  border-top: 1px dashed #e2e8f0;
}
</style>