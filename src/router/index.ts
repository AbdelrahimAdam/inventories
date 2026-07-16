// router/index.ts
import { createRouter, createWebHistory, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    requiresAuth?: boolean
    roles?: Array<'superadmin' | 'company_manager' | 'warehouse_manager' | 'viewer'>
  }
}

function getDashboardForRole(userRole: string | undefined): string {
  switch (userRole) {
    case 'superadmin': return '/super-admin/dashboard'
    case 'company_manager': return '/admin/dashboard'
    case 'warehouse_manager': return '/warehouse-manager/dashboard'
    case 'viewer': return '/viewer/dashboard'
    default: return '/admin/dashboard'
  }
}

function hasRequiredRole(userRole: string | undefined, allowedRoles?: string[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

const publicPaths = ['/', '/login', '/register', '/forgot-password', '/trial-expired', '/subscription-expired']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'landing', component: () => import('@/views/LandingPage.vue'), meta: { public: true } },
    { path: '/dashboard', name: 'dashboard-home', component: () => import('@/views/DashboardHome.vue'), meta: { requiresAuth: true } },
    { path: '/trial-expired', name: 'trial-expired', component: () => import('@/views/TrialExpired.vue'), meta: { public: true } },
    { path: '/subscription-expired', name: 'subscription-expired', component: () => import('@/views/SubscriptionExpired.vue'), meta: { public: true } },
    { path: '/login', name: 'login', component: () => import('@/modules/auth/Login.vue'), meta: { public: true } },
    { path: '/register', name: 'register', component: () => import('@/modules/auth/Register.vue'), meta: { public: true } },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('@/modules/auth/ForgotPassword.vue'), meta: { public: true } },
    { path: '/admin/dashboard', name: 'admin-dashboard', component: () => import('@/modules/admin/Dashboard.vue'), meta: { requiresAuth: true, roles: ['company_manager'] } },
    { path: '/admin/users', name: 'user-management', component: () => import('@/components/admin/UserManagement.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] } },
    { path: '/inventory/items', name: 'inventory-items', component: () => import('@/modules/admin/Inventory/ItemList.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'] } },
    { path: '/inventory/items/new', name: 'inventory-item-new', component: () => import('@/modules/admin/Inventory/ItemForm.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] } },
    { path: '/inventory/items/:id', name: 'inventory-item-details', component: () => import('@/modules/admin/Inventory/ItemDetails.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'] } },
    { path: '/inventory/transactions', name: 'inventory-transactions', component: () => import('@/modules/admin/Transactions/TransactionList.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] } },
    { path: '/warehouses', name: 'warehouses', component: () => import('@/modules/admin/Warehouses/WarehouseList.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] } },
    { path: '/brands', name: 'brands', component: () => import('@/modules/admin/Brands/BrandList.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] } },
    { path: '/brands/new', name: 'brand-new', component: () => import('@/modules/admin/Brands/BrandForm.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] } },
    { path: '/brands/edit/:id', name: 'brand-edit', component: () => import('@/modules/admin/Brands/BrandForm.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] } },
    { path: '/products', name: 'products', component: () => import('@/modules/admin/Products/ProductList.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] } },
    { path: '/products/new', name: 'product-new', component: () => import('@/modules/admin/Products/ProductForm.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] } },
    { path: '/products/edit/:id', name: 'product-edit', component: () => import('@/modules/admin/Products/ProductForm.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] } },
    { path: '/invoices', name: 'invoices', component: () => import('@/modules/admin/Invoices/InvoiceList.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] } },
    { path: '/invoices/new', name: 'invoice-new', component: () => import('@/modules/admin/Invoices/InvoiceForm.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] } },
    { path: '/invoices/:id', name: 'invoice-details', component: () => import('@/modules/admin/Invoices/InvoiceForm.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] } },
    { path: '/settings/company', name: 'company-settings', component: () => import('@/views/Settings/CompanySettings.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] } },
    { path: '/profile', name: 'profile', component: () => import('@/modules/admin/Profile.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'] } },
    { path: '/settings', name: 'settings', component: () => import('@/modules/admin/Settings.vue'), meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] } },
    { path: '/warehouse-manager/dashboard', name: 'warehouse-manager-dashboard', component: () => import('@/modules/warehouse-manager/Dashboard.vue'), meta: { requiresAuth: true, roles: ['warehouse_manager'] } },
    { path: '/viewer/dashboard', name: 'viewer-dashboard', component: () => import('@/modules/viewer/Dashboard.vue'), meta: { requiresAuth: true, roles: ['viewer'] } },
    { path: '/super-admin/dashboard', name: 'super-admin-dashboard', component: () => import('@/modules/super-admin/Dashboard.vue'), meta: { requiresAuth: true, roles: ['superadmin'] } },
    { path: '/super-admin/tenants', name: 'super-admin-tenants', component: () => import('@/modules/super-admin/Tenants/TenantList.vue'), meta: { requiresAuth: true, roles: ['superadmin'] } },
    { path: '/super-admin/users', name: 'super-admin-users', component: () => import('@/modules/super-admin/Users/UserManagement.vue'), meta: { requiresAuth: true, roles: ['superadmin'] } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, left: 0, behavior: 'auto' }
  },
})

router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore()

  // Always ensure auth is initialized (store handles deduplication)
  if (!authStore.isFullyReady) {
    try {
      await authStore.initialize()
    } catch (err) {
      console.error('Auth initialization error:', err)
      if (to.path !== '/login' && !to.meta.public) {
        return next({ path: '/login', query: { error: 'init_failed', redirect: to.fullPath } })
      }
      return next()
    }
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role

  // --- Expiration / subscription guard ---
  // Runs only for authenticated, non-superadmin users
  if (isAuthenticated && !authStore.isSuperAdmin) {
    const isTrialExpired = authStore.tenantTrialExpired || authStore.isUserTrialExpired
    const isSubscriptionInactive = !authStore.isSubscriptionActive
    const isOnExpiredPage = to.path === '/trial-expired' || to.path === '/subscription-expired'

    // Redirect if trial expired and not already on the trial-expired page
    if (isTrialExpired && !isOnExpiredPage) {
      return next('/trial-expired')
    }

    // Redirect if subscription inactive and not already on the subscription-expired page
    if (isSubscriptionInactive && !isOnExpiredPage) {
      return next('/subscription-expired')
    }
  }

  // Offline detection for auth‑required routes
  if (!navigator.onLine && to.meta.requiresAuth) {
    if (to.path !== '/login') {
      return next({ path: '/login', query: { offline: 'true', redirect: to.fullPath } })
    }
    return next()
  }

  // Authenticated users on public pages → redirect to dashboard
  if (isAuthenticated && publicPaths.includes(to.path)) {
    const dashboard = getDashboardForRole(userRole)
    if (to.path !== dashboard) {
      return next(dashboard)
    }
    return next()
  }

  // Public routes
  if (to.meta.public === true) {
    return next()
  }

  // Protected routes
  if (to.meta.requiresAuth === true) {
    if (!isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    const allowedRoles = to.meta.roles
    if (!hasRequiredRole(userRole, allowedRoles)) {
      return next(getDashboardForRole(userRole))
    }
  }

  next()
})

let reloadAttempted = false
router.onError((error: Error) => {
  const isChunkError =
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Importing a module script failed')
  if (isChunkError && !reloadAttempted) {
    reloadAttempted = true
    window.location.reload()
  } else {
    console.warn('Router navigation error:', error)
  }
})
router.afterEach(() => {
  setTimeout(() => { reloadAttempted = false }, 2000)
})

export default router