// 模拟数据生成工具

const districtAliasMap = {
  town: 'town',
  '城关镇': 'town',
  development: 'development',
  '开发区': 'development',
  industry: 'industry',
  '工业园区': 'industry',
  other: 'other',
  '其他片区': 'other'
}

export const normalizeDistrict = (district) => districtAliasMap[district] || district

// 生成模拟商户数据
export const generateMockMerchants = (count = 400) => {
  const districtNames = ['城关镇', '开发区', '工业园区', '其他片区']
  const districtValues = ['town', 'development', 'industry', 'other']
  const businessStatuses = ['open', 'closed', 'stopped']
  const cleaningTypes = ['self_clean', 'third_party']
  
  return Array.from({ length: count }, (_, i) => {
    const daysSinceLastClean = Math.floor(Math.random() * 20)
    const businessStatus = businessStatuses[Math.floor(Math.random() * businessStatuses.length)]
    const districtIndex = Math.floor(Math.random() * districtNames.length)
    const cleaningType = cleaningTypes[Math.floor(Math.random() * cleaningTypes.length)]
    
    let warningLevel = 'normal'
    if (daysSinceLastClean >= 16) warningLevel = 'black'
    else if (daysSinceLastClean >= 15) warningLevel = 'red'
    else if (daysSinceLastClean >= 14) warningLevel = 'yellow'
    else if (daysSinceLastClean >= 13) warningLevel = 'green'
    
    return {
      id: i + 1,
      name: `餐饮商户${i + 1}`,
      ownerName: `负责人${i + 1}`,
      owner: `138${String(Math.floor(10000000 + Math.random() * 90000000)).padStart(8, '0')}`,
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      address: `${districtNames[districtIndex]}美食街${i + 1}号`,
      district: districtValues[districtIndex],
      status: businessStatus,
      daysSinceLastClean: daysSinceLastClean,
      warningLevel: warningLevel,
      cleaningType: cleaningType,
      lastCleanTime: new Date(Date.now() - daysSinceLastClean * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
      lng: 116.397 + (Math.random() - 0.5) * 0.1,
      lat: 39.908 + (Math.random() - 0.5) * 0.1,
      createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
      businessLicense: 'https://via.placeholder.com/200x280/1e3a5f/ffffff?text=营业执照',
      doorPhoto: 'https://via.placeholder.com/140x100/e8f5e9/2e7d32?text=门头照'
    }
  })
}

// 生成模拟短信日志
export const generateMockSmsLogs = (merchants) => {
  const warningLevels = ['green', 'yellow', 'red', 'black']
  const statuses = ['success', 'failed', 'pending']
  const logs = []
  
  merchants.forEach(merchant => {
    // 每个商户生成1-3条短信记录
    const logCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < logCount; i++) {
      const warningLevel = warningLevels[Math.floor(Math.random() * warningLevels.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const sendTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      
      logs.push({
        id: logs.length + 1,
        merchantName: merchant.name,
        merchantId: merchant.id,
        owner: merchant.owner,
        phone: merchant.phone,
        warningLevel: warningLevel,
        content: getSmsContent(warningLevel, merchant.name),
        status: status,
        sendTime: sendTime.toLocaleString('zh-CN'),
        receiveTime: status === 'success' ? new Date(sendTime.getTime() + Math.random() * 60000).toLocaleString('zh-CN') : null,
        errorMsg: status === 'failed' ? '运营商网关超时' : null
      })
    }
  })
  
  return logs.sort((a, b) => new Date(b.sendTime) - new Date(a.sendTime))
}

// 获取短信内容
const getSmsContent = (level, merchantName) => {
  const contents = {
    green: `【油烟监管】${merchantName}，距离上次清洗已13天，请抓紧清洗油烟净化器并拍照上传。`,
    yellow: `【油烟监管】${merchantName}，距离上次清洗已14天，明日必须清洗并拍照上传，否则将触发红色预警。`,
    red: `【油烟监管】${merchantName}，今日必须清洗油烟净化器并拍照上传，否则将标记为违规状态。`,
    black: `【油烟监管】${merchantName}，已逾期16天未清洗，请立即整改并联系片区网格员。`
  }
  return contents[level]
}

// 统计商户数据
export const getMockMerchantStats = (merchants) => {
  const total = merchants.length
  const open = merchants.filter(m => m.status === 'open').length
  const warning = merchants.filter(m => m.warningLevel === 'yellow' || m.warningLevel === 'red').length
  const overdue = merchants.filter(m => m.warningLevel === 'black').length
  
  return { total, open, warning, overdue }
}

// 统计短信数据
export const getSmsStats = (logs) => {
  const total = logs.length
  const success = logs.filter(log => log.status === 'success').length
  const failed = logs.filter(log => log.status === 'failed').length
  const pending = logs.filter(log => log.status === 'pending').length
  
  return { total, success, failed, pending }
}

// 搜索过滤
export const filterMerchants = (merchants, params = {}) => {
  let filtered = [...merchants]
  const normalizedDistrict = normalizeDistrict(params.district)
  
  if (params.name) {
    filtered = filtered.filter(m => m.name.includes(params.name))
  }
  
  if (params.status) {
    filtered = filtered.filter(m => m.status === params.status)
  }
  
  if (params.warningLevel) {
    filtered = filtered.filter(m => m.warningLevel === params.warningLevel)
  }
  
  if (normalizedDistrict && normalizedDistrict !== 'all') {
    filtered = filtered.filter(m => m.district === normalizedDistrict)
  }
  
  return filtered
}

// 分页
export const paginate = (data, page, pageSize) => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    list: data.slice(start, end),
    total: data.length
  }
}

// 模拟延迟
export const mockDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 全局存储（用于模拟数据库）
let globalMerchants = null
let globalSmsLogs = null

export const getGlobalMerchants = () => {
  if (!globalMerchants) {
    globalMerchants = generateMockMerchants()
  }
  return globalMerchants
}

// 清除缓存，强制重新生成数据
export const clearMerchantCache = () => {
  globalMerchants = null
}

export const setGlobalMerchants = (merchants) => {
  globalMerchants = merchants
}

export const getGlobalSmsLogs = () => {
  if (!globalSmsLogs) {
    globalSmsLogs = generateMockSmsLogs(getGlobalMerchants())
  }
  return globalSmsLogs
}

export const setGlobalSmsLogs = (logs) => {
  globalSmsLogs = logs
}

export const addToGlobalSmsLogs = (log) => {
  const logs = getGlobalSmsLogs()
  logs.unshift(log)
  setGlobalSmsLogs(logs)
}
