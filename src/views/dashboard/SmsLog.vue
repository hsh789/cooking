<template>
  <div class="sms-log-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商户名称">
          <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="预警级别">
          <el-select v-model="searchForm.warningLevel" placeholder="请选择预警级别" clearable>
            <el-option label="绿色预警" value="green" />
            <el-option label="黄色预警" value="yellow" />
            <el-option label="红色预警" value="red" />
            <el-option label="黑色逾期" value="black" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="发送成功" value="success" />
            <el-option label="发送失败" value="failed" />
            <el-option label="发送中" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>导出日志
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF;">
              <el-icon :size="24"><Message /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">发送总数</div>
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
              <div class="stat-value">{{ stats.success }}</div>
              <div class="stat-label">发送成功</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #F56C6C;">
              <el-icon :size="24"><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.failed }}</div>
              <div class="stat-label">发送失败</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C;">
              <el-icon :size="24"><Loading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">发送中</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="merchantName" label="商户名称" min-width="150" />
        <el-table-column prop="phone" label="接收手机号" width="120" />
        <el-table-column prop="warningLevel" label="预警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getWarningType(row.warningLevel)">
              {{ getWarningText(row.warningLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="短信内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="发送状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sendTime" label="发送时间" width="160" />
        <el-table-column prop="receiveTime" label="接收时间" width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" link @click="handleView(row)">详情</el-button>
              <el-button v-if="row.status === 'failed'" type="warning" link @click="handleResend(row)">
                重发
              </el-button>
            </div>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="短信详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="商户名称">{{ currentRow.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentRow.owner }}</el-descriptions-item>
        <el-descriptions-item label="接收手机号">{{ currentRow.phone }}</el-descriptions-item>
        <el-descriptions-item label="预警级别">
          <el-tag :type="getWarningType(currentRow.warningLevel)">
            {{ getWarningText(currentRow.warningLevel) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="短信内容">{{ currentRow.content }}</el-descriptions-item>
        <el-descriptions-item label="发送状态">
          <el-tag :type="getStatusType(currentRow.status)">
            {{ getStatusText(currentRow.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ currentRow.sendTime }}</el-descriptions-item>
        <el-descriptions-item label="接收时间">{{ currentRow.receiveTime || '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.errorMsg" label="失败原因">
          <span style="color: #F56C6C;">{{ currentRow.errorMsg }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSmsLogList } from '@/api/merchant'

// 搜索表单
const searchForm = reactive({
  merchantName: '',
  phone: '',
  warningLevel: '',
  status: '',
  dateRange: []
})

// 统计数据
const stats = ref({
  total: 0,
  success: 0,
  failed: 0,
  pending: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 详情弹窗
const detailVisible = ref(false)
const currentRow = ref({})

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1]
    }
    delete params.dateRange
    const res = await getSmsLogList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
    stats.value = res.data.stats
  } catch (error) {
    console.error('获取短信日志失败:', error)
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
  searchForm.merchantName = ''
  searchForm.phone = ''
  searchForm.warningLevel = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.page = 1
  fetchList()
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 查看详情
const handleView = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

// 重发
const handleResend = (row) => {
  ElMessage.success('重发功能开发中')
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

// 预警级别
const getWarningType = (level) => {
  const types = {
    green: 'success',
    yellow: 'warning',
    red: 'danger',
    black: 'danger'
  }
  return types[level] || 'info'
}

const getWarningText = (level) => {
  const texts = {
    green: '绿色预警',
    yellow: '黄色预警',
    red: '红色预警',
    black: '黑色逾期'
  }
  return texts[level] || '未知'
}

// 发送状态
const getStatusType = (status) => {
  const types = {
    success: 'success',
    failed: 'danger',
    pending: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    success: '发送成功',
    failed: '发送失败',
    pending: '发送中'
  }
  return texts[status] || '未知'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.sms-log-container {
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

.table-card {
  border-radius: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.operation-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
