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
      // ✅ CRITICAL FIX: Don't redirect immediately - let the guard handle it
      // This prevents the landing page from flashing before auth check
      redirect: (to) => {
        // The guard will handle the actual redirect based on auth state
        // This just provides a default target
        return '/landing'
      },
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

const getDashboardForRole = (userRole: string | undefined): string => {
  switch (userRole) {
    case 'superadmin': return '/super-admin/dashboard'
    case 'company_manager': return '/admin/dashboard'
    case 'warehouse_manager': return '/warehouse-manager/dashboard'
    case 'viewer': return '/viewer-dashboard'
    default: return '/admin/dashboard'
  }
}

// ✅ CRITICAL FIX: Wait for auth initialization before ANY navigation
let isAuthReady = false
let authInitPromise: Promise<void> | null = null

const ensureAuthInitialized = async (): Promise<void> => {
  // If already initialized, return immediately
  if (isAuthReady) return
  
  // If initialization is already in progress, wait for it
  if (authInitPromise) {
    await authInitPromise
    return
  }
  
  // Start initialization
  authInitPromise = (async () => {
    const authStore = useAuthStore()
    if (!authStore.isInitialized) {
      await authStore.initialize()
    }
    isAuthReady = true
  })()
  
  await authInitPromise
}

router.beforeEach(async (to, _from, next) => {
  // ✅ MUST WAIT for auth to be ready before making ANY decision
  await ensureAuthInitialized()
  
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role

  // If authenticated and trying to access landing, root, or auth pages, redirect to dashboard
  if (isAuthenticated && (to.path === '/landing' || to.path === '/' || to.path === '/login' || to.path === '/register' || to.path === '/forgot-password')) {
    return next(getDashboardForRole(userRole))
  }

  // Trial expired checks (tenant or user)
  if (isAuthenticated && !authStore.isSuperAdmin && (authStore.tenantTrialExpired || authStore.isUserTrialExpired)) {
    if (to.path !== '/trial-expired') return next('/trial-expired')
    return next()
  }

  // Subscription expired checks
  if (isAuthenticated && !authStore.isSuperAdmin && !authStore.isTenantTrialActive && !authStore.isUserTrialActive) {
    await authStore.refreshSubscriptionStatus(true)
    if (!authStore.isSubscriptionActive && to.path !== '/subscription-expired') {
      return next('/subscription-expired')
    }
  }

  // If trying to access trial-expired page but trials are actually active, redirect to dashboard
  if (to.path === '/trial-expired' && isAuthenticated && !authStore.tenantTrialExpired && !authStore.isUserTrialExpired) {
    return next(getDashboardForRole(userRole))
  }

  // If trying to access subscription-expired page but subscription is active, redirect to dashboard
  if (to.path === '/subscription-expired' && isAuthenticated) {
    await authStore.refreshSubscriptionStatus(true)
    if (authStore.isSubscriptionActive) {
      return next(getDashboardForRole(userRole))
    }
    return next()
  }

  // Public routes - allow access
  if (to.meta.public === true) {
    return next()
  }

  // Protected routes
  if (to.meta.requiresAuth === true) {
    if (!isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
    
    const allowedRoles = to.meta.roles as string[] | undefined
    if (!hasRequiredRole(userRole, allowedRoles)) {
      return next(getDashboardForRole(userRole))
    }
  }

  next()
})

// Reset auth ready state on logout (optional, for safety)
router.afterEach((to) => {
  // If navigating to login/landing, keep auth ready state
  // This prevents re-initialization loops
})

router.onError((error) => {
  console.error('Router navigation error:', error)
})

export default router
