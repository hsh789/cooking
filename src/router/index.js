import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true, title: '监管看板' },
    redirect: '/dashboard/home',
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/dashboard/Home.vue'),
        meta: { requiresAuth: true, title: '监控仪表盘' }
      },
      {
        path: 'home',
        name: 'HomePage',
        component: () => import('@/views/dashboard/Home.vue'),
        meta: { requiresAuth: true, title: '监控仪表盘' }
      },
      {
        path: 'map',
        name: 'Map',
        component: () => import('@/views/dashboard/Map.vue'),
        meta: { requiresAuth: true, title: 'GIS地图监控' }
      },
      {
        path: 'merchant',
        name: 'Merchant',
        component: () => import('@/views/dashboard/Merchant.vue'),
        meta: { requiresAuth: true, title: '商户管理' }
      },
      {
        path: 'merchant-apply',
        name: 'MerchantApply',
        component: () => import('@/views/dashboard/MerchantApply.vue'),
        meta: { requiresAuth: true, title: '商户申请审核' }
      },
      {
        path: 'sms-log',
        name: 'SmsLog',
        component: () => import('@/views/dashboard/SmsLog.vue'),
        meta: { requiresAuth: true, title: '短信日志' }
      },
      {
        path: 'audit',
        name: 'Audit',
        component: () => import('@/views/dashboard/Audit.vue'),
        meta: { requiresAuth: true, title: '审核中心' }
      },
      {
        path: 'admin',
        name: 'Admin',
        redirect: '/dashboard/admin/user',
        meta: { requiresAuth: true, title: '权限管理' }
      },
      {
        path: 'admin/role',
        name: 'AdminRole',
        component: () => import('@/views/dashboard/AdminRole.vue'),
        meta: { requiresAuth: true, title: '角色管理' }
      },
      {
        path: 'admin/user',
        name: 'AdminUser',
        component: () => import('@/views/dashboard/AdminUser.vue'),
        meta: { requiresAuth: true, title: '用户管理' }
      },
      {
        path: 'admin/menu',
        name: 'AdminMenu',
        component: () => import('@/views/dashboard/AdminMenu.vue'),
        meta: { requiresAuth: true, title: '菜单管理' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/dashboard/Settings.vue'),
        meta: { requiresAuth: true, title: '片区参数设置' }
      },
      {
        path: 'service-provider',
        name: 'ServiceProvider',
        component: () => import('@/views/dashboard/ServiceProvider.vue'),
        meta: { requiresAuth: true, title: '第三方服务商管理' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/dashboard/Profile.vue'),
        meta: { requiresAuth: true, title: '个人信息' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  if (to.meta.requiresAuth) {
    if (token) {
      next()
    } else {
      next('/login')
    }
  } else {
    if (to.path === '/login' || to.path === '/register') {
      if (token) {
        next('/dashboard')
      } else {
        next()
      }
    } else {
      next()
    }
  }

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 餐饮油烟净化智慧监管平台`
  }
})

export default router
