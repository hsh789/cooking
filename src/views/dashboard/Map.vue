<template>
  <div class="map-monitor-container">
    <!-- 顶部搜索栏 -->
    <div class="map-header">
      <div class="search-box">
        <el-icon class="search-icon"><Search /></el-icon>
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="搜索商户ID、名称或街道..." 
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="header-stats">
        <div class="coverage-badge">
          <span class="dot green"></span>
          <span>活跃覆盖率: 94.2%</span>
        </div>
        <div class="header-actions">
          <el-icon class="action-icon" @click="toggleFilter"><Filter /></el-icon>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="map-main-content">
      <!-- 地图区域 -->
      <div class="map-area">
        <div id="amap-container" class="amap"></div>
        
        <!-- 图例 -->
        <div class="map-legend-new">
          <div class="legend-title">图例说明</div>
          <div class="legend-item">
            <span class="legend-dot green-dot"></span>
            <span>正常状态</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot orange-dot"></span>
            <span>预警/风险</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot red-dot"></span>
            <span>立即整改</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot blue-dot"></span>
            <span>临时关门</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot gray-dot"></span>
            <span>已停业</span>
          </div>
        </div>

        <!-- 筛选面板 - 可展开 -->
        <div v-if="showFilter" class="filter-panel-float">
          <div class="filter-header">
            <span>地图筛选</span>
            <el-icon class="close-icon" @click="toggleFilter"><Close /></el-icon>
          </div>
          <div class="filter-content">
            <div class="filter-row">
              <span class="filter-label">预警状态</span>
              <div class="filter-buttons">
                <el-button 
                  :type="filter.warningLevel === 'all' ? 'primary' : 'default'" 
                  size="small"
                  @click="setWarningLevel('all')"
                >全部</el-button>
                <el-button 
                  :type="filter.warningLevel === 'normal' ? 'info' : 'default'" 
                  size="small"
                  @click="setWarningLevel('normal')"
                >正常</el-button>
                <el-button 
                  :type="filter.warningLevel === 'yellow' ? 'warning' : 'default'" 
                  size="small"
                  @click="setWarningLevel('yellow')"
                >黄色预警</el-button>
                <el-button 
                  :type="filter.warningLevel === 'red' ? 'danger' : 'default'" 
                  size="small"
                  @click="setWarningLevel('red')"
                >红色预警</el-button>
              </div>
            </div>
            <div class="filter-row">
              <span class="filter-label">营业状态</span>
              <div class="filter-buttons">
                <el-button 
                  :type="filter.businessStatus === 'all' ? 'primary' : 'default'" 
                  size="small"
                  @click="setBusinessStatus('all')"
                >全部</el-button>
                <el-button 
                  :type="filter.businessStatus === 'closed' ? 'primary' : 'default'" 
                  size="small"
                  @click="setBusinessStatus('closed')"
                >临时关门</el-button>
                <el-button 
                  :type="filter.businessStatus === 'suspended' ? 'primary' : 'default'" 
                  size="small"
                  @click="setBusinessStatus('suspended')"
                >已停业</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧片区概览面板 -->
      <div class="area-overview-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">片区概览</h3>
            <p class="panel-subtitle">徐汇监管B区</p>
          </div>
          <el-icon class="close-panel-icon" @click="togglePanel"><Close /></el-icon>
        </div>

        <!-- 统计卡片 -->
        <div class="panel-stats">
          <div class="panel-stat-card safe">
            <div class="stat-name">安全</div>
            <div class="stat-num">{{ areaStats.safe }}</div>
          </div>
          <div class="panel-stat-card warning">
            <div class="stat-name">预警</div>
            <div class="stat-num">{{ areaStats.warning }}</div>
          </div>
          <div class="panel-stat-card overdue">
            <div class="stat-name">逾期</div>
            <div class="stat-num">{{ areaStats.overdue }}</div>
          </div>
          <div class="panel-stat-card closed">
            <div class="stat-name">停业</div>
            <div class="stat-num">{{ areaStats.closed }}</div>
          </div>
        </div>

        <!-- 商户列表标题 -->
        <div class="merchant-list-header">
          <span>周边商户 (聚合组 {{ filteredMerchants.length }})</span>
        </div>

        <!-- 商户列表 -->
        <div class="merchant-list">
          <div 
            v-for="merchant in displayMerchants" 
            :key="merchant.id" 
            class="merchant-item"
            :class="getMerchantStatusClass(merchant)"
            @click="selectMerchant(merchant)"
          >
            <div class="merchant-info">
              <div class="merchant-name-row">
                <span class="merchant-name">{{ merchant.name }}</span>
                <span class="merchant-tag" :class="getTagClass(merchant)">{{ getTagText(merchant) }}</span>
              </div>
              <div class="merchant-address">{{ merchant.address }}</div>
              <div class="merchant-meta">
                <span class="last-clean">上次审计: {{ getLastCleanText(merchant) }}</span>
              </div>
            </div>
            <div class="merchant-action">
              <span class="action-text">查看动态</span>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="panel-footer">
        </div>
      </div>
    </div>

    <!-- 遮罩层 - 点击关闭面板 -->
    <div 
      v-if="selectedMerchant" 
      class="panel-overlay" 
      @click="closePopup"
    ></div>

    <!-- 商户详情滑入面板 - 从右侧滑入 -->
    <transition name="slide-from-right">
      <div v-if="selectedMerchant" class="merchant-detail-panel">
        <div class="detail-panel-header">
          <h3 class="detail-panel-title">{{ selectedMerchant.name }}</h3>
          <el-icon class="close-detail-icon" @click="closePopup"><Close /></el-icon>
        </div>
        <div class="detail-panel-content">
          <div class="detail-row">
            <span class="detail-label">负责人：</span>
            <span class="detail-value">{{ selectedMerchant.contact }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">联系电话：</span>
            <span class="detail-value">{{ selectedMerchant.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">营业状态：</span>
            <el-tag :type="getBusinessStatusType(selectedMerchant.businessStatus)" size="small">
              {{ getBusinessStatusText(selectedMerchant.businessStatus) }}
            </el-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">未清洗天数：</span>
            <span class="detail-value days" :class="getDaysClass(selectedMerchant.daysSinceLastClean)">
              {{ selectedMerchant.daysSinceLastClean }}天
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">上次清洗时间：</span>
            <span class="detail-value">{{ selectedMerchant.lastCleanTime }}</span>
          </div>
          <div v-if="selectedMerchant.lastCleanPhoto" class="detail-photo-section">
            <div class="detail-label">上次清洗照片：</div>
            <el-image
              :src="selectedMerchant.lastCleanPhoto"
              fit="cover"
              style="width: 100%; height: 150px; border-radius: 8px; margin-top: 8px;"
              :preview-src-list="[selectedMerchant.lastCleanPhoto]"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { Shop, Warning, CircleClose, CircleCheck, Search, Filter, Close, UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElLink } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 监听用户信息变化，重新过滤数据
watch(userInfo, () => {
  filterMerchants()
}, { deep: true })

const selectedMerchant = ref(null)

// 搜索关键词
const searchKeyword = ref('')

// 筛选面板显示控制
const showFilter = ref(false)

// 右侧面板显示控制
const showPanel = ref(true)

// 筛选条件
const filter = ref({
  warningLevel: 'all',
  businessStatus: 'all'
})

// 过滤后的商户数据
const filteredMerchants = ref([])

// 片区统计数据
const areaStats = computed(() => {
  const filtered = filteredMerchants.value
  return {
    safe: filtered.filter(item => item.daysSinceLastClean < 13 && item.businessStatus !== 'suspended').length,
    warning: filtered.filter(item => item.daysSinceLastClean >= 13 && item.daysSinceLastClean < 15 && item.businessStatus !== 'suspended').length,
    overdue: filtered.filter(item => item.daysSinceLastClean >= 15 && item.businessStatus !== 'suspended').length,
    closed: filtered.filter(item => item.businessStatus === 'suspended').length
  }
})

// 显示的商户列表（限制数量）
const displayMerchants = computed(() => {
  return filteredMerchants.value.slice(0, 20)
})

// 商户数据（模拟数据，实际应从API获取）
const merchants = ref([
  // 开发区商户
  {
    id: 1,
    name: '美味小厨餐厅',
    contact: '张伟',
    phone: '13800138001',
    address: '北京市朝阳区建国路88号',
    longitude: 116.460794,
    latitude: 39.913964,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 5,
    lastCleanTime: '2024-01-10',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 3,
    name: '时尚服装店',
    contact: '王强',
    phone: '13700137001',
    address: '北京市东城区王府井大街1号',
    longitude: 116.416667,
    latitude: 39.916667,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 16,
    lastCleanTime: '2023-12-30',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 5,
    name: '开发区大酒店',
    contact: '刘经理',
    phone: '13500135001',
    address: '北京市朝阳区建国门外大街1号',
    longitude: 116.453871,
    latitude: 39.904605,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 14,
    lastCleanTime: '2024-01-01',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 7,
    name: '开发区美食城',
    contact: '赵厨师',
    phone: '13300133001',
    address: '北京市朝阳区朝阳公园路6号',
    longitude: 116.468750,
    latitude: 39.933333,
    district: '开发区',
    businessStatus: 'open',
    daysSinceLastClean: 13,
    lastCleanTime: '2024-01-02',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  // 城关镇商户
  {
    id: 2,
    name: '阳光咖啡馆',
    contact: '李娜',
    phone: '13900139001',
    address: '北京市海淀区中关村大街1号',
    longitude: 116.329423,
    latitude: 39.983901,
    district: 'town',
    businessStatus: 'open',
    daysSinceLastClean: 14,
    lastCleanTime: '2024-01-01',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 6,
    name: '城关镇餐厅',
    contact: '孙老板',
    phone: '13400134001',
    address: '北京市海淀区清华大学南门',
    longitude: 116.322778,
    latitude: 39.992222,
    district: 'town',
    businessStatus: 'open',
    daysSinceLastClean: 15,
    lastCleanTime: '2023-12-31',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 8,
    name: '城关镇小吃街',
    contact: '周师傅',
    phone: '13200132001',
    address: '北京市海淀区中关村南大街5号',
    longitude: 116.331944,
    latitude: 39.966667,
    district: '城关镇',
    businessStatus: 'open',
    daysSinceLastClean: 7,
    lastCleanTime: '2024-01-08',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  // 工业园区商户
  {
    id: 4,
    name: '健康养生馆',
    contact: '陈丽',
    phone: '13600136001',
    address: '北京市西城区西单大街1号',
    longitude: 116.366667,
    latitude: 39.900000,
    district: 'industry',
    businessStatus: 'closed',
    daysSinceLastClean: 20,
    lastCleanTime: '2023-12-26',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 9,
    name: '工业园区食堂',
    contact: '吴经理',
    phone: '13100131001',
    address: '北京市西城区西长安街1号',
    longitude: 116.363333,
    latitude: 39.908333,
    district: '工业园区',
    businessStatus: 'open',
    daysSinceLastClean: 10,
    lastCleanTime: '2024-01-05',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 10,
    name: '工业园区快餐店',
    contact: '郑老板',
    phone: '13000130001',
    address: '北京市西城区金融街35号',
    longitude: 116.358333,
    latitude: 39.916667,
    district: '工业园区',
    businessStatus: 'open',
    daysSinceLastClean: 17,
    lastCleanTime: '2023-12-28',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  // 更多开发区商户
  {
    id: 11,
    name: '开发区川菜馆',
    contact: '李师傅',
    phone: '13800138011',
    address: '北京市朝阳区三里屯路1号',
    longitude: 116.455,
    latitude: 39.935,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 3,
    lastCleanTime: '2024-01-12',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 12,
    name: '开发区烧烤店',
    contact: '王老板',
    phone: '13800138012',
    address: '北京市朝阳区工体北路2号',
    longitude: 116.445,
    latitude: 39.928,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 18,
    lastCleanTime: '2023-12-28',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 13,
    name: '开发区火锅店',
    contact: '张经理',
    phone: '13800138013',
    address: '北京市朝阳区望京街3号',
    longitude: 116.48,
    latitude: 39.998,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 6,
    lastCleanTime: '2024-01-09',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 14,
    name: '开发区面馆',
    contact: '刘师傅',
    phone: '13800138014',
    address: '北京市朝阳区国贸路4号',
    longitude: 116.465,
    latitude: 39.908,
    district: 'development',
    businessStatus: 'suspended',
    daysSinceLastClean: 25,
    lastCleanTime: '2023-12-21',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 15,
    name: '开发区日料店',
    contact: '陈师傅',
    phone: '13800138015',
    address: '北京市朝阳区亮马桥路5号',
    longitude: 116.47,
    latitude: 39.945,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 14,
    lastCleanTime: '2024-01-01',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  // 更多城关镇商户
  {
    id: 16,
    name: '城关镇饺子馆',
    contact: '赵阿姨',
    phone: '13900139016',
    address: '北京市海淀区五道口1号',
    longitude: 116.34,
    latitude: 39.985,
    district: 'town',
    businessStatus: 'open',
    daysSinceLastClean: 4,
    lastCleanTime: '2024-01-11',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 17,
    name: '城关镇烤鸭店',
    contact: '钱师傅',
    phone: '13900139017',
    address: '北京市海淀区西直门2号',
    longitude: 116.355,
    latitude: 39.94,
    district: 'town',
    businessStatus: 'open',
    daysSinceLastClean: 19,
    lastCleanTime: '2023-12-27',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 18,
    name: '城关镇自助餐',
    contact: '孙经理',
    phone: '13900139018',
    address: '北京市海淀区公主坟3号',
    longitude: 116.31,
    latitude: 39.91,
    district: 'town',
    businessStatus: 'open',
    daysSinceLastClean: 8,
    lastCleanTime: '2024-01-07',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 19,
    name: '城关镇奶茶店',
    contact: '周小姐',
    phone: '13900139019',
    address: '北京市海淀区魏公村4号',
    longitude: 116.325,
    latitude: 39.96,
    district: 'town',
    businessStatus: 'closed',
    daysSinceLastClean: 12,
    lastCleanTime: '2024-01-03',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 20,
    name: '城关镇火锅店',
    contact: '吴老板',
    phone: '13900139020',
    address: '北京市海淀区亚运村5号',
    longitude: 116.395,
    latitude: 39.99,
    district: 'town',
    businessStatus: 'open',
    daysSinceLastClean: 15,
    lastCleanTime: '2023-12-30',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  // 更多工业园区商户
  {
    id: 21,
    name: '工业园区西餐厅',
    contact: '郑主厨',
    phone: '13600136021',
    address: '北京市西城区复兴门1号',
    longitude: 116.35,
    latitude: 39.91,
    district: 'industry',
    businessStatus: 'open',
    daysSinceLastClean: 5,
    lastCleanTime: '2024-01-10',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 22,
    name: '工业园区茶餐厅',
    contact: '王经理',
    phone: '13600136022',
    address: '北京市西城区阜成门2号',
    longitude: 116.37,
    latitude: 39.925,
    district: 'industry',
    businessStatus: 'open',
    daysSinceLastClean: 16,
    lastCleanTime: '2023-12-29',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 23,
    name: '工业园区 bakery',
    contact: '李师傅',
    phone: '13600136023',
    address: '北京市西城区德胜门3号',
    longitude: 116.385,
    latitude: 39.955,
    district: 'industry',
    businessStatus: 'open',
    daysSinceLastClean: 9,
    lastCleanTime: '2024-01-06',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 24,
    name: '工业园区大排档',
    contact: '张老板',
    phone: '13600136024',
    address: '北京市西城区新街口4号',
    longitude: 116.34,
    latitude: 39.94,
    district: 'industry',
    businessStatus: 'open',
    daysSinceLastClean: 22,
    lastCleanTime: '2023-12-24',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 25,
    name: '工业园区寿司店',
    contact: '陈师傅',
    phone: '13600136025',
    address: '北京市西城区月坛南街5号',
    longitude: 116.355,
    latitude: 39.92,
    district: 'industry',
    businessStatus: 'suspended',
    daysSinceLastClean: 11,
    lastCleanTime: '2024-01-04',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  // 新增区域商户
  {
    id: 26,
    name: '丰台小吃店',
    contact: '马师傅',
    phone: '13700137026',
    address: '北京市丰台区方庄路1号',
    longitude: 116.425,
    latitude: 39.865,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 7,
    lastCleanTime: '2024-01-08',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 27,
    name: '通州火锅店',
    contact: '许老板',
    phone: '13700137027',
    address: '北京市通州区新华大街2号',
    longitude: 116.665,
    latitude: 39.91,
    district: 'town',
    businessStatus: 'open',
    daysSinceLastClean: 20,
    lastCleanTime: '2023-12-26',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 28,
    name: '大兴餐厅',
    contact: '何经理',
    phone: '13700137028',
    address: '北京市大兴区黄村3号',
    longitude: 116.34,
    latitude: 39.73,
    district: 'industry',
    businessStatus: 'open',
    daysSinceLastClean: 13,
    lastCleanTime: '2024-01-02',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 29,
    name: '昌平烧烤店',
    contact: '林老板',
    phone: '13700137029',
    address: '北京市昌平区回龙观4号',
    longitude: 116.32,
    latitude: 40.075,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 4,
    lastCleanTime: '2024-01-11',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 30,
    name: '顺义烤鸭店',
    contact: '黄师傅',
    phone: '13700137030',
    address: '北京市顺义区天竺5号',
    longitude: 116.58,
    latitude: 40.05,
    district: 'town',
    businessStatus: 'closed',
    daysSinceLastClean: 26,
    lastCleanTime: '2023-12-20',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  // 绿色预警示例（13天）
  {
    id: 31,
    name: '朝阳区面馆',
    contact: '杨师傅',
    phone: '13800138031',
    address: '北京市朝阳区大望路1号',
    longitude: 116.485,
    latitude: 39.92,
    district: 'development',
    businessStatus: 'open',
    daysSinceLastClean: 13,
    lastCleanTime: '2024-01-02',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 32,
    name: '海淀区茶室',
    contact: '林老板',
    phone: '13900139032',
    address: '北京市海淀区中关村大街2号',
    longitude: 116.315,
    latitude: 39.985,
    district: 'town',
    businessStatus: 'open',
    daysSinceLastClean: 13,
    lastCleanTime: '2024-01-02',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  },
  {
    id: 33,
    name: '西城区烤肉店',
    contact: '张师傅',
    phone: '13600136033',
    address: '北京市西城区西单北大街3号',
    longitude: 116.375,
    latitude: 39.915,
    district: 'industry',
    businessStatus: 'open',
    daysSinceLastClean: 13,
    lastCleanTime: '2024-01-02',
    lastCleanPhoto: 'https://via.placeholder.com/300x200?text=Cleaning+Photo'
  }
])

// 统计数据（基于过滤后的商户）
const stats = computed(() => {
  const filtered = filteredMerchants.value
  return {
    total: filtered.length,
    red: filtered.filter(item => item.daysSinceLastClean >= 15).length,
    yellow: filtered.filter(item => item.daysSinceLastClean >= 13 && item.daysSinceLastClean < 15).length,
    normal: filtered.filter(item => item.daysSinceLastClean < 13).length
  }
})

// 待审核申请数
const pendingReviews = ref(8)

// 平均未清洗天数
const avgDaysSinceClean = computed(() => {
  if (filteredMerchants.value.length === 0) return 0
  const totalDays = filteredMerchants.value.reduce((sum, merchant) => sum + merchant.daysSinceLastClean, 0)
  return (totalDays / filteredMerchants.value.length).toFixed(1)
})

let map = null
let markers = []

// 模拟商户数据
const mockMerchants = Array.from({ length: 400 }, (_, i) => ({
  id: i + 1,
  name: `餐饮商户${i + 1}`,
  contact: `负责人${i + 1}`,
  phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
  businessStatus: ['open', 'closed', 'suspended'][Math.floor(Math.random() * 3)],
  daysSinceLastClean: Math.floor(Math.random() * 20),
  lastCleanTime: '2025-03-08 14:30',
  lastCleanPhoto: '',
  lng: 116.397 + (Math.random() - 0.5) * 0.1,
  lat: 39.908 + (Math.random() - 0.5) * 0.1
}))

const getWarningLevel = (merchant) => {
  if (merchant.daysSinceLastClean >= 15) return 'red'
  if (merchant.daysSinceLastClean >= 13) return 'yellow'
  return 'normal'
}

const filterMerchants = () => {
  const { warningLevel, businessStatus } = filter.value
  
  // 如果选择了"全部"，则不过滤
  const filterByWarning = warningLevel !== 'all'
  const filterByBusiness = businessStatus !== 'all'
  
  const allMerchants = userInfo.value.role === 'sub' && userInfo.value.district ? merchants.value.filter(item => item.district === userInfo.value.district) : merchants.value
  
  filteredMerchants.value = allMerchants.filter(merchant => {
    const merchantWarningLevel = getWarningLevel(merchant)
    const merchantBusinessStatus = merchant.businessStatus
    
    const warningMatch = !filterByWarning || warningLevel === merchantWarningLevel
    const businessMatch = !filterByBusiness || businessStatus === merchantBusinessStatus
    
    return warningMatch && businessMatch
  })
  
  // 更新统计
  updateStats()
  
  // 重新渲染地图标记
  renderMarkers()
}

const updateStats = () => {
  const merchants = filteredMerchants.value
  stats.value = {
    total: merchants.length,
    red: merchants.filter(m => getWarningLevel(m) === 'red').length,
    yellow: merchants.filter(m => getWarningLevel(m) === 'yellow').length,
    normal: merchants.filter(m => getWarningLevel(m) === 'normal').length
  }
}

const renderMarkers = () => {
  // 清除现有标记
  if (markers.length > 0) {
    map.remove(markers)
    markers = []
  }
  
  // 添加筛选后的商户标记
  filteredMerchants.value.forEach(merchant => {
    const markerColor = getMarkerColor(merchant)
    const marker = new AMap.Marker({
      position: [merchant.longitude, merchant.latitude],
      icon: new AMap.Icon({
        image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="${markerColor}" stroke="#fff" stroke-width="2"/>
          </svg>
        `)}`,
        size: new AMap.Size(32, 32),
        imageSize: new AMap.Size(32, 32)
      }),
      title: merchant.name
    })

    marker.on('click', () => {
      showMerchantInfo(merchant)
    })

    markers.push(marker)
    map.add(marker)
  })
}

const initMap = () => {
  // 使用高德地图
  map = new AMap.Map('amap-container', {
    zoom: 13,
    center: [116.397, 39.908],
    mapStyle: 'amap://styles/whitesmoke'
  })

  // 初始过滤并渲染
  filterMerchants()
}

const getMarkerColor = (merchant) => {
  if (merchant.businessStatus === 'suspended') return '#909399'
  if (merchant.businessStatus === 'closed') return '#409eff'
  if (merchant.daysSinceLastClean >= 15) return '#f56c6c'
  if (merchant.daysSinceLastClean >= 13) return '#ff8c00ee'
  return '#10b981'
}

const showMerchantInfo = (merchant) => {
  selectedMerchant.value = { ...merchant }
}

const closePopup = () => {
  selectedMerchant.value = null
}

const getStatusType = (days, businessStatus) => {
  if (businessStatus === 'suspended') return 'info'
  if (days >= 15) return 'danger'
  if (days >= 13) return 'warning'
  return 'success'
}

const getStatusText = (days, businessStatus) => {
  if (businessStatus === 'suspended') return '已停业'
  if (days >= 15) return '红色预警'
  if (days >= 13) return '黄色预警'
  return '正常'
}

const getBusinessStatusType = (status) => {
  const types = {
    open: 'success',
    closed: 'warning',
    suspended: 'info'
  }
  return types[status] || ''
}

const getBusinessStatusText = (status) => {
  const texts = {
    open: '开张',
    closed: '关门',
    suspended: '停业'
  }
  return texts[status] || '未知'
}

const getDaysClass = (days) => {
  if (days > 15) return 'black'
  if (days === 15) return 'red'
  if (days === 14) return 'yellow'
  if (days === 13) return 'green'
  return ''
}

// 设置预警状态并立即筛选
const setWarningLevel = (level) => {
  filter.value.warningLevel = level
  filterMerchants()
}

// 设置营业状态并立即筛选
const setBusinessStatus = (status) => {
  filter.value.businessStatus = status
  filterMerchants()
}

const handleApplyFilter = () => {
  filterMerchants()
  ElMessage.success(`已显示 ${filteredMerchants.value.length} 个商户`)
}

// 切换筛选面板显示
const toggleFilter = () => {
  showFilter.value = !showFilter.value
}

// 切换右侧面板显示
const togglePanel = () => {
  showPanel.value = !showPanel.value
}

// 搜索商户
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    ElMessage.info(`搜索: ${searchKeyword.value}`)
  }
}

// 选择商户
const selectMerchant = (merchant) => {
  selectedMerchant.value = { ...merchant }
}

// 获取商户状态样式类
const getMerchantStatusClass = (merchant) => {
  if (merchant.businessStatus === 'suspended') return 'closed'
  if (merchant.daysSinceLastClean >= 15) return 'overdue'
  if (merchant.daysSinceLastClean >= 13) return 'warning'
  return 'normal'
}

// 获取标签样式类
const getTagClass = (merchant) => {
  if (merchant.businessStatus === 'suspended') return 'tag-closed'
  if (merchant.daysSinceLastClean >= 15) return 'tag-overdue'
  if (merchant.daysSinceLastClean >= 13) return 'tag-warning'
  return 'tag-normal'
}

// 获取标签文本
const getTagText = (merchant) => {
  if (merchant.businessStatus === 'suspended') return '停业'
  if (merchant.daysSinceLastClean >= 15) return '逾期'
  if (merchant.daysSinceLastClean >= 13) return '预警'
  return '正常'
}

// 获取上次清洗时间文本
const getLastCleanText = (merchant) => {
  if (!merchant.lastCleanTime) return '暂无记录'
  // 计算距离现在的时间
  const days = merchant.daysSinceLastClean
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  return `${days}天前`
}

// 生成报告
const generateReport = () => {
  ElMessage.success('报告生成中...')
}

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出中...')
}

onMounted(() => {
  // 动态加载高德地图脚本
  const script = document.createElement('script')
  script.src = `https://webapi.amap.com/maps?v=2.0&key=3d1bbbaad2e42fe5a39e5ce7f79b7c35`
  script.onload = () => {
    initMap()
  }
  document.head.appendChild(script)
})

onBeforeUnmount(() => {
  if (map) {
    map.destroy()
  }
})
</script>

<style scoped>
.map-monitor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f2f5f0;
}

/* 顶部搜索栏 */
.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  border-radius: 12px;
  margin: 16px 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 500px;
}

.search-icon {
  color: #909399;
  font-size: 18px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
}

.search-input::placeholder {
  color: #c0c4cc;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.coverage-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #fff;
  border-radius: 20px;
  font-size: 13px;
  color: #1e3a5f;
}

.coverage-badge .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  font-size: 20px;
  color: #606266;
  cursor: pointer;
  transition: color 0.3s;
}

.action-icon:hover {
  color: #409EFF;
}

.user-avatar-small {
  cursor: pointer;
}

/* 主内容区 */
.map-main-content {
  display: flex;
  flex: 1;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

/* 地图区域 */
.map-area {
  flex: 1;
  position: relative;
  background: #ffffffee;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.amap {
  width: 100%;
  height: 100%;
}

/* 新图例样式 */
.map-legend-new {
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.map-legend-new .legend-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.map-legend-new .legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #606266;
}

.map-legend-new .legend-item:last-child {
  margin-bottom: 0;
}

.map-legend-new .legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.map-legend-new .green-dot {
  background: #10b981;
}

.map-legend-new .orange-dot {
  background: #f59e0b;
}

.map-legend-new .red-dot {
  background: #ef4444;
}

.map-legend-new .gray-dot {
  background: #9ca3af;
}

.map-legend-new .blue-dot {
  background: #409eff;
}

/* 筛选浮动面板 */
.filter-panel-float {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 320px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.close-icon {
  cursor: pointer;
  color: #909399;
  font-size: 18px;
}

.close-icon:hover {
  color: #606266;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-buttons :deep(.el-button) {
  border-radius: 6px;
}

/* 右侧片区概览面板 */
.area-overview-panel {
  width: 360px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 12px;
  border-bottom: 1px solid #f0f2f5;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0;
}

.panel-subtitle {
  font-size: 13px;
  color: #8b9dc3;
  margin: 4px 0 0;
}

.close-panel-icon {
  cursor: pointer;
  color: #c0c4cc;
  font-size: 18px;
}

.close-panel-icon:hover {
  color: #909399;
}

/* 面板统计卡片 */
.panel-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.panel-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 10px;
  background: #f8fafc;
}

.panel-stat-card.safe {
  background: #ecfdf5;
}

.panel-stat-card.warning {
  background: #fff7ed;
}

.panel-stat-card.overdue {
  background: #fef2f2;
}

.panel-stat-card.closed {
  background: #f3f4f6;
}

.panel-stat-card .stat-name {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.panel-stat-card.safe .stat-name {
  color: #10b981;
}

.panel-stat-card.warning .stat-name {
  color: #f97316;
}

.panel-stat-card.overdue .stat-name {
  color: #ef4444;
}

.panel-stat-card.closed .stat-name {
  color: #6b7280;
}

.panel-stat-card .stat-num {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.panel-stat-card.safe .stat-num {
  color: #10b981;
}

.panel-stat-card.warning .stat-num {
  color: #f97316;
}

.panel-stat-card.overdue .stat-num {
  color: #ef4444;
}

.panel-stat-card.closed .stat-num {
  color: #6b7280;
}

/* 商户列表标题 */
.merchant-list-header {
  padding: 12px 20px;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 1px solid #f0f2f5;
}

/* 商户列表 */
.merchant-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.merchant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-left: 3px solid transparent;
}

.merchant-item:hover {
  background: #f8fafc;
}

.merchant-item.normal {
  border-left-color: #10b981;
}

.merchant-item.warning {
  border-left-color: #f97316;
}

.merchant-item.overdue {
  border-left-color: #ef4444;
}

.merchant-item.closed {
  border-left-color: #9ca3af;
}

.merchant-info {
  flex: 1;
}

.merchant-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.merchant-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e3a5f;
}

.merchant-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.merchant-tag.tag-normal {
  background: #dcfce7;
  color: #16a34a;
}

.merchant-tag.tag-warning {
  background: #ffedd5;
  color: #ea580c;
}

.merchant-tag.tag-overdue {
  background: #fee2e2;
  color: #dc2626;
}

.merchant-tag.tag-closed {
  background: #f3f4f6;
  color: #6b7280;
}

.merchant-address {
  font-size: 12px;
  color: #8b9dc3;
  margin-bottom: 6px;
}

.merchant-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #9ca3af;
}

.merchant-meta::before {
  content: '';
  width: 12px;
  height: 12px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>') center/contain no-repeat;
}

.action-text {
  font-size: 12px;
  color: #4a90d9;
  font-weight: 500;
}

/* 面板底部 */
.panel-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f0f2f5;
}

.generate-report-btn {
  flex: 1;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
  border: none;
  border-radius: 8px;
  height: 40px;
}

.generate-report-btn:hover {
  background: linear-gradient(135deg, #2d4a6f 0%, #3d5a7f 100%);
}

.export-btn {
  width: 80px;
  border-radius: 8px;
  height: 40px;
}

/* 遮罩层 */
.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1999;
}

/* 商户详情滑入面板 - 从右侧滑入 */
.merchant-detail-panel {
  position: absolute;
  top: 80px;
  right: 16px;
  width: 360px;
  height: calc(100% - 96px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.detail-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
}

.detail-panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0;
}

.close-detail-icon {
  cursor: pointer;
  color: #c0c4cc;
  font-size: 20px;
}

.close-detail-icon:hover {
  color: #909399;
}

.detail-panel-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: #6b7280;
  min-width: 90px;
  flex-shrink: 0;
}

.detail-value {
  color: #1f2937;
  font-weight: 500;
}

.detail-value.days {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 600;
}

.detail-value.days.green {
  background: #ecfdf5;
  color: #10b981;
}

.detail-value.days.yellow {
  background: #fff7ed;
  color: #f97316;
}

.detail-value.days.red {
  background: #fef2f2;
  color: #ef4444;
}

.detail-photo-section {
  margin-top: 8px;
}

.detail-photo-section .detail-label {
  display: block;
  margin-bottom: 8px;
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

:deep(.main) {
  overflow-y: hidden;
}
</style>
