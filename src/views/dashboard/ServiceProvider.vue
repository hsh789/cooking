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
        />
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Upload, View, Download, ArrowRight, Search, Filter, Sort, StarFilled, EditPen, DeleteFilled } from '@element-plus/icons-vue'
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

// 过滤后的服务商列表（子管理员只能看到自己区域的服务商）
const filteredProviders = computed(() => {
  let result = providerList.value

  // 子管理员只能看到自己区域的服务商
  if (userInfo.value.role !== 'admin' && userInfo.value.district) {
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
</style>