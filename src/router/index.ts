// src/router/index.ts
import { createRouter, createWebHistory, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { preloadInventoryInBackground, preloadTransactionsInBackground, preloadWarehousesInBackground } from './guards/inventory.guard'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    requiresAuth?: boolean
    roles?: Array<'superadmin' | 'company_manager' | 'warehouse_manager' | 'viewer'>
    title?: string
    layout?: 'default' | 'auth' | 'empty'
    prefetch?: boolean
    preloadInventory?: boolean
    preloadTransactions?: boolean
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
    { 
      path: '/', 
      name: 'landing', 
      component: () => import(/* webpackChunkName: "public" */ '@/views/LandingPage.vue'), 
      meta: { public: true, title: 'P.commerce - نظام إدارة المخزون الاحترافي' } 
    },
    { 
      path: '/dashboard', 
      name: 'dashboard-home', 
      component: () => import(/* webpackChunkName: "dashboard" */ '@/views/DashboardHome.vue'), 
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'], title: 'لوحة التحكم', prefetch: true, preloadInventory: true } 
    },
    { 
      path: '/trial-expired', 
      name: 'trial-expired', 
      component: () => import(/* webpackChunkName: "public" */ '@/views/TrialExpired.vue'), 
      meta: { public: true, title: 'انتهت الفترة التجريبية' } 
    },
    { 
      path: '/subscription-expired', 
      name: 'subscription-expired', 
      component: () => import(/* webpackChunkName: "public" */ '@/views/SubscriptionExpired.vue'), 
      meta: { public: true, title: 'انتهى الاشتراك' } 
    },
    { 
      path: '/login', 
      name: 'login', 
      component: () => import(/* webpackChunkName: "auth" */ '@/modules/auth/Login.vue'), 
      meta: { public: true, title: 'تسجيل الدخول' } 
    },
    { 
      path: '/register', 
      name: 'register', 
      component: () => import(/* webpackChunkName: "auth" */ '@/modules/auth/Register.vue'), 
      meta: { public: true, title: 'إنشاء حساب جديد' } 
    },
    { 
      path: '/forgot-password', 
      name: 'forgot-password', 
      component: () => import(/* webpackChunkName: "auth" */ '@/modules/auth/ForgotPassword.vue'), 
      meta: { public: true, title: 'استعادة كلمة المرور' } 
    },

    { 
      path: '/admin/dashboard', 
      name: 'admin-dashboard', 
      component: () => import(/* webpackChunkName: "admin" */ '@/modules/admin/Dashboard.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'لوحة تحكم المدير', prefetch: true, preloadInventory: true } 
    },
    { 
      path: '/admin/users', 
      name: 'user-management', 
      component: () => import(/* webpackChunkName: "admin" */ '@/components/admin/UserManagement.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'إدارة المستخدمين' } 
    },

    { 
      path: '/inventory/items', 
      name: 'inventory-items', 
      component: () => import(/* webpackChunkName: "inventory" */ '@/modules/admin/Inventory/ItemList.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager', 'warehouse_manager', 'viewer'], title: 'الأصناف', prefetch: true, preloadInventory: true } 
    },
    { 
      path: '/inventory/items/new', 
      name: 'inventory-item-new', 
      component: () => import(/* webpackChunkName: "inventory" */ '@/modules/admin/Inventory/ItemForm.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager', 'warehouse_manager'], title: 'إضافة صنف جديد', preloadInventory: true } 
    },
    { 
      path: '/inventory/items/:id', 
      name: 'inventory-item-details', 
      component: () => import(/* webpackChunkName: "inventory" */ '@/modules/admin/Inventory/ItemDetails.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager', 'warehouse_manager', 'viewer'], title: 'تفاصيل الصنف', preloadInventory: true } 
    },
    { 
      path: '/inventory/transactions', 
      name: 'inventory-transactions', 
      component: () => import(/* webpackChunkName: "inventory" */ '@/modules/admin/Transactions/TransactionList.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager', 'warehouse_manager'], title: 'الحركات', preloadTransactions: true } 
    },

    { 
      path: '/warehouses', 
      name: 'warehouses', 
      component: () => import(/* webpackChunkName: "warehouse" */ '@/modules/admin/Warehouses/WarehouseList.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager', 'warehouse_manager'], title: 'المخازن' } 
    },

    { 
      path: '/brands', 
      name: 'brands', 
      component: () => import(/* webpackChunkName: "brands" */ '@/modules/admin/Brands/BrandList.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'العلامات التجارية' } 
    },
    { 
      path: '/brands/new', 
      name: 'brand-new', 
      component: () => import(/* webpackChunkName: "brands" */ '@/modules/admin/Brands/BrandForm.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'إضافة علامة تجارية' } 
    },
    { 
      path: '/brands/edit/:id', 
      name: 'brand-edit', 
      component: () => import(/* webpackChunkName: "brands" */ '@/modules/admin/Brands/BrandForm.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'تعديل علامة تجارية' } 
    },

    { 
      path: '/products', 
      name: 'products', 
      component: () => import(/* webpackChunkName: "products" */ '@/modules/admin/Products/ProductList.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'المنتجات' } 
    },
    { 
      path: '/products/new', 
      name: 'product-new', 
      component: () => import(/* webpackChunkName: "products" */ '@/modules/admin/Products/ProductForm.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'إضافة منتج جديد' } 
    },
    { 
      path: '/products/edit/:id', 
      name: 'product-edit', 
      component: () => import(/* webpackChunkName: "products" */ '@/modules/admin/Products/ProductForm.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'تعديل المنتج' } 
    },

    { 
      path: '/invoices', 
      name: 'invoices', 
      component: () => import(/* webpackChunkName: "invoices" */ '@/modules/admin/Invoices/InvoiceList.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager', 'warehouse_manager'], title: 'الفواتير', prefetch: true, preloadInventory: true } 
    },
    { 
      path: '/invoices/new', 
      name: 'invoice-new', 
      component: () => import(/* webpackChunkName: "invoices" */ '@/modules/admin/Invoices/InvoiceForm.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager', 'warehouse_manager'], title: 'إنشاء فاتورة جديدة', preloadInventory: true } 
    },
    { 
      path: '/invoices/:id', 
      name: 'invoice-details', 
      component: () => import(/* webpackChunkName: "invoices" */ '@/modules/admin/Invoices/InvoiceForm.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager', 'warehouse_manager'], title: 'تفاصيل الفاتورة', preloadInventory: true } 
    },

    { 
      path: '/settings/company', 
      name: 'company-settings', 
      component: () => import(/* webpackChunkName: "settings" */ '@/views/Settings/CompanySettings.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'إعدادات الشركة' } 
    },
    { 
      path: '/settings', 
      name: 'settings', 
      component: () => import(/* webpackChunkName: "settings" */ '@/modules/admin/Settings.vue'), 
      meta: { requiresAuth: true, roles: ['company_manager'], title: 'الإعدادات العامة' } 
    },

    { 
      path: '/profile', 
      name: 'profile', 
      component: () => import(/* webpackChunkName: "profile" */ '@/modules/admin/Profile.vue'), 
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'], title: 'الملف الشخصي' } 
    },

    { 
      path: '/warehouse-manager/dashboard', 
      name: 'warehouse-manager-dashboard', 
      component: () => import(/* webpackChunkName: "warehouse" */ '@/modules/warehouse-manager/Dashboard.vue'), 
      meta: { requiresAuth: true, roles: ['warehouse_manager'], title: 'لوحة تحكم مدير المستودع', prefetch: true, preloadInventory: true } 
    },
    { 
      path: '/viewer/dashboard', 
      name: 'viewer-dashboard', 
      component: () => import(/* webpackChunkName: "viewer" */ '@/modules/viewer/Dashboard.vue'), 
      meta: { requiresAuth: true, roles: ['viewer'], title: 'لوحة تحكم المشاهد', prefetch: true, preloadInventory: true } 
    },

    { 
      path: '/super-admin/dashboard', 
      name: 'super-admin-dashboard', 
      component: () => import(/* webpackChunkName: "super-admin" */ '@/modules/super-admin/Dashboard.vue'), 
      meta: { requiresAuth: true, roles: ['superadmin'], title: 'لوحة تحكم المشرف العام', prefetch: true } 
    },
    { 
      path: '/super-admin/tenants', 
      name: 'super-admin-tenants', 
      component: () => import(/* webpackChunkName: "super-admin" */ '@/modules/super-admin/Tenants/TenantList.vue'), 
      meta: { requiresAuth: true, roles: ['superadmin'], title: 'إدارة المستأجرين' } 
    },
    { 
      path: '/super-admin/users', 
      name: 'super-admin-users', 
      component: () => import(/* webpackChunkName: "super-admin" */ '@/modules/super-admin/Users/UserManagement.vue'), 
      meta: { requiresAuth: true, roles: ['superadmin'], title: 'إدارة المستخدمين' } 
    },
    { 
      path: '/super-admin/requests', 
      name: 'super-admin-requests', 
      component: () => import(/* webpackChunkName: "super-admin" */ '@/modules/super-admin/UpgradeRequests.vue'), 
      meta: { requiresAuth: true, roles: ['superadmin'], title: 'طلبات الترقية' } 
    },
    { 
      path: '/super-admin/settings', 
      name: 'super-admin-settings', 
      component: () => import(/* webpackChunkName: "super-admin" */ '@/modules/super-admin/SystemSettings.vue'), 
      meta: { requiresAuth: true, roles: ['superadmin'], title: 'إعدادات النظام' } 
    },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, left: 0, behavior: 'smooth' }
  },
})

router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore()

  // Set page title
  if (to.meta.title && typeof to.meta.title === 'string') {
    document.title = `${to.meta.title} - P.commerce`
  }

  const isPublicRoute = to.meta.public === true || publicPaths.includes(to.path)

  // If already fully ready and public route, allow
  if (authStore.isFullyReady && isPublicRoute) {
    // Preload inventory in background (fire and forget)
    if (to.meta.preloadInventory) {
      preloadInventoryInBackground()
    }
    if (to.meta.preloadTransactions) {
      preloadTransactionsInBackground()
    }
    preloadWarehousesInBackground()
    return next()
  }

  // Initialize auth if not ready
  if (!authStore.isFullyReady) {
    try {
      await authStore.initialize()
    } catch (err) {
      console.error('Auth initialization error:', err)
      if (isPublicRoute) {
        return next()
      }
      return next({ path: '/login', query: { error: 'init_failed', redirect: to.fullPath } })
    }
  }

  // If still not ready after initialization, handle appropriately
  if (!authStore.isFullyReady) {
    if (isPublicRoute) {
      return next()
    }
    return next({ path: '/login', query: { error: 'init_failed', redirect: to.fullPath } })
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role
  const isSuperAdmin = authStore.isSuperAdmin

  // Check subscription status
  if (isAuthenticated && !isSuperAdmin && !authStore.isSubscriptionInitialized) {
    try {
      await authStore.refreshSubscriptionStatus(true)
    } catch (err) {
      console.error('Failed to fetch subscription status:', err)
    }
  }

  // Check trial and subscription
  if (isAuthenticated && !isSuperAdmin) {
    const isTrialExpired = authStore.tenantTrialExpired || authStore.isUserTrialExpired
    const isSubscriptionInactive = authStore.isSubscriptionInitialized && !authStore.isSubscriptionActive
    const isOnExpiredPage = to.path === '/trial-expired' || to.path === '/subscription-expired'

    if (isTrialExpired && !isOnExpiredPage) {
      return next('/trial-expired')
    }

    if (isSubscriptionInactive && !isOnExpiredPage) {
      return next('/subscription-expired')
    }
  }

  // Offline check
  if (!navigator.onLine && to.meta.requiresAuth) {
    if (to.path !== '/login') {
      return next({ path: '/login', query: { offline: 'true', redirect: to.fullPath } })
    }
    return next()
  }

  // Redirect authenticated users away from public pages
  if (isAuthenticated && publicPaths.includes(to.path)) {
    if (to.path === '/trial-expired' || to.path === '/subscription-expired') {
      if (!isSuperAdmin) {
        const isTrialExpired = authStore.tenantTrialExpired || authStore.isUserTrialExpired
        const isSubscriptionInactive = authStore.isSubscriptionInitialized && !authStore.isSubscriptionActive

        if (!isTrialExpired && !isSubscriptionInactive) {
          const dashboard = getDashboardForRole(userRole)
          if (to.path !== dashboard) {
            return next(dashboard)
          }
        }
        return next()
      }
      return next()
    }

    if (!isSuperAdmin) {
      const isExpired = authStore.tenantTrialExpired || authStore.isUserTrialExpired || 
                        (authStore.isSubscriptionInitialized && !authStore.isSubscriptionActive)
      if (isExpired) {
        return next()
      }
    }
    const dashboard = getDashboardForRole(userRole)
    if (to.path !== dashboard) {
      return next(dashboard)
    }
    return next()
  }

  // Allow public routes
  if (to.meta.public === true) {
    return next()
  }

  // Check authentication for protected routes
  if (to.meta.requiresAuth === true) {
    if (!isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    const allowedRoles = to.meta.roles
    if (!hasRequiredRole(userRole, allowedRoles)) {
      return next(getDashboardForRole(userRole))
    }
  }

  // Preload inventory in background (fire and forget) - NEVER blocks navigation
  if (to.meta.preloadInventory) {
    preloadInventoryInBackground()
  }
  
  // Preload transactions in background (fire and forget)
  if (to.meta.preloadTransactions) {
    preloadTransactionsInBackground()
  }
  
  // Always preload warehouses in background
  preloadWarehousesInBackground()

  // Allow navigation
  next()
})

// Prefetch routes
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    const routesToPrefetch = router.getRoutes()
      .filter(r => r.meta?.prefetch)
      .map(r => r.name)
      .filter((name): name is string => name !== undefined && name !== null)

    routesToPrefetch.forEach(routeName => {
      try {
        // @ts-ignore - Vue Router's internal prefetch method
        router.prefetchRoute?.(routeName)
      } catch {
        // Silently fail if prefetch not available
      }
    })
  })
}

// Error handling
let reloadAttempted = false
let reloadAttemptTime = 0

router.onError((error: Error) => {
  const isChunkError =
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Importing a module script failed') ||
    error.message.includes('Failed to load module script')

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: fullscreen)').matches

  if (isChunkError && !isStandalone && !reloadAttempted) {
    reloadAttempted = true
    reloadAttemptTime = Date.now()
    console.warn('Router chunk error, reloading once...')
    window.location.reload()
  } else if (isChunkError && isStandalone) {
    console.warn('[PWA] Chunk loading error in standalone mode. App may need to be reinstalled.', error)
  } else {
    console.warn('Router navigation error:', error)
  }
})

router.afterEach(() => {
  setTimeout(() => {
    if (Date.now() - reloadAttemptTime > 3000) {
      reloadAttempted = false
    }
  }, 3000)
})

export default router