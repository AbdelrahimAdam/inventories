import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ========================
    // LANDING PAGE (Public - but redirects if authenticated)
    // ========================
    {
      path: '/landing',
      name: 'landing',
      component: () => import('@/views/LandingPage.vue'),
      meta: { public: true },
    },

    // ========================
    // SMART HOME ROUTE - Redirects based on auth status
    // ========================
    {
      path: '/',
      name: 'home',
      redirect: () => {
        // This will be overridden by beforeEach guard, but keep as fallback
        return { path: '/landing' }
      },
    },

    // ========================
    // DASHBOARD HOME (For authenticated users)
    // ========================
    {
      path: '/dashboard',
      name: 'dashboard-home',
      component: () => import('@/views/DashboardHome.vue'),
      meta: { requiresAuth: true },
    },

    // ========================
    // TRIAL EXPIRED PAGE
    // ========================
    {
      path: '/trial-expired',
      name: 'trial-expired',
      component: () => import('@/views/TrialExpired.vue'),
      meta: { public: true },
    },

    // ========================
    // PUBLIC ROUTES
    // ========================
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

    // ========================
    // ADMIN ROUTES (Company Manager)
    // ========================
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/modules/admin/Dashboard.vue'),
      meta: { requiresAuth: true, roles: ['company_manager'] },
    },

    // User Management (For Company Managers and Super Admin)
    {
      path: '/admin/users',
      name: 'user-management',
      component: () => import('@/components/admin/UserManagement.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },

    // ---------- INVENTORY ----------
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

    // ---------- WAREHOUSES ----------
    {
      path: '/warehouses',
      name: 'warehouses',
      component: () => import('@/modules/admin/Warehouses/WarehouseList.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager'] },
    },

    // ---------- BRANDS ----------
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

    // ---------- PRODUCTS ----------
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

    // ---------- INVOICES ----------
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

    // ---------- REPORTS ----------
    {
      path: '/reports/stock',
      name: 'stock-report',
      component: () => import('@/modules/admin/Reports/StockReport.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager', 'warehouse_manager', 'viewer'] },
    },

    // ---------- COMPANY SETTINGS ----------
    {
      path: '/settings/company',
      name: 'company-settings',
      component: () => import('@/views/Settings/CompanySettings.vue'),
      meta: { requiresAuth: true, roles: ['superadmin', 'company_manager'] },
    },

    // ---------- USER PROFILE & SETTINGS ----------
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

    // ========================
    // WAREHOUSE MANAGER ROUTES
    // ========================
    {
      path: '/warehouse-manager/dashboard',
      name: 'warehouse-manager-dashboard',
      component: () => import('@/modules/warehouse-manager/Dashboard.vue'),
      meta: { requiresAuth: true, roles: ['warehouse_manager'] },
    },

    // ========================
    // VIEWER ROUTES
    // ========================
    {
      path: '/viewer/dashboard',
      name: 'viewer-dashboard',
      component: () => import('@/modules/viewer/Dashboard.vue'),
      meta: { requiresAuth: true, roles: ['viewer'] },
    },

    // ========================
    // SUPER ADMIN ONLY ROUTES
    // ========================
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

    // ========================
    // CATCH ALL - Redirect to home
    // ========================
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],

  // ========================
  // SCROLL BEHAVIOR - Scroll to top on every navigation
  // ========================
  scrollBehavior(to, _from, savedPosition) {
    // If there's a saved position (like when using browser back/forward), use it
    if (savedPosition) {
      return savedPosition
    }
    
    // Check if the route has a hash (like #section)
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    
    // Default: scroll to top of the page
    return { top: 0, left: 0, behavior: 'smooth' }
  },
})

// Helper function to check if user has required role
const hasRequiredRole = (userRole: string | undefined, allowedRoles: string[] | undefined): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // If trying to go to login page, allow immediately
  if (to.path === '/login') {
    next()
    return
  }

  // Wait for auth check to complete
  if (!authStore.sessionChecked) {
    await authStore.checkAuth()
  }

  const userRole = authStore.user?.role
  const requiresAuth = to.meta.requiresAuth === true
  const allowedRoles = to.meta.roles as string[] | undefined
  const isAuthenticated = authStore.isAuthenticated
  const isPublicRoute = to.meta.public === true

  // ========================
  // CRITICAL: Block authenticated users from landing page
  // ========================
  if (to.path === '/landing' && isAuthenticated) {
    console.log('🚫 Blocking authenticated user from landing page, redirecting to dashboard')
    if (userRole === 'superadmin') {
      next('/super-admin/dashboard')
    } else if (userRole === 'company_manager') {
      next('/admin/dashboard')
    } else if (userRole === 'warehouse_manager') {
      next('/warehouse-manager/dashboard')
    } else if (userRole === 'viewer') {
      next('/viewer/dashboard')
    } else {
      next('/admin/dashboard')
    }
    return
  }

  // ========================
  // TENANT TRIAL EXPIRY CHECK (Affects ALL users in tenant)
  // ========================
  if (isAuthenticated && !authStore.isSuperAdmin && authStore.tenantTrialExpired) {
    if (to.path !== '/trial-expired') {
      next('/trial-expired')
      return
    }
  }

  // ========================
  // USER TRIAL EXPIRY CHECK (Individual user trial)
  // ========================
  if (isAuthenticated && !authStore.isSuperAdmin && authStore.isUserTrialExpired) {
    if (to.path !== '/trial-expired') {
      next('/trial-expired')
      return
    }
  }

  // If user is on trial-expired page but no trial is expired, redirect to dashboard
  if (to.path === '/trial-expired' && isAuthenticated && !authStore.tenantTrialExpired && !authStore.isUserTrialExpired) {
    if (userRole === 'superadmin') {
      next('/super-admin/dashboard')
    } else if (userRole === 'company_manager') {
      next('/admin/dashboard')
    } else if (userRole === 'warehouse_manager') {
      next('/warehouse-manager/dashboard')
    } else if (userRole === 'viewer') {
      next('/viewer/dashboard')
    } else {
      next('/admin/dashboard')
    }
    return
  }

  // ========================
  // SPECIAL HANDLING FOR HOME ROUTE (/)
  // ========================
  if (to.path === '/') {
    if (isAuthenticated) {
      if (userRole === 'superadmin') {
        next('/super-admin/dashboard')
      } else if (userRole === 'company_manager') {
        next('/admin/dashboard')
      } else if (userRole === 'warehouse_manager') {
        next('/warehouse-manager/dashboard')
      } else if (userRole === 'viewer') {
        next('/viewer/dashboard')
      } else {
        next('/admin/dashboard')
      }
    } else {
      next('/landing')
    }
    return
  }

  // ========================
  // PUBLIC ROUTES - Only allow if NOT authenticated
  // ========================
  if (isPublicRoute) {
    // If authenticated and trying to access login/register, redirect to dashboard
    if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      if (userRole === 'superadmin') {
        next('/super-admin/dashboard')
      } else if (userRole === 'company_manager') {
        next('/admin/dashboard')
      } else if (userRole === 'warehouse_manager') {
        next('/warehouse-manager/dashboard')
      } else if (userRole === 'viewer') {
        next('/viewer/dashboard')
      } else {
        next('/admin/dashboard')
      }
      return
    }
    // Allow access to public routes for unauthenticated users
    if (!isAuthenticated) {
      next()
      return
    }
    // If authenticated and trying to access other public routes (like landing), redirect to dashboard
    if (isAuthenticated) {
      if (userRole === 'superadmin') {
        next('/super-admin/dashboard')
      } else if (userRole === 'company_manager') {
        next('/admin/dashboard')
      } else if (userRole === 'warehouse_manager') {
        next('/warehouse-manager/dashboard')
      } else if (userRole === 'viewer') {
        next('/viewer/dashboard')
      } else {
        next('/admin/dashboard')
      }
      return
    }
  }

  // ========================
  // PROTECTED ROUTES
  // ========================
  if (requiresAuth) {
    if (!isAuthenticated) {
      next('/login')
      return
    }

    // Check role-based access
    if (!hasRequiredRole(userRole, allowedRoles)) {
      if (userRole === 'superadmin') {
        next('/super-admin/dashboard')
      } else if (userRole === 'company_manager') {
        next('/admin/dashboard')
      } else if (userRole === 'warehouse_manager') {
        next('/warehouse-manager/dashboard')
      } else if (userRole === 'viewer') {
        next('/viewer/dashboard')
      } else {
        next('/login')
      }
      return
    }
  }

  next()
})

// Add an onError handler to catch navigation failures
router.onError((error) => {
  console.error('Router navigation error:', error)
})

export default router