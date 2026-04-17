<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="left-column">
        <!-- 个人信息卡片 -->
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="80" :icon="UserFilled" />
            <h3>{{ userInfo.username || '用户' }}</h3>
            <el-tag type="warning" size="small">{{ getAdminLevelText(userInfo.adminLevel) }}</el-tag>
            <p v-if="userInfo.adminLevel !== 'level1'">{{ userInfo.district || '未分配片区' }}</p>
          </div>
          
          <!-- 功能标签 -->
          <div class="profile-tags">
            <template v-if="userInfo.adminLevel === 'level1'">
              <el-tag size="small" type="info">全量数据删除</el-tag>
              <el-tag size="small" type="info">全局地图监控</el-tag>
              <el-tag size="small" type="info">账号分配</el-tag>
              <el-tag size="small" type="info">商户管理</el-tag>
              <el-tag size="small" type="info">清洗商管理</el-tag>
            </template>
            <template v-else-if="userInfo.adminLevel === 'level2'">
              <el-tag size="small" type="info">商家导入与管理</el-tag>
              <el-tag size="small" type="info">审核清洗记录</el-tag>
              <el-tag size="small" type="info">商户管理</el-tag>
              <el-tag size="small" type="info">清洗商管理</el-tag>
            </template>
            <template v-else>
              <el-tag size="small" type="info">商家导入与管理</el-tag>
              <el-tag size="small" type="info">审核清洗记录</el-tag>
              <el-tag size="small" type="info">片区参数设置</el-tag>
              <el-tag size="small" type="info">商户管理</el-tag>
            </template>
          </div>
          
          <el-divider />
          
          <div class="profile-info">
            <div class="info-row">
              <div class="info-item">
                <el-icon><Phone /></el-icon>
                <span>手机号：{{ userInfo.phone || '-' }}</span>
                <el-tag type="success" size="small" style="margin-left: 8px;">已验证</el-tag>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>注册时间：{{ userInfo.createTime || '2023-01-01' }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item" v-if="userInfo.adminLevel !== 'level1'">
                <el-icon><Location /></el-icon>
                <span>负责片区：{{ userInfo.district || '开发区全域' }}</span>
              </div>
              <div class="info-item" @click="handleRoleSetting" :class="{ 'full-width': userInfo.adminLevel === 'level1' }">
                <el-icon><User /></el-icon>
                <span>账号类型：{{ getAdminLevelText(userInfo.adminLevel) }}</span>
                <el-icon class="edit-icon"><Edit /></el-icon>
              </div>
            </div>
          </div>
          
          <el-divider />
          
          <div class="profile-actions">
            <el-button type="primary" @click="handleEditProfile">
              <el-icon><Edit /></el-icon>编辑资料
            </el-button>
            <el-button @click="handleChangePassword">
              <el-icon><Lock /></el-icon>修改密码
            </el-button>
            <el-button type="text" @click="handlePermissionDetail">
              权限详情
            </el-button>
          </div>
        </el-card>
        </div>
      </el-col>

      <el-col :span="16">
        <!-- 操作日志 -->
        <el-card class="log-card">
          <template #header>
            <div class="card-header">
              <span>操作日志</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-table :data="logList" stripe>
            <el-table-column prop="action" label="操作内容" />
            <el-table-column prop="ip" label="IP地址" width="130" />
            <el-table-column prop="createTime" label="操作时间" width="160" />
          </el-table>
        </el-card>

        <!-- 账号安全 -->
        <el-card class="security-card">
          <template #header>
            <div class="card-header">
              <span>账号安全</span>
            </div>
          </template>
          <div class="security-list">
            <div class="security-item">
              <div class="security-info">
                <el-icon :size="20"><Lock /></el-icon>
                <div class="security-text">
                  <div class="security-title">登录密码</div>
                  <div class="security-desc">定期修改密码可保护账号安全</div>
                </div>
              </div>
              <el-button type="primary" link @click="handleChangePassword">修改</el-button>
            </div>
            <el-divider style="margin: 10px 0;" />
            <div class="security-item">
              <div class="security-info">
                <el-icon :size="20"><Phone /></el-icon>
                <div class="security-text">
                  <div class="security-title">手机号</div>
                  <div class="security-desc">用于接收短信验证码和提醒通知</div>
                </div>
              </div>
              <el-button type="primary" link @click="handleChangePhone">更换</el-button>
            </div>
            <el-divider style="margin: 10px 0;" />
            <div class="security-item">
              <div class="security-info">
                <el-icon :size="20"><Message /></el-icon>
                <div class="security-text">
                  <div class="security-title">短信通知</div>
                  <div class="security-desc">接收商户预警短信提醒</div>
                </div>
              </div>
              <el-switch v-model="smsEnabled" />
            </div>
          </div>
        </el-card>

        <!-- 片区参数设置 - 仅负责人管理显示 -->
        <el-card class="district-settings-card" v-if="userInfo.adminLevel === 'level3'">
          <template #header>
            <div class="card-header">
              <span>片区参数设置</span>
              <el-tag type="info" size="small">{{ userInfo.district }}</el-tag>
            </div>
          </template>
          <div class="settings-content">
            <div class="setting-item">
              <div class="setting-label">
                <el-icon><Timer /></el-icon>
                <span>清洗周期</span>
              </div>
              <div class="setting-value">
                <el-input-number v-model="districtSettings.cleaningCycle" :min="7" :max="30" size="small" />
                <span class="unit">天</span>
              </div>
            </div>
            <el-divider style="margin: 10px 0;" />
            <div class="setting-item">
              <div class="setting-label">
                <el-icon><Warning /></el-icon>
                <span>预警阈值</span>
              </div>
              <div class="setting-value">
                <el-input-number v-model="districtSettings.warningThreshold" :min="1" :max="29" size="small" />
                <span class="unit">天</span>
              </div>
            </div>
            <el-divider style="margin: 10px 0;" />
            <div class="setting-item">
              <div class="setting-label">
                <el-icon><Clock /></el-icon>
                <span>最后更新</span>
              </div>
              <div class="setting-value">
                <span class="time-text">{{ districtSettings.updatedAt }}</span>
              </div>
            </div>
            <div class="setting-actions">
              <el-button type="primary" @click="handleSaveDistrictSettings" :loading="settingsLoading">
                <el-icon><Check /></el-icon>保存设置
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料弹窗 -->
    <el-dialog v-model="editVisible" title="编辑资料" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="负责片区" prop="district">
          <el-select v-model="formData.district" placeholder="请选择负责片区" style="width: 100%">
            <el-option label="城关镇" value="town" />
            <el-option label="开发区" value="development" />
            <el-option label="工业园区" value="industry" />
            <el-option label="其他片区" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="passwordVisible" title="修改密码" width="500px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handlePasswordSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 角色设置弹窗 -->
    <el-dialog v-model="roleVisible" title="设置账号类型" width="400px">
      <el-form ref="roleFormRef" :model="roleForm" label-width="80px">
        <el-form-item label="账号类型" prop="adminLevel">
          <el-radio-group v-model="roleForm.adminLevel">
            <el-radio label="level1">区县级管理（区/县级）</el-radio>
            <el-radio label="level2">乡镇街道级管理（街道级）</el-radio>
            <el-radio label="level3">负责人管理（具体负责人）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="负责片区" prop="district" v-if="roleForm.adminLevel !== 'level1'">
          <el-select v-model="roleForm.district" placeholder="请选择负责片区" style="width: 100%">
            <el-option label="城关镇" value="town" />
            <el-option label="开发区" value="development" />
            <el-option label="工业园区" value="industry" />
            <el-option label="其他片区" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, Phone, Calendar, User, Location, Lock, Edit, Timer, Warning, Clock, Check, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/auth'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 操作日志
const logList = ref([
  { action: '登录系统', ip: '192.168.1.100', createTime: '2024-01-15 09:30:00' },
  { action: '查看商户列表', ip: '192.168.1.100', createTime: '2024-01-15 09:35:00' },
  { action: '导出商户数据', ip: '192.168.1.100', createTime: '2024-01-15 10:00:00' },
  { action: '查看短信日志', ip: '192.168.1.100', createTime: '2024-01-15 11:20:00' }
])

// 短信通知开关
const smsEnabled = ref(true)

// 片区参数设置
const settingsLoading = ref(false)
const districtSettings = reactive({
  cleaningCycle: 15,
  warningThreshold: 13,
  updatedAt: '2024-01-15 10:00:00'
})

// 保存片区参数设置
const handleSaveDistrictSettings = async () => {
  // 确保预警阈值小于清洗周期
  if (districtSettings.warningThreshold >= districtSettings.cleaningCycle) {
    ElMessage.warning('预警阈值必须小于清洗周期')
    districtSettings.warningThreshold = districtSettings.cleaningCycle - 1
    return
  }
  
  settingsLoading.value = true
  try {
    // 这里可以添加保存片区参数的API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    districtSettings.updatedAt = new Date().toLocaleString()
    ElMessage.success('片区参数设置保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    settingsLoading.value = false
  }
}

// 角色设置弹窗
const roleVisible = ref(false)
const roleFormRef = ref(null)
const roleForm = reactive({
  adminLevel: '',
  district: ''
})

// 编辑资料弹窗
const editVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({
  realName: '',
  phone: '',
  district: ''
})

const formRules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  district: [{ required: true, message: '请选择负责片区', trigger: 'change' }]
}

// 修改密码弹窗
const passwordVisible = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 编辑资料
const handleEditProfile = () => {
  formData.realName = userInfo.value.realName || ''
  formData.phone = userInfo.value.phone || ''
  formData.district = userInfo.value.district || ''
  editVisible.value = true
}

// 提交编辑资料
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 调用API保存
        ElMessage.success('保存成功')
        userStore.setUserInfo({
          ...userInfo.value,
          ...formData
        })
        editVisible.value = false
      } catch (error) {
        console.error('保存失败:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 修改密码
const handleChangePassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordVisible.value = true
}

// 提交修改密码
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功')
        passwordVisible.value = false
      } catch (error) {
        console.error('密码修改失败:', error)
      } finally {
        passwordLoading.value = false
      }
    }
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

// 打开角色设置弹窗
const handleRoleSetting = () => {
  roleForm.adminLevel = userInfo.value.adminLevel || 'level1'
  roleForm.district = userInfo.value.district || ''
  roleVisible.value = true
}

// 提交角色设置
const handleRoleSubmit = () => {
  // 这里可以添加表单验证
  if (roleForm.adminLevel !== 'level1' && !roleForm.district) {
    ElMessage.warning('请选择负责片区')
    return
  }
  
  // 调用API保存角色设置
  userStore.setUserInfo({
    ...userInfo.value,
    adminLevel: roleForm.adminLevel,
    district: roleForm.district
  })
  
  ElMessage.success('账号类型设置成功')
  roleVisible.value = false
  
  // 刷新页面，确保权限生效
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// 更换手机号
const handleChangePhone = () => {
  handleEditProfile()
}

// 权限详情
const handlePermissionDetail = () => {
  ElMessage.info('权限详情功能开发中')
}
</script>

<style scoped>
.profile-container {
  width: 100%;
  padding: 20px;
  background: #f5f7fa;
}

.left-column {
  position: sticky;
  top: 20px;
  align-self: flex-start;
  height: fit-content;
}

.profile-card {
  border-radius: 8px;
  flex: 1;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: none;
}

.profile-header {
  text-align: center;
  padding: 30px 0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e4e7ed;
}

.profile-header .el-avatar {
  width: 80px;
  height: 80px;
  font-size: 40px;
  background: #409EFF;
  color: #fff;
}

.profile-header h3 {
  margin: 16px 0 8px;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.profile-header .el-tag {
  margin-bottom: 16px;
}

.profile-header p {
  color: #909399;
  font-size: 14px;
  margin: 8px 0 16px;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
  padding: 0 20px;
}

.profile-tags .el-tag {
  border-radius: 16px;
  font-size: 12px;
  padding: 2px 12px;
}

.profile-info {
  padding: 20px;
  background: #fff;
  border-radius: 0 0 8px 8px;
}

.info-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.info-item:hover {
  color: #409EFF;
}

.edit-icon {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
  transition: all 0.3s ease;
}

.info-item:hover .edit-icon {
  color: #409EFF;
}

.info-item .el-icon {
  margin-right: 10px;
  color: #409EFF;
  font-size: 16px;
}

.profile-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.profile-actions .el-button {
  flex: 1;
  border-radius: 6px;
}

.log-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 0;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.security-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: none;
}

.security-list {
  padding: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.security-info {
  display: flex;
  align-items: center;
}

.security-info .el-icon {
  margin-right: 12px;
  color: #409EFF;
  font-size: 18px;
}

.security-text {
  flex: 1;
}

.security-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.security-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 片区参数设置卡片样式 */
.district-settings-card {
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: none;
}

.settings-content {
  padding: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.setting-label {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.setting-label .el-icon {
  margin-right: 10px;
  color: #409EFF;
  font-size: 16px;
}

.setting-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-value .unit {
  color: #909399;
  font-size: 14px;
}

.setting-value .time-text {
  color: #606266;
  font-size: 14px;
}

.setting-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.el-table tr:hover > td {
  background-color: #f5f7fa;
}
</style>
