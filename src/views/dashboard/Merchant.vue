<template>
  <div class="merchant-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF;">
              <el-icon :size="24"><Shop /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">商户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67C23A;">
              <el-icon :size="24"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.open }}</div>
              <div class="stat-label">营业中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C;">
              <el-icon :size="24"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.warning }}</div>
              <div class="stat-label">预警中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #F56C6C;">
              <el-icon :size="24"><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.overdue }}</div>
              <div class="stat-label">已逾期</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商户名称">
          <el-input v-model="searchForm.name" placeholder="请输入商户名称" clearable />
        </el-form-item>
        <el-form-item label="营业状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px">
            <el-option label="营业中" value="open" />
            <el-option label="临时关门" value="closed" />
            <el-option label="已停业" value="stopped" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警状态">
          <el-select v-model="searchForm.warningLevel" placeholder="请选择预警" clearable style="width: 140px">
            <el-option label="正常" value="normal" />
            <el-option label="黄色预警" value="yellow" />
            <el-option label="红色预警" value="red" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">商户列表</div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增商户
          </el-button>
          <el-button type="success" @click="handleImport">
            <el-icon><Upload /></el-icon>批量导入
          </el-button>
          <el-button type="info" @click="handleExport">
            <el-icon><Download /></el-icon>导出数据
          </el-button>
        </div>
      </div>

      <!-- 商户表格 -->
      <el-table :data="filteredTableData" v-loading="loading" stripe>
        <el-table-column prop="name" label="商户名称" min-width="150" />
        <!-- 总管理员显示区域负责人列 -->
        <el-table-column v-if="isAdmin" label="区域负责人" width="120">
          <template #default="{ row }">
            {{ districtManagerMap[row.district]?.name || '-' }}
          </template>
        </el-table-column>
        <!-- 新增负责人电话列 -->
        <el-table-column label="负责人电话" width="120">
          <template #default="{ row }">
            {{ isAdmin ? (districtManagerMap[row.district]?.phone || '-') : userInfo.phone }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="主理人电话" width="120" />
        <el-table-column prop="address" label="地址" min-width="180" />
        <el-table-column prop="status" label="营业状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="daysSinceLastClean" label="未清洗天数" width="100">
          <template #default="{ row }">
            <span :class="getDaysClass(row.daysSinceLastClean)">
              {{ row.daysSinceLastClean }}天
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="warningLevel" label="预警状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getWarningType(row.warningLevel)">
              {{ getWarningText(row.warningLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastCleanTime" label="最近清洗" width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="success" link @click="handleViewHistory(row)">查看历史</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 查看历史右滑栏 -->
    <div v-if="historyDialogVisible" class="drawer-overlay" @click="historyDialogVisible = false"></div>
    <transition name="slide-from-right">
      <div v-if="historyDialogVisible" class="drawer-panel">
        <div class="drawer-header">
          <h3 class="drawer-title">商户审核历史</h3>
          <div class="drawer-header-actions">
            <el-button type="success" size="small" @click="handleExportHistory" :icon="Download">导出数据</el-button>
            <el-icon class="drawer-close" @click="historyDialogVisible = false"><Close /></el-icon>
          </div>
        </div>
        <div class="drawer-content">
          <div class="history-merchant-header" v-if="currentHistoryMerchant">
            <div class="history-merchant-name">{{ currentHistoryMerchant.name }}</div>
            <div class="history-merchant-meta">
              {{ currentHistoryMerchant.address }} · {{ currentHistoryMerchant.owner }} · {{ currentHistoryMerchant.phone }}
            </div>
            <el-tag type="info" style="margin-top: 8px;">共 {{ merchantHistoryList.length }} 次审核</el-tag>
          </div>

          <el-timeline>
            <el-timeline-item
              v-for="item in merchantHistoryList"
              :key="item.id"
              :timestamp="item.submitTime"
              placement="top"
              :type="getHistoryTimelineType(item.status)"
            >
              <el-card shadow="never" class="history-card-item">
                <div class="history-card-header">
                  <div class="history-card-title">
                    <span>{{ item.periodLabel }}</span>
                    <el-tag size="small" :type="getHistoryStatusType(item.status)">
                      {{ item.statusText }}
                    </el-tag>
                  </div>
                </div>

                <div class="history-card-info">
                  <div>审核人：{{ item.reviewer }}</div>
                  <div>审核时间：{{ item.reviewTime }}</div>
                  <div v-if="item.status === 'rejected'">{{ item.remark }}</div>
                </div>

                <div class="history-photo-section">
                  <div class="history-photo-title">上传照片</div>
                  <div class="history-photo-list">
                    <el-image
                      v-for="(img, index) in item.photos"
                      :key="index"
                      :src="img"
                      fit="cover"
                      class="history-photo"
                      :preview-src-list="item.photos"
                    />
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </transition>

    <!-- 商户表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="商户名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item label="负责人电话" prop="owner">
          <el-input v-model="formData.owner" placeholder="请输入负责人电话" />
        </el-form-item>
        <el-form-item label="主理人电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入主理人电话" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input v-model="formData.longitude" placeholder="请输入经度" />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input v-model="formData.latitude" placeholder="请输入纬度" />
        </el-form-item>
        <el-form-item label="营业状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择营业状态" style="width: 100%">
            <el-option label="营业中" value="open" />
            <el-option label="临时关门" value="closed" />
            <el-option label="已停业" value="stopped" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入商户"
      width="550px"
      :close-on-click-modal="false"
    >
      <div class="import-content">
        <!-- 片区选择 -->
        <div class="import-section">
          <div class="section-label">
            <span class="required">*</span>
            归属片区
            <el-tooltip content="导入的商户将自动归属到所选片区" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <el-select 
            v-model="importDistrict" 
            placeholder="请选择片区" 
            style="width: 100%"
            :disabled="userInfo.role === 'sub'"
          >
            <el-option 
              v-for="item in districtOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
          <div v-if="userInfo.role === 'sub'" class="district-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>子管理员导入的商户将自动归属到您负责的【{{ getDistrictLabel(userInfo.district) }}】片区</span>
          </div>
        </div>

        <!-- 文件上传 -->
        <div class="import-section">
          <div class="section-label">
            <span class="required">*</span>
            上传文件
          </div>
          <el-upload
            class="import-uploader"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="importFileList"
            accept=".xlsx,.xls,.csv"
            :limit="1"
          >
            <el-icon class="upload-icon"><Upload /></el-icon>
            <div class="upload-text">
              <span>拖拽文件到此处，或</span>
              <span class="upload-link">点击上传</span>
            </div>
            <div class="upload-tip">支持 .xlsx、.xls、.csv 格式</div>
          </el-upload>
        </div>

        <!-- 下载模板 -->
        <div class="import-section template-section">
          <el-alert
            title="导入说明"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="import-tips">
                <p>1. 请使用提供的模板格式填写商户信息</p>
                <p>2. 商户将自动归属到所选片区</p>
                <p>3. 重复导入相同商户名称将更新原有数据</p>
              </div>
            </template>
          </el-alert>
          <el-button type="primary" link @click="handleDownloadTemplate" class="template-btn">
            <el-icon><Download /></el-icon>
            下载导入模板
          </el-button>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleConfirmImport">
          开始导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看商户右滑栏 -->
    <div v-if="viewDrawerVisible" class="drawer-overlay" @click="viewDrawerVisible = false"></div>
    <transition name="slide-from-right">
      <div v-if="viewDrawerVisible" class="drawer-panel">
        <div class="drawer-header">
          <h3 class="drawer-title">查看商户</h3>
          <el-icon class="drawer-close" @click="viewDrawerVisible = false"><Close /></el-icon>
        </div>
        <div class="drawer-content">
          <div class="detail-row">
            <span class="detail-label">商户名称：</span>
            <span class="detail-value">{{ viewFormData.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">负责人电话：</span>
            <span class="detail-value">{{ viewFormData.owner }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">主理人电话：</span>
            <span class="detail-value">{{ viewFormData.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">地址：</span>
            <span class="detail-value">{{ viewFormData.address }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">经度：</span>
            <span class="detail-value">{{ viewFormData.longitude }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">纬度：</span>
            <span class="detail-value">{{ viewFormData.latitude }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">营业状态：</span>
            <el-tag :type="getStatusType(viewFormData.status)" size="small">
              {{ getStatusText(viewFormData.status) }}
            </el-tag>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, Download, QuestionFilled, InfoFilled, Upload } from '@element-plus/icons-vue'
import { getMerchantList, addMerchant, updateMerchant, deleteMerchant, getMerchantStats } from '@/api/merchant'
import { useUserStore } from '@/stores/user'
import { clearMerchantCache } from '@/utils/mock'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const isAdmin = computed(() => userInfo.value.role === 'admin')

// 区域负责人映射表（区域编码 -> 负责人信息）
const districtManagerMap = {
  'development': { name: '开发区负责人', phone: '13800138001' },
  'town': { name: '城关镇负责人', phone: '13800138002' },
  'industry': { name: '工业园区负责人', phone: '13800138003' }
}

// 监听用户信息变化，重新加载数据
watch(userInfo, () => {
  fetchStats()
  fetchList()
}, { deep: true })

// 统计数据
const stats = ref({
  total: 0,
  open: 0,
  warning: 0,
  overdue: 0
})

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  warningLevel: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([])

// 前端筛选后的数据
const filteredTableData = computed(() => {
  let result = tableData.value
  
  // 按商户名称筛选
  if (searchForm.name) {
    result = result.filter(item => item.name && item.name.includes(searchForm.name))
  }
  
  // 按营业状态筛选
  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status)
  }
  
  // 按预警状态筛选（根据daysSinceLastClean计算）
  if (searchForm.warningLevel) {
    result = result.filter(item => {
      const days = item.daysSinceLastClean || 0
      let level = 'normal'
      if (days >= 15) level = 'red'
      else if (days >= 13) level = 'yellow'
      return level === searchForm.warningLevel
    })
  }
  
  return result
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 弹窗
// 商户历史弹窗
const historyDialogVisible = ref(false)
const currentHistoryMerchant = ref(null)
const merchantHistoryList = ref([])

const buildHistoryPhotos = (merchantId, round) => {
  return Array.from({ length: 3 }, (_, index) => {
    const width = 420 + round * 5 + index
    const height = 280 + round * 3 + index
    return `https://picsum.photos/seed/merchant-${merchantId}-round-${round}-photo-${index + 1}/${width}/${height}`
  })
}

const buildMerchantHistory = (merchant) => {
  const currentDate = new Date()
  return Array.from({ length: 5 }, (_, index) => {
    const round = 5 - index
    const submitDate = new Date(currentDate.getTime() - index * 15 * 24 * 60 * 60 * 1000)
    const reviewDate = new Date(submitDate.getTime() + 6 * 60 * 60 * 1000)
    const statusCycle = ['approved', 'approved', 'rejected', 'approved', 'approved']
    const status = statusCycle[index]

    return {
      id: `${merchant.id}-history-${round}`,
      periodLabel: `第 ${round} 次油烟清洗审核`,
      typeText: '油烟净化器清洗上传',
      submitTime: submitDate.toLocaleString('zh-CN'),
      reviewTime: reviewDate.toLocaleString('zh-CN'),
      reviewer: status === 'approved' ? '片区审核员-王敏' : '片区审核员-李杰',
      status,
      statusText: status === 'approved' ? '审核通过' : '审核驳回',
      remark: status === 'approved'
        ? '现场照片清晰，清洗前后对比完整，符合本次审核要求。'
        : '本次上传照片缺少设备铭牌角度，请补充后重新提交。',
      photos: buildHistoryPhotos(merchant.id, round)
    }
  })
}

const dialogVisible = ref(false)
const dialogTitle = ref('')

// 查看抽屉
const viewDrawerVisible = ref(false)
const viewFormData = ref({
  id: '',
  name: '',
  owner: '',
  phone: '',
  address: '',
  longitude: '',
  latitude: '',
  status: 'open'
})
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  name: '',
  owner: '',
  phone: '',
  address: '',
  longitude: '',
  latitude: '',
  status: 'open'
})

const formRules = {
  name: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const params = {}
    // 子管理员只能查看自己区域的统计数据
    if (userInfo.value.role === 'sub' && userInfo.value.district) {
      params.district = userInfo.value.district
    }
    const res = await getMerchantStats(params)
    stats.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    // 子管理员只能查看自己区域的商户
    if (userInfo.value.role === 'sub' && userInfo.value.district) {
      params.district = userInfo.value.district
    }
    const res = await getMerchantList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  searchForm.warningLevel = ''
  pagination.page = 1
  fetchList()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增商户'
  Object.assign(formData, {
    id: null,
    name: '',
    owner: '',
    phone: '',
    address: '',
    longitude: '',
    latitude: '',
    status: 'open'
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑商户'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  viewDrawerVisible.value = true
  viewFormData.value = { ...row }
}

// 查看历史
const handleViewHistory = (row) => {
  currentHistoryMerchant.value = { ...row }
  // 生成模拟的审核历史数据
  merchantHistoryList.value = buildMerchantHistory(row)
  historyDialogVisible.value = true
}

// 历史时间线类型
const getHistoryTimelineType = (status) => {
  const types = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning'
  }
  return types[status] || 'info'
}

// 历史状态标签类型
const getHistoryStatusType = (status) => {
  const types = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning'
  }
  return types[status] || 'info'
}

// 导出审核历史
const handleExportHistory = () => {
  if (!currentHistoryMerchant.value || merchantHistoryList.value.length === 0) {
    ElMessage.warning('暂无历史数据可导出')
    return
  }
  
  const merchant = currentHistoryMerchant.value
  
  // CSV表头
  const headers = ['审核次数', '审核状态', '审核类型', '提交时间', '审核时间', '审核人', '审核说明']
  
  // CSV数据行
  const rows = merchantHistoryList.value.map((item, index) => [
    item.periodLabel.replace(/[^0-9]/g, '') + '次',
    item.statusText,
    item.typeText,
    item.submitTime,
    item.reviewTime,
    item.reviewer,
    item.remark
  ])
  
  // 构建CSV内容
  const csvContent = [
    `商户名称：${merchant.name}`,
    `商户地址：${merchant.address}`,
    `联系电话：${merchant.phone}`,
    '',
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
  link.download = `${merchant.name}_审核历史_${new Date().toLocaleDateString('zh-CN')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success(`已导出 ${merchantHistoryList.value.length} 条审核记录`)
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除商户"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMerchant(row.id)
      ElMessage.success('删除成功')
      fetchList()
      fetchStats()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (formData.id) {
          await updateMerchant(formData.id, formData)
          ElMessage.success('编辑成功')
        } else {
          await addMerchant(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchList()
        fetchStats()
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 导入对话框
const importDialogVisible = ref(false)
const importLoading = ref(false)
const importFileList = ref([])
const importDistrict = ref('')

// 片区选项
const districtOptions = [
  { label: '开发区', value: 'development' },
  { label: '城关镇', value: 'town' },
  { label: '工业园区', value: 'industry' }
]

// 打开导入对话框
const handleImport = () => {
  // 子管理员默认使用自己的片区
  if (userInfo.value.role === 'sub' && userInfo.value.district) {
    importDistrict.value = userInfo.value.district
  } else {
    importDistrict.value = ''
  }
  importFileList.value = []
  importDialogVisible.value = true
}

// 处理文件选择
const handleFileChange = (file) => {
  const isExcel = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.raw.type === 'application/vnd.ms-excel' ||
                  file.name.endsWith('.xlsx') || 
                  file.name.endsWith('.xls')
  
  if (!isExcel) {
    ElMessage.error('请上传 Excel 文件（.xlsx 或 .xls）')
    return false
  }
  
  importFileList.value = [file]
  return true
}

// 下载导入模板
const handleDownloadTemplate = () => {
  // CSV模板内容
  const headers = ['商户名称', '负责人电话', '主理人电话', '地址', '经度', '纬度', '营业状态']
  const example = ['示例商户', '13800138000', '13900139000', 'XX路XX号', '116.397428', '39.90923', 'open']
  
  const csvContent = [
    headers.join(','),
    example.join(','),
    '',
    '说明：',
    '1. 营业状态可选值：open（营业中）、closed（临时关门）、stopped（已停业）',
    '2. 经度和纬度为可选字段，用于地图定位',
    '3. 导入时系统会自动将商户归属到当前管理员负责的片区'
  ].join('\n')
  
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = '商户导入模板.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('模板下载成功')
}

// 确认导入
const handleConfirmImport = async () => {
  if (importFileList.value.length === 0) {
    ElMessage.warning('请选择要导入的文件')
    return
  }
  
  // 总管理员必须选择片区
  if (userInfo.value.role === 'admin' && !importDistrict.value) {
    ElMessage.warning('请选择要导入的片区')
    return
  }
  
  importLoading.value = true
  
  try {
    // 模拟导入处理
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 这里应该调用实际的导入API，传入文件和片区信息
    // const formData = new FormData()
    // formData.append('file', importFileList.value[0].raw)
    // formData.append('district', importDistrict.value)
    // await importMerchants(formData)
    
    ElMessage.success(`导入成功！商户已归属到【${getDistrictLabel(importDistrict.value)}】`)
    importDialogVisible.value = false
    fetchList()
    fetchStats()
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请检查文件格式')
  } finally {
    importLoading.value = false
  }
}

// 获取片区标签
const getDistrictLabel = (value) => {
  const option = districtOptions.find(item => item.value === value)
  return option ? option.label : value
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  fetchList()
}

// 状态相关方法
const getStatusType = (status) => {
  const types = {
    open: 'success',
    closed: 'warning',
    stopped: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    open: '营业中',
    closed: '临时关门',
    stopped: '已停业'
  }
  return texts[status] || '未知'
}

const getWarningType = (level) => {
  // 兼容性处理：green映射到yellow，black映射到red
  if (level === 'green') level = 'yellow'
  if (level === 'black') level = 'red'
  const types = {
    normal: 'success',
    yellow: 'warning',
    red: 'danger'
  }
  return types[level] || 'info'
}

const getWarningText = (level) => {
  // 兼容性处理：green映射到yellow，black映射到red
  if (level === 'green') level = 'yellow'
  if (level === 'black') level = 'red'
  const texts = {
    normal: '正常',
    yellow: '黄色预警',
    red: '红色预警'
  }
  return texts[level] || '未知'
}

const getDaysClass = (days) => {
  if (days >= 15) return 'days-red'
  if (days >= 13) return 'days-yellow'
  return 'days-normal'
}

onMounted(() => {
  clearMerchantCache()
  fetchStats()
  fetchList()
})
</script>

<style scoped>
.merchant-container {
  width: 100%;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.days-normal {
  color: #67C23A;
}

.days-green {
  color: #67C23A;
}

.days-yellow {
  color: #E6A23C;
}

.days-red {
  color: #F56C6C;
}

.days-black {
  color: #303133;
  font-weight: 600;
}

/* 查看商户右滑栏样式 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  z-index: 2001;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.drawer-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  letter-spacing: 0.5px;
}

.drawer-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-close {
  cursor: pointer;
  color: #94a3b8;
  font-size: 24px;
  transition: all 0.3s;
  padding: 8px;
  border-radius: 50%;
}

.drawer-close:hover {
  color: #475569;
  background: #f1f5f9;
  transform: rotate(90deg);
}

.drawer-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  border: 1px solid #f0f2f5;
}

.detail-row:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #e2e8f0;
}

.detail-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  min-width: 100px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.detail-value {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.6;
}

/* 右侧滑入动画 */
.slide-from-right-enter-active,
.slide-from-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-from-right-enter-from,
.slide-from-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-from-right-enter-to,
.slide-from-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* 历史弹窗样式 */
.merchant-history-dialog {
  padding: 10px;
  max-height: 70vh;
  overflow-y: auto;
}

.history-merchant-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f2f5;
}

.history-merchant-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.history-merchant-meta {
  font-size: 14px;
  color: #909399;
}

.history-card-item {
  margin-bottom: 10px;
  border-radius: 8px;
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.history-card-type {
  font-size: 12px;
  color: #909399;
}

.history-card-info {
  margin-bottom: 15px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.history-photo-section {
  margin-top: 15px;
}

.history-photo-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.history-photo-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.history-photo {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.history-photo:hover {
  transform: scale(1.05);
}

/* 历史弹窗底部按钮样式 */
.history-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 批量导入对话框样式 */
.import-content {
  padding: 10px 0;
}

.import-section {
  margin-bottom: 24px;
}

.import-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-label .required {
  color: #f56c6c;
}

.section-label .el-icon {
  color: #909399;
  cursor: help;
}

.district-hint {
  margin-top: 8px;
  padding: 10px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
  font-size: 13px;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.district-hint .el-icon {
  color: #3b82f6;
}

.import-uploader {
  width: 100%;
}

.import-uploader :deep(.el-upload) {
  width: 100%;
}

.import-uploader :deep(.el-upload-dragger) {
  width: 100%;
  padding: 40px 20px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.3s;
}

.import-uploader :deep(.el-upload-dragger:hover) {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-icon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 8px;
}

.upload-link {
  color: #3b82f6;
  cursor: pointer;
  margin-left: 4px;
}

.upload-tip {
  font-size: 12px;
  color: #9ca3af;
}

.template-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.import-tips {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.8;
}

.import-tips p {
  margin: 4px 0;
}

.template-btn {
  align-self: flex-start;
}
</style>
