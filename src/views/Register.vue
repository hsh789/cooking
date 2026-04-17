<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <div class="logo">
          <el-icon :size="40" color="#409EFF">
            <DataBoard />
          </el-icon>
        </div>
        <h1>账号注册</h1>
        <p class="subtitle">政府管理端</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input
            v-model="registerForm.realName"
            placeholder="请输入真实姓名"
            prefix-icon="Avatar"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            prefix-icon="Phone"
          />
        </el-form-item>

        <el-form-item label="负责片区" prop="district">
          <el-select
            v-model="registerForm.district"
            placeholder="请选择负责片区"
            style="width: 100%"
          >
            <el-option label="城关镇" value="城关镇" />
            <el-option label="开发区" value="开发区" />
            <el-option label="工业园区" value="工业园区" />
            <el-option label="其他片区" value="其他片区" />
          </el-select>
        </el-form-item>

        <el-form-item label="管理员级别" prop="adminLevel">
          <el-select
            v-model="registerForm.adminLevel"
            placeholder="请选择管理员级别"
            style="width: 100%"
          >
            <el-option label="区县级管理（区/县级）" value="level1" />
            <el-option label="乡镇街道级管理（街道级）" value="level2" />
            <el-option label="负责人管理（具体负责人）" value="level3" />
          </el-select>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            注 册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <span>已有账号？</span>
        <el-link type="primary" @click="goToLogin">立即登录</el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register as registerApi } from '@/api/auth'

const router = useRouter()

const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  realName: '',
  phone: '',
  district: '',
  adminLevel: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  district: [
    { required: true, message: '请选择负责片区', trigger: 'change' }
  ],
  adminLevel: [
    { required: true, message: '请选择管理员级别', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 本地存储注册用户
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        
        // 检查用户名是否已存在
        const existingUser = users.find(user => user.username === registerForm.username)
        if (existingUser) {
          ElMessage.error('用户名已存在')
          return
        }
        
        // 创建新用户
        const newUser = {
          id: Date.now(),
          username: registerForm.username,
          realName: registerForm.realName,
          phone: registerForm.phone,
          district: registerForm.district,
          adminLevel: registerForm.adminLevel,
          password: registerForm.password
        }
        
        // 保存到本地存储
        users.push(newUser)
        localStorage.setItem('users', JSON.stringify(users))
        
        console.log('注册成功:', newUser)
        ElMessage.success('注册成功，请登录')
        router.push('/login')
        
        // 真实API调用（需要后端）
        /*
        await registerApi({
          username: registerForm.username,
          realName: registerForm.realName,
          phone: registerForm.phone,
          district: registerForm.district,
          password: registerForm.password
        })
        ElMessage.success('注册成功，请登录')
        router.push('/login')
        */
      } catch (error) {
        console.error('注册失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfeff 0%, #ccd3f9 100%);
  overflow-y: auto;
  padding: 20px 0;
}

.register-box {
  width: 480px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  margin-bottom: 10px;
}

.register-header h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.subtitle {
  color: #909399;
  font-size: 14px;
}

.register-form {
  margin-bottom: 20px;
}

.register-form .el-form-item {
  margin-bottom: 20px;
}

.register-form .el-form-item:last-of-type {
  margin-bottom: 0;
}

.register-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px 0;
}

.register-footer {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.register-footer .el-link {
  margin-left: 5px;
}
</style>
