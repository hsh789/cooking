import request from '@/utils/request'

// 是否使用模拟数据
const USE_MOCK = true

// 登录
export const login = (data) => {
  if (USE_MOCK) {
    // 模拟登录
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.username === 'admin' && data.password === '123456') {
          resolve({
            code: 200,
            message: '登录成功',
            data: {
              token: 'mock-admin-token-123456',
              userInfo: {
                id: 1,
                username: 'admin',
                realName: '系统管理员',
                phone: '13800138000',
                district: 'all',
                role: 'admin',
                createTime: '2024-01-01 10:00:00'
              }
            }
          })
        } else if (data.username === 'user' && data.password === '123456') {
          resolve({
            code: 200,
            message: '登录成功',
            data: {
              token: 'mock-user-token-123456',
              userInfo: {
                id: 2,
                username: 'user',
                realName: '张网格员',
                phone: '13800138001',
                district: '城关镇',
                role: 'grid',
                createTime: '2024-01-15 09:00:00'
              }
            }
          })
        } else {
          reject({ message: '账号或密码错误' })
        }
      }, 500)
    })
  }
  
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 注册
export const register = (data) => {
  if (USE_MOCK) {
    // 模拟注册
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '注册成功',
          data: {}
        })
      }, 500)
    })
  }
  
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  if (USE_MOCK) {
    // 模拟获取用户信息
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '获取成功',
          data: {
            id: 1,
            username: 'admin',
            realName: '系统管理员',
            phone: '13800138000',
            district: 'all',
            role: 'admin',
            createTime: '2024-01-01 10:00:00'
          }
        })
      }, 300)
    })
  }
  
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 退出登录
export const logout = () => {
  if (USE_MOCK) {
    // 模拟退出
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '退出成功',
          data: {}
        })
      }, 300)
    })
  }
  
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// 修改密码
export const changePassword = (data) => {
  if (USE_MOCK) {
    // 模拟修改密码
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.oldPassword === '123456') {
          resolve({
            code: 200,
            message: '密码修改成功',
            data: {}
          })
        } else {
          reject({ message: '原密码错误' })
        }
      }, 500)
    })
  }
  
  return request({
    url: '/user/change-password',
    method: 'post',
    data
  })
}
