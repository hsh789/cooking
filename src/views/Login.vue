<template>
  <div class="login-page">
    <!-- 背景图 -->
    <div class="login-bg"></div>
    
    <!-- 登录内容区 -->
    <div class="login-content">
      <!-- 顶部图标和标题 -->
      <div class="login-top">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill="#fff"/>
          </svg>
        </div>
        <h1 class="main-title">油烟机清洗监管系统</h1>
        <p class="sub-title">食品经营场所合规门户</p>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
        <!-- 角色切换标签 -->
        <div class="role-tabs">
          <div 
            class="role-tab" 
            :class="{ active: activeRole === 'admin' }"
            @click="activeRole = 'admin'"
          >
            区/县管理员
          </div>
          <div 
            class="role-tab" 
            :class="{ active: activeRole === 'subadmin' }"
            @click="activeRole = 'subadmin'"
          >
            子管理员
          </div>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <div class="form-label">手机号</div>
          <el-form-item prop="username">
            <div class="input-with-icon">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#999">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </span>
              <el-input
                v-model="loginForm.username"
                placeholder="请输入注册手机号"
                size="large"
              />
            </div>
          </el-form-item>

          <div class="form-label">登录密码</div>
          <el-form-item prop="password">
            <div class="input-with-icon">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#999">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </span>
              <el-input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入登录密码"
                size="large"
              />
              <span class="password-toggle" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="#999">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="#999">
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                </svg>
              </span>
            </div>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
            <el-link type="primary" class="forgot-link">忘记密码？</el-link>
          </div>

          <el-form-item>
            <el-button
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录管理后台
              <span class="btn-arrow">→</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 安全提示 -->
        <div class="security-tips">
          <div class="security-item">
            <svg class="shield-icon" viewBox="0 0 24 24" width="16" height="16" fill="#4a5568">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span>单点登录集成</span>
          </div>
          <div class="security-item">
            <svg class="shield-icon" viewBox="0 0 24 24" width="16" height="16" fill="#4a5568">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span>政府级加密保护</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部链接 -->
    <div class="bottom-links">
      <div class="left-links">
        <div class="link-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#1e3a5f">
            <circle cx="12" cy="12" r="10" stroke="#1e3a5f" stroke-width="2" fill="none"/>
            <path d="M12 6v6l4 2" stroke="#1e3a5f" stroke-width="2" fill="none"/>
          </svg>
          <span>安全监督局</span>
        </div>
        <div class="link-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#1e3a5f">
            <circle cx="12" cy="12" r="10" stroke="#1e3a5f" stroke-width="2" fill="none"/>
            <path d="M12 6v6l4 2" stroke="#1e3a5f" stroke-width="2" fill="none"/>
          </svg>
          <span>合规标准 V4.2</span>
        </div>
      </div>
      <div class="right-links">
        <span>© 2024 Inspector Pro 监管监察系统。保留所有权利。</span>
        <el-link type="info" class="footer-link">系统状态</el-link>
        <span class="dot">·</span>
        <el-link type="info" class="footer-link">法律框架</el-link>
        <span class="dot">·</span>
        <el-link type="info" class="footer-link">安全审计</el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login as loginApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)
const activeRole = ref('admin')
const showPassword = ref(false)
const rememberPassword = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 从本地存储中验证用户
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        
        // 查找用户
        const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password)
        
        if (user) {
          // 登录成功
          userStore.setToken(`mock-token-${Date.now()}`)
          userStore.setUserInfo({
            id: user.id,
            username: user.username,
            realName: user.realName,
            phone: user.phone,
            district: user.district,
            role: user.role
          })
          ElMessage.success('登录成功')
          router.push('/dashboard')
        } else if (loginForm.username === 'admin' && loginForm.password === '123456') {
          // 保留管理员测试账号
          userStore.setToken('mock-admin-token-123456')
          userStore.setUserInfo({
            id: 1,
            username: 'admin',
            realName: '系统管理员',
            phone: '13800138000',
            district: 'all',
            role: 'admin'
          })
          ElMessage.success('登录成功')
          router.push('/dashboard')
        } else {
          // 验证失败
          ElMessage.error('账号或密码错误')
        }
        
        // 真实API调用（需要后端）
        /*
        const res = await loginApi({
          username: loginForm.username,
          password: loginForm.password
        })
        userStore.setToken(res.data.token)
        userStore.setUserInfo(res.data.userInfo)
        ElMessage.success('登录成功')
        router.push('/dashboard')
        */
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 背景图 */
.login-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)),
              url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80') center/cover;
  filter: blur(2px);
  z-index: -1;
}

/* 登录内容区 */
.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 60px;
  padding-bottom: 100px;
}

/* 顶部图标和标题 */
.login-top {
  text-align: center;
  margin-bottom: 24px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

.logo-icon svg path {
  fill: #fff;
}

.main-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px;
  letter-spacing: 1px;
}

.sub-title {
  font-size: 14px;
  color: #5a6c7d;
  margin: 0;
}

/* 登录卡片 */
.login-card {
  width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* 角色切换标签 */
.role-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #f0f4f8;
  border-radius: 8px;
  padding: 4px;
}

.role-tab {
  flex: 1;
  text-align: center;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #5a6c7d;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.role-tab.active {
  background: #1e3a5f;
  color: #fff;
}

.role-tab:hover:not(.active) {
  background: rgba(30, 58, 95, 0.1);
}

/* 表单标签 */
.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

/* 输入框带图标 */
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-with-icon :deep(.el-input) {
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.input-with-icon :deep(.el-input__wrapper) {
  padding-left: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.password-toggle:hover svg {
  fill: #666;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-options :deep(.el-checkbox__label) {
  font-size: 13px;
  color: #666;
}

.forgot-link {
  font-size: 13px;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: linear-gradient(135deg, #e85a2a 0%, #e88418 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.btn-arrow {
  font-size: 18px;
}

/* 安全提示 */
.security-tips {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5a6c7d;
}

.shield-icon {
  opacity: 0.7;
}

/* 底部链接 */
.bottom-links {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.left-links {
  display: flex;
  gap: 24px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #1e3a5f;
  font-weight: 500;
}

.link-item svg {
  opacity: 0.8;
}

.right-links {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #888;
}

.right-links .dot {
  color: #ccc;
}

.footer-link {
  font-size: 12px;
}

/* 表单样式覆盖 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  background: #f8fafc;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.el-input__inner) {
  height: 44px;
  font-size: 14px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__error) {
  padding-top: 4px;
}
</style>
