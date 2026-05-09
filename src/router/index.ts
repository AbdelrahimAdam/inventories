// router/index.ts
import { createRouter, createWebHistory, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ---------- 1. Strong route meta typing ----------
declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    requiresAuth?: boolean
    roles?: Array<'superadmin' | 'company_manager' | 'warehouse_manager' | 'viewer'>
  }
}

// ---------- 2. Global auth initialization guard (runs once, with timeout) ----------
let authInitPromise: Promise<void> | null = null
let authInitCompleted = false

async function ensureAuthInitialized(): Promise<void> {
  if (authInitCompleted) return

  if (!authInitPromise) {
    authInitPromise = (async () => {
      const authStore = useAuthStore()

      // Offline shortcut – reject quickly
      if (!navigator.onLine) {
        throw new Error('OFFLINE')
      }

      // Timeout after 10 seconds
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 10000)
      )

      const initPromise = authStore.initialize()
      await Promise.race([initPromise, timeoutPromise])
      authInitCompleted = true
    })()
  }
  return authInitPromise
}

// ---------- 3. Helper: get dashboard path by role (same as original) ----------
function getDashboardForRole(userRole: string | undefined): string {
  switch (userRole) {
    case 'superadmin':
      return '/super-admin/dashboard'
    case 'company_manager':
      return '/admin/dashboard'
    case 'warehouse_manager':
      return '/warehouse-manager/dashboard'
    case 'viewer':
      return '/viewer/dashboard'
    default:
      return '/admin/dashboard'
  }
}

// ---------- 4. Role validation (pure, fast) ----------
function hasRequiredRole(userRole: string | undefined, allowedRoles?: string[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

// ---------- 5. Public paths that authenticated users should never see ----------
const publicPaths = ['/', '/login', '/register', '/forgot-password', '/trial-expired', '/subscription-expired']

// ---------- 6. Router instance with optimized scroll behavior ----------
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Landing page at root
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingPage.vue'),
      meta: { public: true },
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
  // Optimized scroll behavior: instant for top, smooth only for hash
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, left: 0, behavior: 'auto' } // instant – no smooth scroll on page changes
  },
})

// ---------- 7. Singleton auth initialization with offline & timeout handling ----------
router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore()

  // --- Offline detection: if offline and route requires auth, redirect to login with offline flag ---
  if (!navigator.onLine && to.meta.requiresAuth) {
    // Do not redirect if already going to login page (avoid loop)
    if (to.path !== '/login') {
      return next({ path: '/login', query: { offline: 'true', redirect: to.fullPath } })
    }
    return next()
  }

  // --- Ensure auth store is initialized (once, with timeout) ---
  try {
    await ensureAuthInitialized()
  } catch (err) {
    // Initialization failed – redirect to login with error details
    const errorType = err instanceof Error ? err.message : 'UNKNOWN'
    console.error('Auth initialization failed:', errorType)
    if (to.path !== '/login' && !to.meta.public) {
      return next({ path: '/login', query: { error: errorType, redirect: to.fullPath } })
    }
    return next()
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role

  // --- Authenticated users on public pages → redirect to dashboard (avoid loops) ---
  if (isAuthenticated && publicPaths.includes(to.path)) {
    // Prevent infinite redirect: if already on a dashboard, allow it
    const dashboard = getDashboardForRole(userRole)
    if (to.path !== dashboard) {
      return next(dashboard)
    }
    return next()
  }

  // --- Public routes (no auth required) ---
  if (to.meta.public === true) {
    return next()
  }

  // --- Protected routes ---
  if (to.meta.requiresAuth === true) {
    if (!isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    const allowedRoles = to.meta.roles
    if (!hasRequiredRole(userRole, allowedRoles)) {
      // User lacks permission → send to their own dashboard
      return next(getDashboardForRole(userRole))
    }
  }

  next()
})

// ---------- 8. Chunk loading recovery & navigation error hardening ----------
let reloadAttempted = false

router.onError((error: Error) => {
  const isChunkError =
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Importing a module script failed')

  if (isChunkError && !reloadAttempted) {
    reloadAttempted = true
    // Try a single hard reload to recover from stale chunks
    window.location.reload()
  } else {
    // Log other navigation errors but do not freeze the UI
    console.warn('Router navigation error:', error)
    // You can optionally redirect to a fallback page here
  }
})

// Reset reload flag after successful navigation (optional)
router.afterEach(() => {
  // Reset reload attempt flag after 2 seconds – allows future recovery
  setTimeout(() => {
    reloadAttempted = false
  }, 2000)
})

export default router
