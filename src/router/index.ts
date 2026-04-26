// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/landing',
      name: 'landing',
      component: () => import('@/views/LandingPage.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      redirect: () => ({ path: '/landing' }),
    },
    {
      path: '/dashboard',
      name: 'dashboard-home',
      component: () => import('@/views/DashboardHome.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/trial-expired',
      name: 'trial-expired',
      component: () => import('@/views/TrialExpired.vue'),
      meta: { public: true },
    },
    {
      path: '/subscription-expired',
      name: 'subscription-expired',
      component: () => import('@/views/SubscriptionExpired.vue'),
      meta: { public: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/modules/auth/Register.vue'),
      meta: { public: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/modules/auth/ForgotPassword.vue'),
      meta: { public: true },
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/modules/admin/Dashboard.vue'),
      meta: { requiresAuth: true, roles: ['company_manager'] },
    },
    {
      path: '/admin/users',
      name: 'user-management',
      component: () => import('@/components/admin/UserManagement.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },
    {
      path: '/inventory/items',
      name: 'inventory-items',
      component: () => import('@/modules/admin/Inventory/ItemList.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'] },
    },
    {
      path: '/inventory/items/new',
      name: 'inventory-item-new',
      component: () => import('@/modules/admin/Inventory/ItemForm.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] },
    },
    {
      path: '/inventory/items/:id',
      name: 'inventory-item-details',
      component: () => import('@/modules/admin/Inventory/ItemDetails.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'] },
    },
    {
      path: '/inventory/transactions',
      name: 'inventory-transactions',
      component: () => import('@/modules/admin/Transactions/TransactionList.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] },
    },
    {
      path: '/warehouses',
      name: 'warehouses',
      component: () => import('@/modules/admin/Warehouses/WarehouseList.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] },
    },
    {
      path: '/brands',
      name: 'brands',
      component: () => import('@/modules/admin/Brands/BrandList.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },
    {
      path: '/brands/new',
      name: 'brand-new',
      component: () => import('@/modules/admin/Brands/BrandForm.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },
    {
      path: '/brands/edit/:id',
      name: 'brand-edit',
      component: () => import('@/modules/admin/Brands/BrandForm.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/modules/admin/Products/ProductList.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },
    {
      path: '/products/new',
      name: 'product-new',
      component: () => import('@/modules/admin/Products/ProductForm.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },
    {
      path: '/products/edit/:id',
      name: 'product-edit',
      component: () => import('@/modules/admin/Products/ProductForm.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: () => import('@/modules/admin/Invoices/InvoiceList.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] },
    },
    {
      path: '/invoices/new',
      name: 'invoice-new',
      component: () => import('@/modules/admin/Invoices/InvoiceForm.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] },
    },
    {
      path: '/invoices/:id',
      name: 'invoice-details',
      component: () => import('@/modules/admin/Invoices/InvoiceForm.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] },
    },
    {
      path: '/reports/stock',
      name: 'stock-report',
      component: () => import('@/modules/admin/Reports/StockReport.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'] },
    },
    {
      path: '/settings/company',
      name: 'company-settings',
      component: () => import('@/views/Settings/CompanySettings.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/modules/admin/Profile.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'] },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/modules/admin/Settings.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },
    {
      path: '/warehouse-manager/dashboard',
      name: 'warehouse-manager-dashboard',
      component: () => import('@/modules/warehouse-manager/Dashboard.vue'),
      meta: { requiresAuth: true, roles: ['warehouse_manager'] },
    },
    {
      path: '/viewer/dashboard',
      name: 'viewer-dashboard',
      component: () => import('@/modules/viewer/Dashboard.vue'),
      meta: { requiresAuth: true, roles: ['viewer'] },
    },
    {
      path: '/super-admin/dashboard',
      name: 'super-admin-dashboard',
      component: () => import('@/modules/super-admin/Dashboard.vue'),
      meta: { requiresAuth: true, roles: ['superadmin'] },
    },
    {
      path: '/super-admin/tenants',
      name: 'super-admin-tenants',
      component: () => import('@/modules/super-admin/Tenants/TenantList.vue'),
      meta: { requiresAuth: true, roles: ['superadmin'] },
    },
    {
      path: '/super-admin/users',
      name: 'super-admin-users',
      component: () => import('@/modules/super-admin/Users/UserManagement.vue'),
      meta: { requiresAuth: true, roles: ['superadmin'] },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, left: 0, behavior: 'smooth' }
  },
})

const hasRequiredRole = (userRole: string | undefined, allowedRoles: string[] | undefined): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (to.path === '/login') {
    next()
    return
  }

  if (!authStore.sessionChecked) {
    await authStore.checkAuth()
  }

  const userRole = authStore.user?.role
  const requiresAuth = to.meta.requiresAuth === true
  const allowedRoles = to.meta.roles as string[] | undefined
  const isAuthenticated = authStore.isAuthenticated
  const isPublicRoute = to.meta.public === true

  if (to.path === '/landing' && isAuthenticated) {
    if (userRole === 'superadmin') return next('/super-admin/dashboard')
    if (userRole === 'company_manager') return next('/admin/dashboard')
    if (userRole === 'warehouse_manager') return next('/warehouse-manager/dashboard')
    if (userRole === 'viewer') return next('/viewer/dashboard')
    return next('/admin/dashboard')
  }

  if (isAuthenticated && !authStore.isSuperAdmin && authStore.tenantTrialExpired) {
    if (to.path !== '/trial-expired') return next('/trial-expired')
  }

  if (isAuthenticated && !authStore.isSuperAdmin && authStore.isUserTrialExpired) {
    if (to.path !== '/trial-expired') return next('/trial-expired')
  }

  if (isAuthenticated && !authStore.isSuperAdmin && !authStore.isTenantTrialActive && !authStore.isUserTrialActive) {
    await authStore.refreshSubscriptionStatus()
    if (!authStore.isSubscriptionActive && to.path !== '/subscription-expired') {
      return next('/subscription-expired')
    }
  }

  if (to.path === '/trial-expired' && isAuthenticated && !authStore.tenantTrialExpired && !authStore.isUserTrialExpired) {
    if (userRole === 'superadmin') return next('/super-admin/dashboard')
    if (userRole === 'company_manager') return next('/admin/dashboard')
    if (userRole === 'warehouse_manager') return next('/warehouse-manager/dashboard')
    if (userRole === 'viewer') return next('/viewer/dashboard')
    return next('/admin/dashboard')
  }

  if (to.path === '/subscription-expired' && isAuthenticated) {
    await authStore.refreshSubscriptionStatus()
    if (authStore.isSubscriptionActive) {
      if (userRole === 'superadmin') return next('/super-admin/dashboard')
      if (userRole === 'company_manager') return next('/admin/dashboard')
      if (userRole === 'warehouse_manager') return next('/warehouse-manager/dashboard')
      if (userRole === 'viewer') return next('/viewer/dashboard')
      return next('/admin/dashboard')
    }
  }

  if (to.path === '/') {
    if (isAuthenticated) {
      if (userRole === 'superadmin') return next('/super-admin/dashboard')
      if (userRole === 'company_manager') return next('/admin/dashboard')
      if (userRole === 'warehouse_manager') return next('/warehouse-manager/dashboard')
      if (userRole === 'viewer') return next('/viewer/dashboard')
      return next('/admin/dashboard')
    } else {
      return next('/landing')
    }
  }

  if (isPublicRoute) {
    if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      if (userRole === 'superadmin') return next('/super-admin/dashboard')
      if (userRole === 'company_manager') return next('/admin/dashboard')
      if (userRole === 'warehouse_manager') return next('/warehouse-manager/dashboard')
      if (userRole === 'viewer') return next('/viewer/dashboard')
      return next('/admin/dashboard')
    }
    if (!isAuthenticated) return next()
    if (isAuthenticated) {
      if (userRole === 'superadmin') return next('/super-admin/dashboard')
      if (userRole === 'company_manager') return next('/admin/dashboard')
      if (userRole === 'warehouse_manager') return next('/warehouse-manager/dashboard')
      if (userRole === 'viewer') return next('/viewer/dashboard')
      return next('/admin/dashboard')
    }
  }

  if (requiresAuth) {
    if (!isAuthenticated) return next('/login')
    if (!hasRequiredRole(userRole, allowedRoles)) {
      if (userRole === 'superadmin') return next('/super-admin/dashboard')
      if (userRole === 'company_manager') return next('/admin/dashboard')
      if (userRole === 'warehouse_manager') return next('/warehouse-manager/dashboard')
      if (userRole === 'viewer') return next('/viewer/dashboard')
      return next('/login')
    }
  }

  next()
})

router.onError((error) => {
  console.error('Router navigation error:', error)
})

export default router