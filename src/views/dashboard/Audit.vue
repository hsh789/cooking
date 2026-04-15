<template>
  <div class="audit-center-new">
    <!-- 页面头部 -->
    <div class="page-header-audit">
      <div class="header-left">
        <h1 class="page-title-audit">监管审核队列</h1>
        <p class="page-desc-audit">审核工业油烟机清洗记录，确保符合通风规范，并完成商户认证。</p>
      </div>
      <div class="header-right">
        <!-- 右上角小卡片已删除 -->
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content-audit">
      <!-- 左侧审核列表 -->
      <div class="audit-list-section">
        <div class="section-header">
          <h3 class="section-title">待立即处理</h3>
          <div class="sort-action">
            <el-icon><Sort /></el-icon>
            <span>按上传时间排序</span>
          </div>
        </div>

        <!-- 审核卡片列表 -->
        <div class="audit-cards">
          <div 
            v-for="item in pagedAuditList" 
            :key="item.id" 
            class="audit-card"
            :class="{ 'urgent': item.frozenDays <= 5 && item.status === 'pending' }"
          >
            <!-- 左侧图片 -->
            <div class="card-image" @click="previewImages(item.materials)">
              <el-image 
                :src="item.materials[0] || 'https://via.placeholder.com/200x150?text=No+Image'" 
                fit="cover"
                class="main-image"
              />
              <div class="image-count" v-if="item.materials.length > 1">
                <el-icon><Picture /></el-icon>
                <span>{{ item.materials.length }}张照片</span>
              </div>
            </div>

            <!-- 中间信息 -->
            <div class="card-info">
              <div class="info-header">
                <h4 class="merchant-name-audit">{{ item.merchantName }}</h4>
                <span class="upload-time">{{ item.submitTime }}</span>
              </div>
              <div class="info-location">
                <el-icon><Location /></el-icon>
                <span>{{ getDistrictLabel(item.district) }}，{{ item.address || '中心区域' }}</span>
              </div>
              <div class="info-cleaner">
                <el-icon><User /></el-icon>
                <span>商户主理人电话：{{ item.phone || '待补充' }}</span>
              </div>
            </div>

            <!-- 右侧操作 -->
            <div class="card-actions">
              <el-button 
                class="btn-view" 
                @click="handleAudit(item)"
              >
                <el-icon><View /></el-icon>
                <span>审核</span>
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 右侧侧边栏 -->
      <div class="audit-sidebar">
        <!-- 待审核数量卡片 -->
        <div class="sidebar-card pending-card">
          <div class="pending-label">待审核数量</div>
          <div class="pending-value">{{ pendingCount }}</div>
          <div class="pending-desc">
            <el-icon><Clock /></el-icon>
            <span>需要立即处理的审核</span>
          </div>
        </div>

        <!-- 近期记录 -->
        <div class="sidebar-card history-card">
          <h4 class="sidebar-title">近期记录</h4>
          <div class="history-list">
            <div 
              v-for="record in recentRecords" 
              :key="record.id" 
              class="history-item"
            >
              <div class="history-status" :class="record.status">
                <div class="status-dot"></div>
              </div>
              <div class="history-info">
                <div class="history-name">{{ record.merchantName }}</div>
                <div class="history-time">{{ record.auditTime || record.submitTime }}</div>
              </div>
              <span class="history-tag" :class="record.status">
                {{ record.statusText }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 审核弹窗 -->
    <el-dialog v-model="auditVisible" title="清洗审核" width="700px" top="5vh">
      <div class="audit-dialog">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="商家名称">{{ currentAudit.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentAudit.phone }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentAudit.submitTime }}</el-descriptions-item>
          
          <!-- 清理方式 -->
          <el-descriptions-item label="清理方式">
            <div class="cleaning-type-display">
              <!-- 显示商家上传的清理方式 -->
              <el-tag :type="getCleaningTypeTagType(currentAudit.cleaningType)" size="small" style="margin-right: 12px;">
                {{ getCleaningTypeLabel(currentAudit.cleaningType) }}
              </el-tag>
              
              <!-- 第三方清理时只读显示清洗商名称 -->
              <span v-if="currentAudit.cleaningType === 'third_party'" class="provider-name-display">
                {{ currentAudit.serviceProviderName || '-' }}
              </span>
              
              <!-- 其他清理方式时只读显示输入的清洗商名称 -->
              <span v-if="currentAudit.cleaningType === 'other'" class="provider-name-display">
                {{ currentAudit.otherProviderName || '-' }}
              </span>
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="商户营业状态">
            <el-tag :type="getBusinessStatusType(currentAudit.merchantBusinessStatus)" size="small">
              {{ getBusinessStatusText(currentAudit.merchantBusinessStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时的清洗情况">
            <div class="cleaning-info">
              <div>未清洗天数：<span :class="getDaysClass(currentAudit.merchantDaysSinceLastClean)">{{ currentAudit.merchantDaysSinceLastClean }}天</span></div>
              <div>剩余天数：<span :class="getDaysClass(currentAudit.frozenDays)">{{ currentAudit.frozenDays }}天</span></div>
              <div>预警状态：<el-tag :type="getWarningTagType(currentAudit.merchantDaysSinceLastClean)" size="small">{{ getWarningText(currentAudit.merchantDaysSinceLastClean) }}</el-tag></div>
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="提交素材" v-if="currentAudit.materials && currentAudit.materials.length > 0">
            <div class="dialog-materials">
              <el-image v-for="(img, index) in currentAudit.materials" :key="index" :src="img" :preview-src-list="currentAudit.materials" fit="cover" style="width: 100px; height: 100px; margin-right: 10px;" />
            </div>
          </el-descriptions-item>



          
          <el-descriptions-item label="审核意见">
            <el-input v-model="auditRemark" type="textarea" :rows="4" placeholder="请输入审核意见" />
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="auditVisible = false">取消</el-button>
          <el-button type="primary" @click="handleApprove">通过</el-button>
          <el-button type="danger" @click="handleReject">驳回</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 查看历史弹窗 -->
    <el-dialog v-model="historyVisible" title="" width="800px">
      <template #header>
        <div class="history-dialog-header">
          <span class="dialog-title">商户审核历史</span>
          <el-button type="success" size="small" @click="handleExportHistory" :icon="Download">导出数据</el-button>
        </div>
      </template>
      <div class="history-dialog">
        <el-descriptions :column="1" border style="margin-bottom: 20px;">
          <el-descriptions-item label="商家名称">{{ currentAudit.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentAudit.contactName }} {{ currentAudit.phone }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentAudit.submitTime }}</el-descriptions-item>
        </el-descriptions>
        
        <h4>审核历史记录</h4>
        <el-table :data="currentAuditHistory" stripe style="width: 100%">
          <el-table-column prop="auditTime" label="审核时间" width="180" />
          <el-table-column prop="auditor" label="审核人" width="120" />
          <el-table-column prop="status" label="审核状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="审核意见" min-width="200" />
          <el-table-column prop="materials" label="提交照片" min-width="200">
            <template #default="scope">
              <div class="audit-materials" v-if="scope.row.materials && scope.row.materials.length > 0">
                <el-image 
                  v-for="(img, idx) in scope.row.materials" 
                  :key="idx" 
                  :src="img" 
                  :preview-src-list="scope.row.materials" 
                  fit="cover" 
                  style="width: 60px; height: 60px; margin-right: 8px; cursor: pointer;" 
                />
              </div>
              <span v-else>无照片</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="historyVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, Plus, Check, Close, Download, Location, Sort, Picture, User, TrendCharts, CircleCheck, Warning, View, Clock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 监听用户信息变化，更新审核列表
watch(userInfo, () => {
  total.value = filteredAuditList.value.length
}, { deep: true })

// 统计卡片数据 - 基于 filteredAuditList 动态计算
const pendingCount = computed(() => filteredAuditList.value.filter(item => item.status === 'pending').length)
const todayNewCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return filteredAuditList.value.filter(item => item.submitTime.startsWith(today)).length
})
const approvedCount = computed(() => filteredAuditList.value.filter(item => item.status === 'approved').length)
const rejectedCount = computed(() => filteredAuditList.value.filter(item => item.status === 'rejected').length)

// 筛选表单
const filterForm = reactive({
  district: '',
  type: '',
  date: '',
  merchantName: ''
})

// 当前标签页
const activeTab = ref('pending')

// 分页信息
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)

// 选中的项
const selectedRows = ref([])

// 清洗周期（天数T）
const CLEANING_CYCLE = 15

// 审核列表
const auditList = ref([
  // 开发区
  {
    id: 'A2024001',
    merchantId: 'M001',
    merchantName: '美味小厨餐厅',
    contactName: '张伟',
    phone: '13800138888',
    district: 'development',
    type: 'new_import',
    typeText: '新号导入',
    materials: [

      'https://picsum.photos/seed/audit1-3/300/300',
      'https://picsum.photos/seed/audit1-4/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2024-01-15 14:30',
    status: 'pending',
    statusText: '待审核',
    // 计时相关字段
    cleaningDate: null, // 商家填写的清洗日期
    frozenDays: 10, // 进入审核时的剩余天数（示例）
    merchantBusinessStatus: 'open', // 商户营业状态
    merchantDaysSinceLastClean: 5, // 商户未清洗天数（提交审核时）
    cleaningType: 'self_clean'
  },
  {
    id: 'A2024003',
    merchantId: 'M003',
    merchantName: '时尚服装店',
    contactName: '王强',
    phone: '13700137777',
    district: 'development',
    type: 'info_change',
    typeText: '信息变更',
    materials: [
      'https://picsum.photos/seed/audit3-1/300/300',
      'https://picsum.photos/seed/audit3-2/300/300',
      'https://picsum.photos/seed/audit3-3/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2024-01-15 12:20',
    status: 'approved',
    statusText: '已通过',
    cleaningDate: '2024-01-14',
    frozenDays: 8,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 7,
    cleaningType: 'third_party',
    serviceProviderName: '洁净清洗服务有限公司'
  },
  {
    id: 'A2024005',
    merchantId: 'M005',
    merchantName: '开发区大酒店',
    contactName: '刘总',
    phone: '13500135555',
    district: 'development',
    type: 'license_update',
    typeText: '执照更新',
    materials: [
      'https://picsum.photos/seed/audit5-1/300/300',
      'https://picsum.photos/seed/audit5-2/300/300',
      'https://picsum.photos/seed/audit5-3/300/300',
      'https://picsum.photos/seed/audit5-4/300/300',
      'https://picsum.photos/seed/audit5-5/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2024-01-15 10:10',
    status: 'pending',
    statusText: '待审核',
    cleaningDate: null,
    frozenDays: 12,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 3,
    cleaningType: 'third_party',
    serviceProviderName: '清新环保科技有限公司'
  },
  {
    id: 'A2024007',
    merchantId: 'M007',
    merchantName: '开发区超市',
    contactName: '张经理',
    phone: '13400134444',
    district: 'development',
    type: 'new_import',
    typeText: '新号导入',
    materials: [
      'https://picsum.photos/seed/audit7-1/300/300',
      'https://picsum.photos/seed/audit7-2/300/300'
    ],
    ocrStatus: 'warning',
    ocrStatusText: '警告',
    submitTime: '2024-01-14 16:30',
    status: 'processing',
    statusText: '审核中',
    cleaningDate: null,
    frozenDays: 16, // 已逾期
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 16, // 上传前已逾期
    timerFrozen: true, // 计时已冻结
    cleaningType: 'self_clean'
  },
  {
    id: 'A2024009',
    merchantId: 'M009',
    merchantName: '开发区KTV',
    contactName: '王老板',
    phone: '13300133333',
    district: 'development',
    type: 'info_change',
    typeText: '信息变更',
    materials: [
      'https://picsum.photos/seed/audit9-1/300/300',
      'https://picsum.photos/seed/audit9-2/300/300',
      'https://picsum.photos/seed/audit9-3/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2024-01-14 14:20',
    status: 'approved',
    statusText: '已通过',
    cleaningDate: '2024-01-13',
    frozenDays: 5,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 10,
    cleaningType: 'third_party'
  },
  // 城关镇
  {
    id: 'A2024002',
    merchantId: 'M002',
    merchantName: '阳光咖啡馆',
    contactName: '李娜',
    phone: '13900139999',
    district: 'town',
    type: 'license_update',
    typeText: '执照更新',
    materials: [
      'https://picsum.photos/seed/audit2-1/300/300',
      'https://picsum.photos/seed/audit2-2/300/300',
      'https://picsum.photos/seed/audit2-3/300/300',
      'https://picsum.photos/seed/audit2-4/300/300'
    ],
    ocrStatus: 'warning',
    ocrStatusText: '警告',
    submitTime: '2024-01-15 13:45',
    status: 'processing',
    statusText: '审核中',
    cleaningDate: null,
    frozenDays: 14,
    merchantBusinessStatus: 'closed', // 门店关门，暂停计时
    merchantDaysSinceLastClean: 1,
    timerPaused: true, // 计时暂停
    cleaningType: 'third_party',
    serviceProviderName: '绿色清洁服务公司'
  },
  {
    id: 'A2024006',
    merchantId: 'M006',
    merchantName: '城关镇小吃店',
    contactName: '李师傅',
    phone: '13200132222',
    district: 'town',
    type: 'new_import',
    typeText: '新号导入',
    materials: [
      'https://picsum.photos/seed/audit6-1/300/300',
      'https://picsum.photos/seed/audit6-2/300/300',
      'https://picsum.photos/seed/audit6-3/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2024-01-15 09:00',
    status: 'pending',
    statusText: '待审核',
    cleaningDate: null,
    frozenDays: 9,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 6,
    cleaningType: 'self_clean'
  },
  {
    id: 'A2024008',
    merchantId: 'M008',
    merchantName: '城关镇饭店',
    contactName: '赵老板',
    phone: '13100131111',
    district: 'town',
    type: 'license_update',
    typeText: '执照更新',
    materials: [
      'https://picsum.photos/seed/audit8-1/300/300',
      'https://picsum.photos/seed/audit8-2/300/300'
    ],
    ocrStatus: 'error',
    ocrStatusText: '失败',
    submitTime: '2024-01-14 15:45',
    status: 'rejected',
    statusText: '已驳回',
    cleaningDate: null,
    frozenDays: 15, // 提交时刚好15天（红色预警）
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 15,
    restoredDays: 15, // 驳回后恢复的天数
    cleaningType: 'third_party',
    serviceProviderName: '蓝天环保科技有限公司'
  },
  {
    id: 'A2024010',
    merchantId: 'M010',
    merchantName: '城关镇药店',
    contactName: '钱药师',
    phone: '13000130000',
    district: 'town',
    type: 'info_change',
    typeText: '信息变更',
    materials: [
      'https://picsum.photos/seed/audit10-1/300/300',
      'https://picsum.photos/seed/audit10-2/300/300',
      'https://picsum.photos/seed/audit10-3/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2024-01-14 13:10',
    status: 'approved',
    statusText: '已通过',
    cleaningDate: '2024-01-13',
    frozenDays: 4,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 11,
    cleaningType: 'self_clean'
  },
  {
    id: 'A2024011',
    merchantId: 'M011',
    merchantName: '城关镇理发店',
    contactName: '孙师傅',
    phone: '13900138888',
    district: 'town',
    type: 'new_import',
    typeText: '新号导入',
    materials: [
      'https://picsum.photos/seed/audit11-1/300/300',
      'https://picsum.photos/seed/audit11-2/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2024-01-14 11:50',
    status: 'pending',
    statusText: '待审核',
    cleaningDate: null,
    frozenDays: 11,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 4,
    cleaningType: 'other',
    otherProviderName: '阳光清洁服务有限公司'
  },
  // 工业园区
  {
    id: 'A2024004',
    merchantId: 'M004',
    merchantName: '健康养生馆',
    contactName: '陈丽',
    phone: '13600136666',
    district: 'industry',
    type: 'new_import',
    typeText: '新号导入',
    materials: [
      'https://picsum.photos/seed/audit4-1/300/300',
      'https://picsum.photos/seed/audit4-2/300/300',
      'https://picsum.photos/seed/audit4-3/300/300',
      'https://picsum.photos/seed/audit4-4/300/300'
    ],
    ocrStatus: 'error',
    ocrStatusText: '失败',
    submitTime: '2024-01-15 11:15',
    status: 'rejected',
    statusText: '已驳回',
    cleaningDate: null,
    frozenDays: 18, // 已严重逾期
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 18,
    restoredDays: 18,
    cleaningType: 'self_clean'
  },
  {
    id: 'A2024012',
    merchantId: 'M012',
    merchantName: '工业园区食堂',
    contactName: '周经理',
    phone: '13800137777',
    district: 'industry',
    type: 'license_update',
    typeText: '执照更新',
    materials: [
      'https://picsum.photos/seed/audit12-1/300/300',
      'https://picsum.photos/seed/audit12-2/300/300',
      'https://picsum.photos/seed/audit12-3/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2024-01-14 10:30',
    status: 'pending',
    statusText: '待审核',
    cleaningDate: null,
    frozenDays: 7,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 8,
    cleaningType: 'third_party',
    serviceProviderName: '清新环保科技有限公司'
  },
  {
    id: 'A2024013',
    merchantId: 'M013',
    merchantName: '工业园区便利店',
    contactName: '吴老板',
    phone: '13700136666',
    district: 'industry',
    type: 'info_change',
    typeText: '信息变更',
    materials: [
      'https://picsum.photos/seed/audit13-1/300/300',
      'https://picsum.photos/seed/audit13-2/300/300'
    ],
    ocrStatus: 'warning',
    ocrStatusText: '警告',
    submitTime: '2024-01-13 16:20',
    status: 'processing',
    statusText: '审核中',
    cleaningDate: null,
    frozenDays: 13,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 2,
    timerFrozen: true
  },
  {
    id: 'A2024014',
    merchantId: 'M014',
    merchantName: '工业园区餐厅',
    contactName: '郑经理',
    phone: '13600135555',
    district: 'industry',
    type: 'new_import',
    typeText: '新号导入',
    materials: [
      'https://picsum.photos/seed/audit14-1/300/300',
      'https://picsum.photos/seed/audit14-2/300/300',
      'https://picsum.photos/seed/audit14-3/300/300',
      'https://picsum.photos/seed/audit14-4/300/300',
      'https://picsum.photos/seed/audit14-5/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2024-01-13 14:10',
    status: 'approved',
    statusText: '已通过',
    cleaningDate: '2024-01-12',
    frozenDays: 6,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 9,
    cleaningType: 'self_clean'
  },
  {
    id: 'A2024015',
    merchantName: '工业园区咖啡厅',
    contactName: '王经理',
    phone: '13500134444',
    district: 'industry',
    type: 'license_update',
    typeText: '执照更新',
    materials: [
      'https://picsum.photos/seed/audit15-1/300/300',
      'https://picsum.photos/seed/audit15-2/300/300',
      'https://picsum.photos/seed/audit15-3/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2026-01-13 12:00',
    status: 'pending',
    statusText: '待审核'
  },
  {
    id: 'A2024016',
    merchantId: 'M016',
    merchantName: '时尚餐厅',
    contactName: '陈经理',
    phone: '13500135555',
    district: 'development',
    type: 'new_import',
    typeText: '新号导入',
    materials: [
      'https://picsum.photos/seed/audit16-1/300/300',
      'https://picsum.photos/seed/audit16-2/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2026-01-12 16:30',
    status: 'approved',
    statusText: '已通过',
    cleaningDate: '2026-01-11',
    frozenDays: 5,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 10,
    cleaningType: 'self_clean'
  },
  {
    id: 'A2024017',
    merchantId: 'M017',
    merchantName: '阳光大酒店',
    contactName: '刘经理',
    phone: '13400134444',
    district: 'town',
    type: 'info_change',
    typeText: '信息变更',
    materials: [
      'https://picsum.photos/seed/audit17-1/300/300',
      'https://picsum.photos/seed/audit17-2/300/300',
      'https://picsum.photos/seed/audit17-3/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2026-01-12 14:20',
    status: 'rejected',
    statusText: '已驳回',
    frozenDays: 12,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 3,
    cleaningType: 'third_party',
    serviceProviderName: '洁净清洗服务有限公司'
  },
  {
    id: 'A2024018',
    merchantId: 'M018',
    merchantName: '美味烧烤店',
    contactName: '赵老板',
    phone: '13300133333',
    district: 'industry',
    type: 'new_import',
    typeText: '新号导入',
    materials: [
      'https://picsum.photos/seed/audit18-1/300/300',
      'https://picsum.photos/seed/audit18-2/300/300'
    ],
    ocrStatus: 'warning',
    ocrStatusText: '警告',
    submitTime: '2026-01-11 11:00',
    status: 'approved',
    statusText: '已通过',
    cleaningDate: '2026-01-10',
    frozenDays: 7,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 8,
    cleaningType: 'other',
    otherProviderName: '本地清洗服务部'
  },
  {
    id: 'A2024019',
    merchantId: 'M019',
    merchantName: '家常小炒',
    contactName: '孙师傅',
    phone: '13200132222',
    district: 'development',
    type: 'license_update',
    typeText: '执照更新',
    materials: [
      'https://picsum.photos/seed/audit19-1/300/300',
      'https://picsum.photos/seed/audit19-2/300/300',
      'https://picsum.photos/seed/audit19-3/300/300',
      'https://picsum.photos/seed/audit19-4/300/300'
    ],
    ocrStatus: 'success',
    ocrStatusText: '成功',
    submitTime: '2026-01-11 09:30',
    status: 'approved',
    statusText: '已通过',
    cleaningDate: '2026-01-10',
    frozenDays: 4,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 11,
    cleaningType: 'self_clean'
  },
  {
    id: 'A2024020',
    merchantId: 'M020',
    merchantName: '海鲜大排档',
    contactName: '钱老板',
    phone: '13100131111',
    district: 'town',
    type: 'new_import', 
    typeText: '新号导入',
    materials: [
      'https://picsum.photos/seed/audit20-1/300/300',
      'https://picsum.photos/seed/audit20-2/300/300'
    ],
    ocrStatus: 'error',
    ocrStatusText: '失败',
    submitTime: '2026-01-10 15:45',
    status: 'rejected',
    statusText: '已驳回',
    frozenDays: 15,
    merchantBusinessStatus: 'open',
    merchantDaysSinceLastClean: 0,
    cleaningType: 'self_clean'
  }
])

// 默认清洗商列表
const defaultProviderList = [
  {
    id: 1,
    name: '洁净清洗服务有限公司',
    contact: '王经理',
    phone: '13800138001',
    address: '北京市朝阳区建国路88号',
    district: 'development',
    createdAt: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    name: '清新环保科技有限公司',
    contact: '李经理',
    phone: '13800138002',
    address: '北京市海淀区中关村大街1号',
    district: 'town',
    createdAt: '2024-01-16 14:30:00'
  },
  {
    id: 3,
    name: '绿色清洁服务公司',
    contact: '张经理',
    phone: '13800138003',
    address: '北京市东城区王府井大街1号',
    district: 'development',
    createdAt: '2024-01-17 09:15:00'
  },
  {
    id: 4,
    name: '蓝天环保科技有限公司',
    contact: '刘经理',
    phone: '13800138004',
    address: '北京市西城区西单大街1号',
    district: 'industry',
    createdAt: '2024-01-18 15:30:00'
  }
]

// 从 localStorage 加载清洗商列表
const loadProviderListFromStorage = () => {
  try {
    const stored = localStorage.getItem('serviceProviderList')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('加载清洗商列表失败:', e)
  }
  return [...defaultProviderList]
}

// 保存清洗商列表到 localStorage
const saveProviderListToStorage = (list) => {
  try {
    localStorage.setItem('serviceProviderList', JSON.stringify(list))
  } catch (e) {
    console.error('保存清洗商列表失败:', e)
  }
}

// 第三方清洗商列表（来自 localStorage 或默认值）
const providerList = ref(loadProviderListFromStorage())

// 过滤后的审核列表（子管理员只能看到自己区域的审核）
const filteredAuditList = computed(() => {
  if (userInfo.value.role === 'admin') {
    return auditList.value
  }
  return auditList.value.filter(item => item.district === userInfo.value.district)
})

// 分页后的审核列表
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * 10
  const end = start + 10
  return filteredAuditList.value.slice(start, end)
})

// 用于新UI的审核列表（显示所有记录）
const pagedAuditList = computed(() => {
  const filtered = filteredAuditList.value
  // 更新总数
  total.value = filtered.length
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 最近审核记录
const recentRecords = computed(() => {
  return auditList.value
    .filter(item => item.status !== 'pending')
    .slice(0, 10)
})

// 获取相对时间
const getRelativeTime = (timeStr) => {
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return '很久前'
}

// 处理单个审核通过（用于弹窗）
const handleApprove = () => {
  const now = new Date()
  
  // 更新审核状态
  currentAudit.value.status = 'approved'
  currentAudit.value.statusText = '已通过'
  currentAudit.value.auditTime = now.toLocaleString('zh-CN')
  currentAudit.value.auditRemark = auditRemark.value
  
  // 计时逻辑：以当前日期为新起点，重置计时
  currentAudit.value.merchantDaysSinceLastClean = 0
  currentAudit.value.frozenDays = CLEANING_CYCLE
  currentAudit.value.timerFrozen = false
  currentAudit.value.timerPaused = false
  
  ElMessage.success('审核通过，计时周期已重置')
  auditVisible.value = false
  // 刷新列表
  updateAuditList()
}

// 处理单个审核驳回（用于弹窗）
const handleReject = () => {
  // 更新审核状态
  currentAudit.value.status = 'rejected'
  currentAudit.value.statusText = '已驳回'
  currentAudit.value.auditTime = new Date().toLocaleString('zh-CN')
  currentAudit.value.auditRemark = auditRemark.value
  
  // 计时逻辑：恢复至上传前的剩余天数与预警状态
  // 恢复商户的未清洗天数为提交时的天数
  currentAudit.value.restoredDays = currentAudit.value.merchantDaysSinceLastClean
  currentAudit.value.timerFrozen = false
  currentAudit.value.timerPaused = false
  
  // 提示预警状态
  const warningText = getWarningText(currentAudit.value.merchantDaysSinceLastClean)
  if (currentAudit.value.merchantDaysSinceLastClean >= CLEANING_CYCLE) {
    ElMessage.warning(`审核驳回，计时器恢复，当前状态：${warningText}`)
  } else {
    ElMessage.success(`审核驳回，计时器恢复，当前状态：${warningText}`)
  }
  
  auditVisible.value = false
  // 刷新列表
  updateAuditList()
}

// 预览图片
const previewImages = (materials) => {
  // 可以调用Element Plus的图片预览组件
  console.log('Preview images:', materials)
}

// 查看全部历史
const handleViewAllHistory = () => {
  activeTab.value = 'history'
}

// 审核弹窗
const auditVisible = ref(false)
const currentAudit = ref({})
const auditRemark = ref('')

// 查看历史弹窗
const historyVisible = ref(false)
const currentAuditHistory = ref([])

// 生命周期
onMounted(() => {
  total.value = filteredAuditList.value.length
})

// 选择变化
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// 批量通过 - 重置计时周期
const handleBatchApprove = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要操作的记录')
    return
  }
  
  const now = new Date()
  selectedRows.value.forEach(row => {
    // 批量通过使用当前日期作为清洗日期
    row.cleaningDate = now.toISOString().split('T')[0]
    row.status = 'approved'
    row.statusText = '已通过'
    row.auditTime = now.toLocaleString('zh-CN')
    
    // 重置计时
    row.merchantDaysSinceLastClean = 0
    row.frozenDays = CLEANING_CYCLE
    row.timerFrozen = false
    row.timerPaused = false
    
    // 更新列表
    const index = auditList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      auditList.value[index] = { ...row }
    }
  })
  
  ElMessage.success(`批量通过成功，已重置 ${selectedRows.value.length} 条记录的计时周期`)
  selectedRows.value = []
}

// 批量驳回 - 恢复计时器
const handleBatchReject = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要操作的记录')
    return
  }
  
  const now = new Date()
  let overdueCount = 0
  
  selectedRows.value.forEach(row => {
    row.status = 'rejected'
    row.statusText = '已驳回'
    row.auditTime = now.toLocaleString('zh-CN')
    
    // 恢复计时
    row.restoredDays = row.merchantDaysSinceLastClean
    row.timerFrozen = false
    row.timerPaused = false
    
    if (row.merchantDaysSinceLastClean >= CLEANING_CYCLE) {
      overdueCount++
    }
    
    // 更新列表
    const index = auditList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      auditList.value[index] = { ...row }
    }
  })
  
  if (overdueCount > 0) {
    ElMessage.warning(`批量驳回成功，其中 ${overdueCount} 条记录已逾期，请督促及时整改`)
  } else {
    ElMessage.success(`批量驳回成功，已恢复 ${selectedRows.value.length} 条记录的计时器`)
  }
  selectedRows.value = []
}

// 导出报表
const handleExport = () => {
  ElMessage.info('导出报表功能开发中')
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  // 这里可以添加分页逻辑
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}

// 审核
const handleAudit = (row) => {
  currentAudit.value = { ...row }
  auditRemark.value = ''
  auditVisible.value = true
}

// 查看历史
const handleViewHistory = (row) => {
  currentAudit.value = { ...row }
  // 生成模拟的审核历史数据
  currentAuditHistory.value = [
    {
      id: 1,
      auditTime: '2024-01-15 15:30',
      auditor: '管理员1',
      status: 'processing',
      statusText: '审核中',
      remark: '正在审核中，请耐心等待',
      materials: row.materials || ['https://picsum.photos/seed/audit1-1/200/200', 'https://picsum.photos/seed/audit1-2/200/200']
    },
    {
      id: 2,
      auditTime: '2026-01-15 16:00',
      auditor: '管理员2',
      status: 'approved',
      statusText: '已通过',
      remark: '审核通过，资料齐全',
      materials: row.materials || ['https://picsum.photos/seed/audit2-1/200/200', 'https://picsum.photos/seed/audit2-2/200/200']
    }
  ]
  historyVisible.value = true
}

// 导出审核历史数据
const handleExportHistory = () => {
  if (!currentAuditHistory.value || currentAuditHistory.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  // 构建CSV内容
  const headers = ['审核时间', '审核人', '审核状态', '审核意见']
  const rows = currentAuditHistory.value.map(item => [
    item.auditTime,
    item.auditor,
    item.statusText,
    item.remark
  ])
  
  // 添加商户信息头部
  const merchantInfo = [
    ['商户审核历史导出'],
    ['导出时间', new Date().toLocaleString()],
    ['商家名称', currentAudit.value.merchantName || ''],
    ['联系人', currentAudit.value.contactName || ''],
    ['电话', currentAudit.value.phone || ''],
    ['申请类型', currentAudit.value.typeText || ''],
    ['提交时间', currentAudit.value.submitTime || ''],
    [],
    headers
  ]
  
  const csvContent = [...merchantInfo, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  
  // 创建下载链接
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = `审核历史_${currentAudit.value.merchantName || '商户'}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('导出成功')
}

// 定位
const handleLocate = (row) => {
  ElMessage.info('定位功能开发中')
}

// 获取清理方式的标签类型
const getCleaningTypeTagType = (cleaningType) => {
  const types = {
    self_clean: 'success',
    third_party: 'warning',
    other: 'info'
  }
  return types[cleaningType] || 'info'
}

// 获取清理方式的标签文本
const getCleaningTypeLabel = (cleaningType) => {
  const labels = {
    self_clean: '自行清理',
    third_party: '第三方清理',
    other: '其他'
  }
  return labels[cleaningType] || '未知'
}

// 获取片区标签
const getDistrictLabel = (district) => {
  const labels = {
    'development': '开发区',
    'town': '城关镇',
    'industry': '工业区',
    'all': '所有区域'
  }
  return labels[district] || district || '未知区域'
}

// 获取显示的清洗商名称
const getDisplayProviderName = () => {
  if (currentAudit.value.cleaningType === 'third_party') {
    return currentAudit.value.serviceProviderName
  } else if (currentAudit.value.cleaningType === 'other') {
    return currentAudit.value.otherProviderName
  }
  return null
}

// 添加其他清洗商到列表
const handleAddOtherProvider = () => {
  const name = currentAudit.value.otherProviderName?.trim()
  const district = currentAudit.value.otherProviderDistrict
  if (!name) {
    ElMessage.warning('请输入清洗商公司名称')
    return
  }
  if (!district) {
    ElMessage.warning('请选择区域')
    return
  }
  
  // 检查是否已存在同名公司
  const exists = providerList.value.some(p => p.name === name)
  if (exists) {
    ElMessage.warning('该清洗商已存在于列表中')
    return
  }
  
  // 创建新清洗商对象并添加到列表
  const newProvider = {
    id: Date.now(), // 使用时间戳作为唯一ID
    name: name,
    contact: '待补充',
    phone: '待补充',
    address: '待补充',
    district: district,
    createdAt: new Date().toLocaleString('zh-CN')
  }
  providerList.value.push(newProvider)
  
  // 保存到 localStorage（与清洗商管理页面共享）
  saveProviderListToStorage(providerList.value)
  
  // 自动选中该清洗商
  currentAudit.value.serviceProviderName = name
  currentAudit.value.cleaningType = 'third_party'
  
  ElMessage.success(`已将 "${name}" 添加到清洗商管理列表`)
}


// 更新审核列表
const updateAuditList = () => {
  const index = auditList.value.findIndex(item => item.id === currentAudit.value.id)
  if (index !== -1) {
    auditList.value[index] = { ...currentAudit.value }
  }
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    'new_import': 'primary',
    'license_update': 'warning',
    'info_change': 'info'
  }
  return typeMap[type] || 'info'
}

// 获取OCR状态标签类型
const getOCRTagType = (status) => {
  const statusMap = {
    'success': 'success',
    'warning': 'warning',
    'error': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'processing': 'info',
    'approved': 'success',
    'rejected': 'danger'
  }
  return statusMap[status] || 'info'
}

// ================== 计时状态相关函数 ==================

// 获取计时状态文本
const getTimerStatusText = (audit) => {
  // 已审核的记录
  if (audit.status === 'approved') {
    return '已通过 - 计时已重置'
  }
  if (audit.status === 'rejected') {
    return '已驳回 - 计时已恢复'
  }
  
  // 审核中的记录
  if (audit.status === 'processing' || audit.timerFrozen) {
    return '计时冻结（审核中）'
  }
  
  // 根据商户营业状态判断
  if (audit.merchantBusinessStatus === 'closed' || audit.timerPaused) {
    return '计时暂停（门店关门）'
  }
  if (audit.merchantBusinessStatus === 'suspended') {
    return '计时暂停（已停业）'
  }
  if (audit.merchantBusinessStatus === 'open') {
    return '正常计时（营业中）'
  }
  
  return '未知状态'
}

// 获取计时状态标签类型
const getTimerStatusType = (audit) => {
  if (audit.status === 'approved') return 'success'
  if (audit.status === 'rejected') return 'danger'
  if (audit.timerFrozen || audit.status === 'processing') return 'warning'
  if (audit.timerPaused || audit.merchantBusinessStatus === 'closed' || audit.merchantBusinessStatus === 'suspended') return 'info'
  return 'info'
}

// 获取商户营业状态文本
const getBusinessStatusText = (status) => {
  const statusMap = {
    'open': '营业中',
    'closed': '临时关门',
    'suspended': '已停业'
  }
  return statusMap[status] || '未知'
}

// 获取商户营业状态标签类型
const getBusinessStatusType = (status) => {
  const typeMap = {
    'open': 'success',
    'closed': 'warning',
    'suspended': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取预警文本
const getWarningText = (days) => {
  if (days >= CLEANING_CYCLE) return '红色预警'
  if (days >= 13) return '黄色预警'
  return '正常'
}

// 获取预警标签类型
const getWarningTagType = (days) => {
  if (days >= CLEANING_CYCLE) return 'danger'
  if (days >= 13) return 'warning'
  return 'success'
}

// 获取天数样式类
const getDaysClass = (days) => {
  if (days >= CLEANING_CYCLE) return 'days-danger'
  if (days >= 13) return 'days-warning'
  if (days <= 5) return 'days-safe'
  return ''
}
</script>

<style scoped>
.audit-center-new {
  width: 100%;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%);
  min-height: calc(100vh - 60px);
}

/* 页面头部 */
.page-header-audit {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title-audit {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.page-desc-audit {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* 标签切换 */
.tab-tabs {
  display: flex;
  gap: 8px;
  background: #fff;
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item:hover {
  background: #f3f4f6;
}

.tab-item.active {
  background: #1a1a2e;
  color: #fff;
}

.tab-badge {
  background: #3b82f6;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 主内容区域 */
.main-content-audit {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

/* 左侧审核列表区域 */
.audit-list-section {
  background: transparent;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.sort-action {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
}

/* 审核卡片 */
.audit-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audit-card {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 20px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}

.audit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.audit-card.urgent {
  border-left: 4px solid #ef4444;
}

/* 图片区域 */
.card-image {
  position: relative;
  width: 200px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
}

/* 信息区域 */
.card-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.merchant-name-audit {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.upload-time {
  font-size: 13px;
  color: #9ca3af;
}

.info-location,
.info-cleaner {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
}

.info-location .el-icon,
.info-cleaner .el-icon {
  color: #3b82f6;
  font-size: 16px;
}

/* 操作按钮区域 */
.card-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
  padding: 4px 0;
}

.btn-view {
  background: #3b82f6;
  border: none;
  color: #fff;
  padding: 12px 0;
  border-radius: 10px;
  width: 120px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s;
  margin: 0;
}

.btn-view:hover {
  background: #2563eb;
  transform: scale(1.02);
}

.btn-history {
  background: #8b5cf6;
  border: none;
  color: #fff;
  padding: 12px 0;
  border-radius: 10px;
  width: 120px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s;
  margin: 0;
}

.btn-history:hover {
  background: #7c3aed;
  transform: scale(1.02);
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  margin-top: 10px;
}

/* 右侧侧边栏 */
.audit-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 24px;
  height: fit-content;
  align-self: flex-start;
}

.sidebar-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* 待审核数量卡片 */
.pending-card {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.pending-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.pending-value {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
}

.pending-desc {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.score-bg-icon {
  position: absolute;
  right: 20px;
  bottom: 20px;
  font-size: 80px;
  color: rgba(255, 255, 255, 0.1);
}

/* 最近记录 */
.history-card {
  background: #fff;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
}

.history-list::-webkit-scrollbar {
  width: 4px;
}

.history-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f9fafb;
}

.history-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.history-status.approved .status-dot {
  background: #10b981;
}

.history-status.rejected .status-dot {
  background: #ef4444;
}

.history-info {
  flex: 1;
}

.history-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
}

.history-time {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.history-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.history-tag.approved {
  background: #d1fae5;
  color: #059669;
}

.history-tag.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.btn-view-all {
  width: 100%;
  margin-top: 16px;
  color: #3b82f6;
  font-weight: 500;
}

.history-status.approved .status-dot {
  background: #10b981;
}

.history-status.rejected .status-dot {
  background: #ef4444;
}

.history-info {
  flex: 1;
}

.history-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
}

.history-time {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.history-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.history-tag.approved {
  background: #d1fae5;
  color: #059669;
}

.history-tag.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.btn-view-all {
  width: 100%;
  margin-top: 16px;
  color: #3b82f6;
  font-weight: 500;
}

/* 监管建议 */
.advice-card {
  background: #e0e7ff;
}

.advice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 12px;
}

.advice-header .el-icon {
  font-size: 18px;
}

.advice-text {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .main-content-audit {
    grid-template-columns: 1fr;
  }
  
  .audit-sidebar {
    order: -1;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .sidebar-card {
    flex: 1;
    min-width: 280px;
  }
}

@media screen and (max-width: 768px) {
  .audit-center-new {
    padding: 16px;
  }
  
  .page-header-audit {
    flex-direction: column;
    gap: 16px;
  }
  
  .page-title-audit {
    font-size: 24px;
  }
  
  .audit-card {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card-image {
    width: 100%;
    height: 200px;
  }
  
  .card-actions {
    flex-direction: row;
    justify-content: flex-start;
  }
}

/* 保留的旧样式 */
.audit-dialog {
  padding: 10px 0;
  max-height: 75vh;
  overflow-y: auto;
}

.cleaning-type-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-name-display {
  color: #606266;
  font-size: 14px;
}

.cleaning-type-edit {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-provider {
  margin-left: 10px;
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}

.audit-materials {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.history-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.history-dialog-header .dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.days-danger {
  color: #f56c6c;
  font-weight: bold;
}

.days-warning {
  color: #e6a23c;
  font-weight: bold;
}

.days-safe {
  color: #67c23a;
}

.date-hint {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

:deep(.audit-dialog .el-descriptions__label) {
  width: 120px;
  background-color: #f5f7fa;
}

:deep(.audit-dialog .el-descriptions__content) {
  padding: 12px;
}
</style>