<template>
  <div class="home-dashboard">
    <!-- 日期显示 -->
    <div class="date-header">
      <div class="date-badge">
        <el-icon><Calendar /></el-icon>
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-row">
      <div class="stat-card blue">
        <div class="stat-label">总商户</div>
        <div class="stat-value">{{ stats.total.toLocaleString() }}</div>
        <div class="stat-trend up">
          <el-icon><ArrowUp /></el-icon>
          <span>12%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">在营中</div>
        <div class="stat-value">{{ stats.open.toLocaleString() }}</div>
        <div class="stat-tag active">活跃</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">
          <span class="dot yellow"></span>
          黄色预警
        </div>
        <div class="stat-value">{{ stats.yellowWarning }}</div>
        <el-icon class="warning-icon"><Warning /></el-icon>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">
          <span class="dot red"></span>
          红色预警
        </div>
        <div class="stat-value">{{ stats.redWarning.toString().padStart(2, '0') }}</div>
        <el-icon class="danger-icon"><CircleClose /></el-icon>
      </div>
    </div>

    <!-- 中间内容区 -->
    <div class="middle-section">
      <!-- 左侧：监控状态圆环仪表盘 -->
      <div class="chart-section">
        <div class="section-header">
          <div>
            <h3 class="section-title">商户状态分布</h3>
            <p class="section-subtitle">基于监控地图实时数据</p>
          </div>
        </div>
        <div class="chart-container">
          <div class="pie-chart-wrapper">
            <!-- 实心饼图 -->
            <svg viewBox="-120 -120 240 240" class="pie-svg" :class="{ 'pie-loaded': pieLoaded }">
              <!-- 绿色扇形 - 正常状态 -->
              <path
                :d="getPiePath(gaugeData.green, 0)"
                fill="#7dd3c0"
                class="pie-segment segment-green"
                :style="{ animationDelay: '0.1s' }"
              />
              <!-- 黄色扇形 - 预警状态 -->
              <path
                :d="getPiePath(gaugeData.yellow, gaugeData.green)"
                fill="#fcd34d"
                class="pie-segment segment-yellow"
                :style="{ animationDelay: '0.2s' }"
              />
              <!-- 红色扇形 - 立即整改 -->
              <path
                :d="getPiePath(gaugeData.red, gaugeData.green + gaugeData.yellow)"
                fill="#f87171"
                class="pie-segment segment-red"
                :style="{ animationDelay: '0.3s' }"
              />
              <!-- 灰色扇形 - 停业状态 -->
              <path
                :d="getPiePath(gaugeData.gray, gaugeData.green + gaugeData.yellow + gaugeData.red)"
                fill="#93c5fd"
                class="pie-segment segment-gray"
                :style="{ animationDelay: '0.4s' }"
              />
            </svg>
            <!-- 总商户数据在圆圈旁边 -->
            <div class="pie-side-data" :class="{ 'side-loaded': pieLoaded }">
              <div class="pie-total">{{ stats.total }}</div>
              <div class="pie-label">总商户</div>
            </div>
            <!-- 图例 -->
            <div class="pie-legend" :class="{ 'legend-loaded': pieLoaded }">
              <div class="legend-item" :style="{ animationDelay: '0.1s' }">
                <span class="legend-dot green"></span>
                <span class="legend-text">正常状态</span>
                <span class="legend-value">{{ gaugeData.green }}</span>
              </div>
              <div class="legend-item" :style="{ animationDelay: '0.2s' }">
                <span class="legend-dot yellow"></span>
                <span class="legend-text">预警风险</span>
                <span class="legend-value">{{ gaugeData.yellow }}</span>
              </div>
              <div class="legend-item" :style="{ animationDelay: '0.3s' }">
                <span class="legend-dot red"></span>
                <span class="legend-text">立即整改</span>
                <span class="legend-value">{{ gaugeData.red }}</span>
              </div>
              <div class="legend-item" :style="{ animationDelay: '0.4s' }">
                <span class="legend-dot gray"></span>
                <span class="legend-text">停业/关门</span>
                <span class="legend-value">{{ gaugeData.gray }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：快捷操作 + 行业风险画像 -->
      <div class="right-section">
        <!-- 快捷操作 -->
        <div class="quick-actions">
          <h4 class="small-title">快捷操作</h4>
          <div class="action-btn primary" @click="handleBatchImport">
            <div class="btn-icon">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="btn-text">
              <div class="main-text">批量导入</div>
              <div class="sub-text">Excel</div>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
          <div class="action-btn secondary" @click="handleCreateAudit">
            <div class="btn-icon">
              <el-icon><DocumentAdd /></el-icon>
            </div>
            <div class="btn-text">油烟清洗审核</div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 商户数据 -->
        <div class="risk-profile">
          <h4 class="small-title">商户数据</h4>
          <div class="risk-list">
            <div class="risk-item">
              <div class="risk-label">
                <span>正常商户</span>
                <span class="risk-value good">{{ stats.open }} 家</span>
              </div>
              <div class="progress-bar">
                <div class="progress good" :style="{ width: stats.total ? (stats.open / stats.total * 100) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="risk-item">
              <div class="risk-label">
                <span>黄色预警</span>
                <span class="risk-value warning">{{ stats.yellowWarning }} 家</span>
              </div>
              <div class="progress-bar">
                <div class="progress warning" :style="{ width: stats.total ? (stats.yellowWarning / stats.total * 100) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="risk-item">
              <div class="risk-label">
                <span>红色预警</span>
                <span class="risk-value danger">{{ stats.redWarning }} 家</span>
              </div>
              <div class="progress-bar">
                <div class="progress danger" :style="{ width: stats.total ? (stats.redWarning / stats.total * 100) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="risk-item">
              <div class="risk-label">
                <span>临时关门</span>
                <span class="risk-value">{{ gaugeData.gray }} 家</span>
              </div>
              <div class="progress-bar">
                <div class="progress blue" :style="{ width: stats.total ? (gaugeData.gray / stats.total * 100) + '%' : '0%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Calendar, ArrowUp, Warning, CircleClose,
  Upload, Download, ArrowRight, InfoFilled, DocumentAdd
} from '@element-plus/icons-vue'
import { getGlobalMerchants } from '@/utils/mock'
import { useUserStore } from '@/stores/user'

const router = useRouter()

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 当前日期时间
const currentDate = ref('')
let dateTimer = null

// 饼图加载动画状态
const pieLoaded = ref(false)

const updateDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[now.getDay()]
  currentDate.value = `${year}年${month}月${day}日 ${weekday}`
}

// 统一的商户状态分类函数
const classifyMerchant = (m) => {
  // 优先级：停业/关门 > 红色预警 > 黄色预警 > 正常
  if (m.status === 'suspended' || m.status === 'closed') {
    return 'gray'
  }
  if (m.warningLevel === 'red' || m.warningLevel === 'black' || m.daysSinceLastClean >= 15) {
    return 'red'
  }
  if (m.warningLevel === 'yellow' || (m.daysSinceLastClean >= 13 && m.daysSinceLastClean < 15)) {
    return 'yellow'
  }
  return 'green'
}

// 从商户管理获取数据（直接使用mock数据源，与商户管理页面一致）
const loadMerchantStats = () => {
  // 直接从mock获取所有商户数据（与商户管理页面使用同一数据源）
  let merchants = getGlobalMerchants()

  // 二级和负责人管理只能查看自己区域的商户
  if (userInfo.value.adminLevel !== 'level1' && userInfo.value.district) {
    merchants = merchants.filter(m => m.district === userInfo.value.district)
  }

  if (!merchants || merchants.length === 0) {
    return { total: 0, open: 0, pending: 0, yellowWarning: 0, redWarning: 0 }
  }

  // 使用统一分类函数统计
  const classified = merchants.map(classifyMerchant)

  const total = merchants.length
  // open状态：status为'open'表示营业中
  const open = merchants.filter(m => m.status === 'open').length
  // 待审核：黄色或红色预警的商户
  const pending = classified.filter(c => c === 'yellow' || c === 'red').length
  // 黄色预警
  const yellowWarning = classified.filter(c => c === 'yellow').length
  // 红色预警
  const redWarning = classified.filter(c => c === 'red').length

  return { total, open, pending, yellowWarning, redWarning }
}

const stats = computed(() => loadMerchantStats())

// 仪表盘数据 - 使用统一的分类函数
const gaugeData = computed(() => {
  let merchants = getGlobalMerchants()

  // 二级和负责人管理只能查看自己区域的商户
  if (userInfo.value.adminLevel !== 'level1' && userInfo.value.district) {
    merchants = merchants.filter(m => m.district === userInfo.value.district)
  }

  if (!merchants || merchants.length === 0) {
    return { green: 0, yellow: 0, red: 0, gray: 0 }
  }

  // 使用统一的分类函数
  const classified = merchants.map(classifyMerchant)

  return {
    green: classified.filter(c => c === 'green').length,
    yellow: classified.filter(c => c === 'yellow').length,
    red: classified.filter(c => c === 'red').length,
    gray: classified.filter(c => c === 'gray').length
  }
})

// 饼图计算函数
const getPiePath = (count, previousCount) => {
  const total = stats.value.total || 1
  const startAngle = (previousCount / total) * 2 * Math.PI - Math.PI / 2
  const endAngle = ((previousCount + count) / total) * 2 * Math.PI - Math.PI / 2

  const radius = 100
  const x1 = Math.cos(startAngle) * radius
  const y1 = Math.sin(startAngle) * radius
  const x2 = Math.cos(endAngle) * radius
  const y2 = Math.sin(endAngle) * radius

  const largeArcFlag = count / total > 0.5 ? 1 : 0
  
  return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
}

// 生命周期钩子
onMounted(() => {
  updateDate()
  dateTimer = setInterval(updateDate, 60000) // 每分钟更新一次
  
  // 触发饼图加载动画
  setTimeout(() => {
    pieLoaded.value = true
  }, 100)
})

onUnmounted(() => {
  if (dateTimer) {
    clearInterval(dateTimer)
  }
})

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中')
}

const handleCreateAudit = () => {
  router.push('/dashboard/audit')
  ElMessage.info('已跳转到审核中心')
}
</script>

<style scoped>
.home-dashboard {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100%;
}

/* 日期显示 */
.date-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #4b5563;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}


/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
}

.stat-card.blue {
  background: #fff;
  color: #1a1f2e;
}

.stat-card.warning {
  border-left: 4px solid #f59e0b;
}

.stat-card.danger {
  border-left: 4px solid #ef4444;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-card.blue .stat-label {
  color: #64748b;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a1f2e;
}

.stat-value.blue {
  color: #3b82f6;
}

.stat-card.blue .stat-value {
  color: #1a1f2e;
}

.stat-trend {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #10b981;
}

.stat-tag {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
}

.stat-tag.active {
  background: #dcfce7;
  color: #16a34a;
}

.stat-tag.pending {
  background: #fef3c7;
  color: #d97706;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.yellow {
  background: #f59e0b;
}

.dot.red {
  background: #ef4444;
}

.warning-icon, .danger-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 20px;
  color: #f59e0b;
}

.danger-icon {
  color: #ef4444;
}

/* 中间内容区 */
.middle-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-section {
  flex: 2;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1f2e;
  margin: 0 0 4px;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.chart-toggle {
  display: flex;
  gap: 8px;
}

.chart-toggle span {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: #6b7280;
}

.chart-toggle span.active {
  background: #1e3a5f;
  color: #fff;
}

/* 实心饼图 */
.chart-container {
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-chart-wrapper {
  display: flex;
  align-items: center;
  gap: 85px;
  position: relative;
}

.pie-svg {
  width: 370px;
  height: 370px;
}

/* 饼图加载动画 */
.pie-segment {
  transition: all 0.3s ease;
  cursor: pointer;
  opacity: 0;
  transform-origin: center;
  transform: scale(0);
}

.pie-loaded .pie-segment {
  animation: pieSegmentIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes pieSegmentIn {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.pie-segment:hover {
  opacity: 0.85;
  filter: brightness(1.1);
}

.pie-center {
  position: absolute;
  left: 170px;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  opacity: 0;
}

.pie-side-data {
  position: absolute;
  right: -80px;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  pointer-events: none;
  opacity: 0;
}

.side-loaded {
  animation: fadeIn 0.6s ease forwards;
  animation-delay: 0.5s;
}

.center-loaded {
  animation: centerIn 0.5s ease 0.5s forwards;
}

@keyframes centerIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.pie-total {
  font-size: 48px;
  font-weight: 700;
  color: #1a1f2e;
  line-height: 1.2;
}

.pie-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.pie-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 18px;
  opacity: 0;
  transform: translateX(20px);
}

.legend-loaded .legend-item {
  animation: legendItemIn 0.4s ease forwards;
}

@keyframes legendItemIn {
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.pie-legend .legend-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.pie-legend .legend-dot.green {
  background: #7dd3c0;
}

.pie-legend .legend-dot.yellow {
  background: #fcd34d;
}

.pie-legend .legend-dot.red {
  background: #f87171;
}

.pie-legend .legend-dot.gray {
  background: #93c5fd;
}

.pie-legend .legend-text {
  color: #4b5563;
  min-width: 100px;
}

.pie-legend .legend-value {
  font-weight: 600;
  color: #1a1f2e;
  margin-left: auto;
  font-size: 22px;
}

/* 快捷操作 */
.quick-actions, .risk-profile {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.risk-profile {
  flex: 1;
}

.small-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1f2e;
  margin: 0 0 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.action-btn:last-child {
  margin-bottom: 0;
}

.action-btn.primary {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: #fff;
}

.action-btn.secondary {
  background: #eff6ff;
  color: #2563eb;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
}

.action-btn.secondary .btn-icon {
  background: #dbeafe;
}

.btn-text {
  flex: 1;
}

.btn-text .main-text {
  font-size: 15px;
  font-weight: 600;
}

.btn-text .sub-text {
  font-size: 12px;
  opacity: 0.9;
}

.arrow {
  font-size: 18px;
}

/* 行业风险画像 */
.risk-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.risk-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 6px;
}

.risk-value {
  font-weight: 500;
}

.risk-value.good {
  color: #10b981;
}

.risk-value.warning {
  color: #f59e0b;
}

.risk-value.danger {
  color: #ef4444;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  border-radius: 3px;
}

.progress.good {
  background: #10b981;
}

.progress.warning {
  background: #f59e0b;
}

.progress.danger {
  background: #ef4444;
}

.progress.blue {
  background: #3b82f6;
}

/* 右侧区域 */
.right-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 实时运行动态 */
.runtime-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tabs span {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: #6b7280;
  background: #f3f4f6;
}

.filter-tabs span.active {
  background: #1e3a5f;
  color: #fff;
}

/* 表格样式 */
.table-container {
  margin-top: 16px;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  font-size: 14px;
}

.merchant-name {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: #1a1f2e;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.status-tag.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-tag.closed {
  background: #fee2e2;
  color: #dc2626;
}

.alert {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.alert-dot.green {
  background: #10b981;
}

.alert-dot.orange {
  background: #f59e0b;
}

.alert-dot.red {
  background: #ef4444;
}

.countdown {
  font-weight: 500;
  color: #1a1f2e;
}

.countdown.warning {
  color: #f59e0b;
}

.countdown.expired {
  color: #ef4444;
}
</style>
