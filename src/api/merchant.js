import request from '@/utils/request'
import {
  getGlobalMerchants,
  setGlobalMerchants,
  getGlobalSmsLogs,
  setGlobalSmsLogs,
  getMockMerchantStats,
  getSmsStats as getMockSmsStats,
  filterMerchants,
  paginate,
  mockDelay,
  addToGlobalSmsLogs,
  normalizeDistrict
} from '@/utils/mock'

// 是否使用模拟数据
const USE_MOCK = true

// 获取商户列表
export const getMerchantList = (params) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay()
      const merchants = getGlobalMerchants()
      const filtered = filterMerchants(merchants, params)
      const paginated = paginate(filtered, params.page || 1, params.pageSize || 10)
      
      resolve({
        code: 200,
        message: '获取成功',
        data: {
          list: paginated.list,
          total: paginated.total
        }
      })
    })
  }
  
  return request({
    url: '/merchant/list',
    method: 'get',
    params
  })
}

// 获取商户详情
export const getMerchantDetail = (id) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay()
      const merchants = getGlobalMerchants()
      const merchant = merchants.find(m => m.id === parseInt(id))
      
      if (merchant) {
        resolve({
          code: 200,
          message: '获取成功',
          data: merchant
        })
      } else {
        resolve({
          code: 404,
          message: '商户不存在'
        })
      }
    })
  }
  
  return request({
    url: `/merchant/${id}`,
    method: 'get'
  })
}

// 新增商户
export const addMerchant = (data) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay()
      const merchants = getGlobalMerchants()
      const newMerchant = {
        ...data,
        id: Math.max(...merchants.map(m => m.id)) + 1,
        daysSinceClean: 0,
        warningLevel: 'normal',
        lastCleanTime: new Date().toLocaleString('zh-CN'),
        createTime: new Date().toLocaleString('zh-CN')
      }
      merchants.push(newMerchant)
      setGlobalMerchants(merchants)
      
      resolve({
        code: 200,
        message: '新增成功',
        data: newMerchant
      })
    })
  }
  
  return request({
    url: '/merchant',
    method: 'post',
    data
  })
}

// 编辑商户
export const updateMerchant = (id, data) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay()
      const merchants = getGlobalMerchants()
      const index = merchants.findIndex(m => m.id === parseInt(id))
      
      if (index !== -1) {
        merchants[index] = { ...merchants[index], ...data }
        setGlobalMerchants(merchants)
        
        resolve({
          code: 200,
          message: '编辑成功',
          data: merchants[index]
        })
      } else {
        resolve({
          code: 404,
          message: '商户不存在'
        })
      }
    })
  }
  
  return request({
    url: `/merchant/${id}`,
    method: 'put',
    data
  })
}

// 删除商户
export const deleteMerchant = (id) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay()
      const merchants = getGlobalMerchants()
      const index = merchants.findIndex(m => m.id === parseInt(id))
      
      if (index !== -1) {
        merchants.splice(index, 1)
        setGlobalMerchants(merchants)
        
        resolve({
          code: 200,
          message: '删除成功',
          data: {}
        })
      } else {
        resolve({
          code: 404,
          message: '商户不存在'
        })
      }
    })
  }
  
  return request({
    url: `/merchant/${id}`,
    method: 'delete'
  })
}

// 批量导入商户
export const importMerchants = (data) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay(2000) // 模拟导入需要更长时间
      
      resolve({
        code: 200,
        message: '导入成功',
        data: {
          successCount: 10,
          failedCount: 0
        }
      })
    })
  }
  
  return request({
    url: '/merchant/import',
    method: 'post',
    data
  })
}

// 导出商户
export const exportMerchants = (params) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay()
      
      // 创建模拟的Excel文件Blob
      const csvContent = "商户名称,负责人,联系电话,地址,营业状态,未清洗天数,预警状态,最近清洗时间\n商户1,负责人1,13800000001,地址1,营业中,5,正常,2024-01-01 10:00"
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      resolve({
        code: 200,
        message: '导出成功',
        data: blob
      })
    })
  }
  
  return request({
    url: '/merchant/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取商户状态统计
export const getMerchantStats = (params) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay()
      let merchants = getGlobalMerchants()
      const normalizedDistrict = normalizeDistrict(params?.district)

      if (normalizedDistrict && normalizedDistrict !== 'all') {
        merchants = merchants.filter(m => m.district === normalizedDistrict)
      }
      const stats = getMockMerchantStats(merchants)
      
      resolve({
        code: 200,
        message: '获取成功',
        data: stats
      })
    })
  }
  
  return request({
    url: '/merchant/stats',
    method: 'get',
    params
  })
}

// 获取短信日志列表
export const getSmsLogList = (params) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay()
      let logs = getGlobalSmsLogs()
      
      // 根据参数过滤
      if (params.merchantName) {
        logs = logs.filter(log => log.merchantName.includes(params.merchantName))
      }
      
      if (params.warningLevel) {
        logs = logs.filter(log => log.warningLevel === params.warningLevel)
      }
      
      if (params.status) {
        logs = logs.filter(log => log.status === params.status)
      }
      
      const paginated = paginate(logs, params.page || 1, params.pageSize || 10)
      const stats = getMockSmsStats(logs)
      
      resolve({
        code: 200,
        message: '获取成功',
        data: {
          list: paginated.list,
          total: paginated.total,
          stats
        }
      })
    })
  }
  
  return request({
    url: '/sms/list',
    method: 'get',
    params
  })
}

// 发送短信提醒
export const sendSmsReminder = (data) => {
  if (USE_MOCK) {
    return new Promise(async (resolve) => {
      await mockDelay(1000)
      
      const newLog = {
        id: Date.now(),
        merchantName: data.merchantName,
        merchantId: data.merchantId,
        owner: data.owner,
        phone: data.phone,
        warningLevel: data.warningLevel,
        content: data.content,
        status: Math.random() > 0.1 ? 'success' : 'failed',
        sendTime: new Date().toLocaleString('zh-CN'),
        receiveTime: new Date().toLocaleString('zh-CN'),
        errorMsg: null
      }
      
      if (newLog.status === 'failed') {
        newLog.errorMsg = '短信发送失败，请稍后重试'
      }
      
      addToGlobalSmsLogs(newLog)
      
      resolve({
        code: 200,
        message: newLog.status === 'success' ? '短信发送成功' : '短信发送失败',
        data: newLog
      })
    })
  }
  
  return request({
    url: '/sms/send',
    method: 'post',
    data
  })
}
