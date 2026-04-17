<template>
  <div class="dashboard-layout">
    <!-- 固定侧边栏 -->
    <div class="aside">
      <!-- Logo区域 -->
      <div class="logo-box">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#4a90d9"/>
            <path d="M12 7L7 9.5v3c0 3.5 2.5 6.5 5 7.5 2.5-1 5-4 5-7.5v-3L12 7z" fill="#fff"/>
            <path d="M10 11l2 2 4-4" stroke="#4a90d9" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div class="logo-text-box">
          <div class="logo-title">餐饮油烟净化监管系统</div>
          <div class="logo-subtitle">合规监管系统</div>
        </div>
      </div>

      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        :router="true"
        class="sidebar-menu"
        background-color="transparent"
        text-color="#a0aec0"
        active-text-color="#fff"
      >
        <!-- 首页 -->
        <el-menu-item index="/dashboard/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <!-- 商户管理（父级菜单） -->
        <el-sub-menu index="merchant">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>商户管理</span>
          </template>
          <el-menu-item index="/dashboard/merchant">
            <el-icon><List /></el-icon>
            <span>商户列表</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/merchant-apply">
            <el-icon><DocumentAdd /></el-icon>
            <span>商户申请</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/dashboard/audit">
          <el-icon><DocumentChecked /></el-icon>
          <span>油烟清洗审核</span>
        </el-menu-item>
        <el-menu-item index="/dashboard/map">
          <el-icon><MapLocation /></el-icon>
          <span>监控地图</span>
        </el-menu-item>
        <el-sub-menu index="permission" v-if="userInfo.adminLevel === 'level1'">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>权限管理</span>
          </template>
          <el-menu-item index="/dashboard/admin/user">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/admin/role">
            <el-icon><Avatar /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/admin/menu">
            <el-icon><Menu /></el-icon>
            <span>菜单管理</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/dashboard/service-provider">
          <el-icon><Tools /></el-icon>
          <span>清理商管理</span>
        </el-menu-item>
      </el-menu>

      <!-- 底部用户信息 -->
      <div class="sidebar-footer" @click="goToProfile">
        <div class="user-avatar">
          <el-avatar :size="40" :icon="UserFilled" />
          <div class="online-status"></div>
        </div>
        <div class="user-info-text">
          <div class="user-name">{{ userInfo.realName || '管理员' }}</div>
          <div class="user-role">{{ getAdminLevelText(userInfo.adminLevel) }}</div>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-wrapper">
      <!-- 固定顶部导航栏 -->
      <div class="header">
        <div class="header-left">
          <h2>{{ currentPageTitle }}</h2>
        </div>
        <div class="header-right">
          <!-- 消息通知按钮 -->
          <div class="message-box" @click="handleOpenMessage">
            <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" class="message-badge">
              <el-icon :size="22" class="message-icon"><Bell /></el-icon>
            </el-badge>
          </div>
          
          <!-- 退出登录按钮 -->
          <div class="logout-btn" @click="handleLogout">
            <el-icon :size="20"><SwitchButton /></el-icon>
          </div>
        </div>
      </div>

      <!-- 消息侧边栏 -->
      <el-drawer
        v-model="messageDrawerVisible"
        title=""
        direction="rtl"
        size="500px"
        class="message-drawer"
      >
        <div class="message-container">
          <!-- 顶部标题和操作区 -->
          <div class="message-header-section">
            <div class="message-title-section">
              <h2 class="message-center-title">
                消息中心
                <span v-if="unreadCount > 0" class="unread-label">未读</span>
                <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" class="title-badge" />
              </h2>
              <p class="message-subtitle">跟踪监管报告、合规更新和团队反馈。</p>
            </div>
            <div class="header-actions">
              <el-button link @click="handleMarkAllRead">
                <el-icon><Check /></el-icon>
                全部标记为已读
              </el-button>
              <el-dropdown>
                <el-button link>
                  <el-icon><List /></el-icon>
                  全部消息
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>全部消息</el-dropdown-item>
                    <el-dropdown-item>未读消息</el-dropdown-item>
                    <el-dropdown-item>已读消息</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- 主内容区（单栏） -->
          <div class="message-main-content">
            <!-- 消息列表 -->
            <div class="message-list" v-if="filteredMessageList.length > 0">
              <div
                v-for="msg in filteredMessageList"
                :key="msg.id"
                class="message-item"
                :class="{ 'unread': !msg.isRead }"
                @click="handleReadMessage(msg)"
              >
                <div class="msg-left-border" :class="getMessageBorderClass(msg.type)"></div>
                <div class="msg-content-wrapper">
                  <div class="msg-top-row">
                    <div class="msg-title-row">
                      <el-icon :size="22" :class="getMessageIconClass(msg.type)">
                        <component :is="getMessageIcon(msg.type)" />
                      </el-icon>
                      <span class="msg-title">{{ msg.title }}</span>
                    </div>
                    <span class="msg-time">{{ msg.time }}</span>
                  </div>
                  <div class="msg-body">{{ msg.content }}</div>
                  <div class="msg-footer">
                    <el-tag v-if="msg.merchantName" size="small" :type="getMessageTagType(msg.type)" class="msg-tag">
                      {{ msg.merchantName }}
                    </el-tag>
                    <span class="msg-action-link" v-if="msg.category === 'merchant'">查看申请 →</span>
                    <span class="msg-action-link" v-else-if="msg.type === 'upload'">查看审核 →</span>
                    <span class="msg-action-link" v-else-if="msg.type === 'audit_approved' || msg.type === 'audit_rejected'">查看完整反馈 →</span>
                    <span class="msg-action-link" v-else>打开商户页面 →</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty v-else description="暂无消息" />

            <div class="view-archive-link">
              查看归档通知 ∨
            </div>
          </div>
        </div>
      </el-drawer>

      <!-- 可滚动的主要内容区域 -->
      <div class="main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { UserFilled, Location, Shop, Message, Check, Setting, Tools, OfficeBuilding, Bell, Upload, Delete, Document, Plus, HomeFilled, DocumentChecked, MapLocation, User, SwitchButton, Search, List, QuestionFilled, Warning, CircleCheck, DataAnalysis, Avatar, DocumentAdd } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const activeMenu = computed(() => route.path)

// ==================== 站内信系统 ====================
// 消息抽屉显示状态
const messageDrawerVisible = ref(false)

// 当前消息标签页
const activeMessageTab = ref('all')

// 搜索文本
const searchText = ref('')

// 消息列表（模拟数据）
const messageList = ref([
  // ===== 清洗审核消息 =====
  {
    id: 'MSG001',
    type: 'upload',
    category: 'audit',
    title: '清理申请待审核',
    content: '美味小厨餐厅提交了清理申请，等待您审核。',
    merchantName: '美味小厨餐厅',
    time: '10分钟前',
    isRead: false,
    merchantId: 'M001',
    auditId: 'A2024001'
  },
  {
    id: 'MSG002',
    type: 'upload',
    category: 'audit',
    title: '清理申请待审核',
    content: '时尚服装店提交了清理申请，等待您审核。',
    merchantName: '时尚服装店',
    time: '30分钟前',
    isRead: false,
    merchantId: 'M003',
    auditId: 'A2024002'
  },
  {
    id: 'MSG003',
    type: 'upload',
    category: 'audit',
    title: '清理申请待审核',
    content: '城关镇饭店提交了清理申请，等待您审核。',
    merchantName: '城关镇饭店',
    time: '1小时前',
    isRead: false,
    merchantId: 'M008',
    auditId: 'A2024003'
  },
  // ===== 商户注册申请消息 =====
  {
    id: 'MSG006',
    type: 'merchant_apply',
    category: 'merchant',
    title: '新商户入驻申请',
    content: '「美味小厨餐厅」提交了自主注册申请，请及时审核。',
    merchantName: '美味小厨餐厅',
    time: '5分钟前',
    isRead: false,
    merchantId: 'M001'
  },
  {
    id: 'MSG007',
    type: 'merchant_apply',
    category: 'merchant',
    title: '新商户入驻申请',
    content: '「开发区大酒店」提交了自主注册申请，请及时审核。',
    merchantName: '开发区大酒店',
    time: '40分钟前',
    isRead: false,
    merchantId: 'M005'
  },
  {
    id: 'MSG008',
    type: 'merchant_apply',
    category: 'merchant',
    title: '新商户入驻申请',
    content: '「城关镇饭店」提交了自主注册申请，请及时审核。',
    merchantName: '城关镇饭店',
    time: '昨天',
    isRead: true,
    merchantId: 'M008'
  },
  // ===== 原有消息（已读）=====
  {
    id: 'MSG004',
    type: 'upload',
    category: 'audit',
    title: '清理申请待审核',
    content: '开发区大酒店提交了清理申请，等待您审核。',
    merchantName: '开发区大酒店',
    time: '2小时前',
    isRead: true,
    merchantId: 'M005',
    auditId: 'A2024005'
  },
  {
    id: 'MSG005',
    type: 'upload',
    category: 'audit',
    title: '清理申请待审核',
    content: '健康养生馆提交了清理申请，等待您审核。',
    merchantName: '健康养生馆',
    time: '昨天',
    isRead: true,
    merchantId: 'M004',
    auditId: 'A2024004'
  }
])

// 未读消息数量
const unreadCount = computed(() => {
  return messageList.value.filter(msg => !msg.isRead).length
})

// 过滤后的消息列表（包含审核消息 + 商户申请消息）
const filteredMessageList = computed(() => {
  const validTypes = ['upload', 'audit_approved', 'audit_rejected', 'merchant_apply']
  const validMessages = messageList.value.filter(msg => validTypes.includes(msg.type))

  // 根据管理员级别过滤消息
  const filteredByLevel = validMessages.filter(msg => {
    // 区县级管理可以看到所有消息
    if (userInfo.value.adminLevel === 'level1') {
      return true
    }
    // 乡镇街道级管理可以看到审核消息和商户申请消息
    if (userInfo.value.adminLevel === 'level2') {
      return msg.category === 'audit' || msg.category === 'merchant'
    }
    // 负责人管理只能看到审核消息
    if (userInfo.value.adminLevel === 'level3') {
      return msg.category === 'audit'
    }
    return true
  })

  if (activeMessageTab.value === 'unread') {
    return filteredByLevel.filter(msg => !msg.isRead)
  }
  return filteredByLevel
})

// 获取消息图标
const getMessageIcon = (type) => {
  const iconMap = {
    upload: Upload,
    audit_approved: Check,
    audit_rejected: Delete,
    warning: Bell,
    system: Document,
    merchant_apply: Shop
  }
  return iconMap[type] || Document
}

// 获取消息图标样式类
const getMessageIconClass = (type) => {
  const classMap = {
    upload: 'icon-upload',
    audit_approved: 'icon-approved',
    audit_rejected: 'icon-rejected',
    warning: 'icon-warning',
    system: 'icon-system',
    merchant_apply: 'icon-merchant'
  }
  return classMap[type] || 'icon-system'
}

// 获取消息标签类型
const getMessageTagType = (type) => {
  const typeMap = {
    upload: 'primary',
    audit_approved: 'success',
    audit_rejected: 'danger',
    warning: 'warning',
    system: 'info',
    merchant_apply: ''
  }
  return typeMap[type] || 'info'
}

// 获取消息边框样式类
const getMessageBorderClass = (type) => {
  const classMap = {
    upload: 'border-upload',
    audit_approved: 'border-approved',
    audit_rejected: 'border-rejected',
    warning: 'border-warning',
    system: 'border-system',
    merchant_apply: 'border-merchant'
  }
  return classMap[type] || 'border-system'
}

// 打开消息抽屉
const handleOpenMessage = () => {
  messageDrawerVisible.value = true
}

// 读取消息（根据类型跳转不同页面）
const handleReadMessage = (msg) => {
  // 标记为已读
  const index = messageList.value.findIndex(item => item.id === msg.id)
  if (index !== -1) {
    messageList.value[index].isRead = true
  }

  // 根据消息分类跳转
  if (msg.category === 'merchant') {
    // 商户申请消息 → 跳转商户申请页面
    router.push('/dashboard/merchant-apply')
    messageDrawerVisible.value = false
    ElMessage.info('已跳转到商户申请审核')
  } else {
    // 审核消息 → 跳转审核中心
    router.push('/dashboard/audit')
    messageDrawerVisible.value = false
    ElMessage.info('已跳转到审核中心')
  }
}

// 全部标为已读
const handleMarkAllRead = () => {
  messageList.value.forEach(msg => {
    msg.isRead = true
  })
  ElMessage.success('已全部标为已读')
}

// 清空消息
const handleClearAll = () => {
  ElMessageBox.confirm(
    '确定要清空所有消息吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    messageList.value = []
    ElMessage.success('消息已清空')
  }).catch(() => {
    // 取消
  })
}

// 获取管理员级别文本
const getAdminLevelText = (level) => {
  const levelMap = {
    level1: '区县级管理（区/县级）',
    level2: '乡镇街道级管理（街道级）',
    level3: '负责人管理（具体负责人）'
  }
  return levelMap[level] || '未知级别'
}

const currentPageTitle = computed(() => {
  const titles = {
    '/dashboard': '监控仪表盘',
    '/dashboard/home': '监控仪表盘',
    '/dashboard/map': 'GIS地图监控',
    '/dashboard/merchant': '商户管理',
    '/dashboard/merchant-apply': '商户申请',
    '/dashboard/sms-log': '短信日志',
    '/dashboard/audit': '油烟清洗审核',
    '/dashboard/admin': '管理员层级管理',
    '/dashboard/admin/user': '用户管理',
    '/dashboard/admin/role': '角色管理',
    '/dashboard/admin/menu': '菜单管理',
    '/dashboard/service-provider': '清理商管理',
    '/dashboard/profile': '个人信息'
  }
  return titles[route.path] || '监控仪表盘'
})

// 跳转到个人信息页面
const goToProfile = () => {
  router.push('/dashboard/profile')
}

// 发起审核（跳转到审核中心）
const handleCreateAudit = () => {
  router.push('/dashboard/audit')
  ElMessage.info('已跳转到审核中心，请选择商户发起审核')
}

const handleProfile = () => {
  router.push('/dashboard/profile')
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    userStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  }).catch(() => {
    // 取消退出
  })
}
</script>

<style scoped>
.dashboard-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
}

/* 固定侧边栏 - 深色主题 */
.aside {
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #1a1f2e 0%, #0f1419 100%);
  overflow-x: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

/* Logo区域 */
.logo-box {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  flex-shrink: 0;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: #2d4a6f;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.logo-icon svg {
  width: 28px;
  height: 28px;
}

.logo-text-box {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 11px;
  color: #8b9dc3;
  line-height: 1.2;
  margin-top: 2px;
}



/* 侧边栏菜单 */
.sidebar-menu {
  border-right: none !important;
  flex: 1;
  overflow-y: auto;
  background: transparent !important;
  padding: 0 12px;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  padding: 0 12px !important;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: #fff !important;
  font-weight: 500;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  margin-right: 10px;
  font-size: 18px;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  padding: 0 12px !important;
}

.sidebar-menu :deep(.el-sub-menu__title .el-icon) {
  margin-right: 10px;
  font-size: 18px;
}

/* 底部用户信息 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.sidebar-footer:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  position: relative;
  margin-right: 12px;
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid #1a1f2e;
}

.user-info-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  line-height: 1.3;
}

.user-role {
  font-size: 11px;
  color: #8b9dc3;
  line-height: 1.3;
  margin-top: 2px;
}

/* 主体内容区域 */
.main-wrapper {
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 固定顶部导航栏 */
.header {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  flex-shrink: 0;
}

.header-left h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 消息按钮样式 */
.message-box {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.message-box:hover {
  background-color: #f0f2f5;
}

.message-icon {
  color: #606266;
}

.message-badge :deep(.el-badge__content) {
  border: none;
}

/* 退出登录按钮 */
.logout-btn {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
  color: #606266;
}

.logout-btn:hover {
  background-color: #f0f2f5;
  color: #f56c6c;
}

/* 可滚动的主要内容区域 */
.main {
  flex: 1;
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ==================== 消息系统新样式 ==================== */
.message-drawer :deep(.el-drawer__header) {
  display: none;
}

.message-drawer :deep(.el-drawer__body) {
  padding: 0 !important;
  margin-top: 0 !important;
}

.message-drawer :deep(.el-drawer) {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.message-drawer :deep(.el-overlay) {
  margin-top: 0 !important;
}

/* 移除消息容器顶部的空白 */
.message-container {
  padding-top: 0 !important;
  margin-top: 0 !important;
}

.message-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

/* 顶部标题和操作区 */
.message-header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 12px;
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  margin-top: -24px;
}

.message-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 主内容区（单栏） */
.message-main-content {
  flex: 1;
  padding: 8px 24px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message-center-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-badge {
  margin-left: 8px;
}

.unread-label {
  font-size: 14px;
  color: #f56c6c;
  margin-left: 12px;
  font-weight: 500;
}

.message-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* 消息列表 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.message-item {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.message-item.unread {
  background-color: #fff;
}

/* 左侧边框 */
.msg-left-border {
  width: 4px;
  flex-shrink: 0;
}

.msg-left-border.border-upload {
  background: linear-gradient(180deg, #f97316 0%, #ea580c 100%);
}

.msg-left-border.border-approved {
  background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
}

.msg-left-border.border-rejected {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.msg-left-border.border-warning {
  background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
}

.msg-left-border.border-system {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
}

.msg-left-border.border-merchant {
  background: linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%);
}

.msg-content-wrapper {
  flex: 1;
  padding: 20px;
}

.msg-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.msg-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.msg-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.msg-time {
  font-size: 13px;
  color: #94a3b8;
}

.msg-body {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 16px;
}

.msg-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.msg-tag {
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
}

.msg-action-link {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  cursor: pointer;
}

.view-archive-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
}

/* 右侧：统计和分类 */
.message-right-section {
  width: 260px;
  padding: 8px 16px 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 消息统计卡片 */
.stats-card {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%);
  border-radius: 16px;
  padding: 16px 20px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
}

.stats-card-title {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 16px;
}

.stats-card-content {
  display: flex;
  flex-direction: column;
}

.unread-count {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.unread-label {
  font-size: 16px;
  opacity: 0.9;
  margin-top: 4px;
}

.urgent-label {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 12px;
}

/* 文件夹分类 */
.folder-section {
  background-color: #f1f5f9;
  border-radius: 12px;
  padding: 20px;
}

.folder-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 16px;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.folder-item:hover {
  background-color: #e2e8f0;
}

.folder-item.active {
  background-color: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

.folder-count {
  margin-left: auto;
  font-size: 14px;
  color: #94a3b8;
}

/* 帮助区域 */
.help-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.help-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.help-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
}

.help-btn {
  width: 100%;
  background-color: #1e3a8a;
  border: none;
  border-radius: 8px;
  font-weight: 500;
}

.help-btn:hover {
  background-color: #1e40af !important;
}

/* 消息图标颜色 */
.icon-upload { color: #f97316; }
.icon-approved { color: #22c55e; }
.icon-rejected { color: #ef4444; }
.icon-warning { color: #dc2626; }
.icon-system { color: #64748b; }
.icon-merchant { color: #8b5cf6; }
</style>
