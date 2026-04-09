import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    // DEFAULT REDIRECTS
    // ========================
    {
      path: '/',
      redirect: () => {
        // Dynamic redirect based on user role
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          if (authStore.isSuperAdmin) return '/super-admin/dashboard'
          if (authStore.isCompanyManager) return '/admin/dashboard'
          if (authStore.isWarehouseManager) return '/warehouse-manager/dashboard'
          if (authStore.isViewer) return '/viewer/dashboard'
        }
        return '/login'
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

// Helper function to check if user has required role
const hasRequiredRole = (userRole: string | undefined, allowedRoles: string[] | undefined): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth check to complete
  if (!authStore.sessionChecked) {
    await authStore.checkAuth()
  }
  
  const userRole = authStore.user?.role
  const requiresAuth = to.meta.requiresAuth === true
  const allowedRoles = to.meta.roles as string[] | undefined
  const isAuthenticated = authStore.isAuthenticated
  
  console.log('Router guard - Path:', to.path)
  console.log('Router guard - Is authenticated:', isAuthenticated)
  console.log('Router guard - User role:', userRole)
  console.log('Router guard - Required roles:', allowedRoles)
  
  // Check if route requires authentication
  if (requiresAuth) {
    if (!isAuthenticated) {
      console.log('🔒 Blocked access to protected route - not authenticated:', to.path)
      next('/login')
      return
    }
    
    // Check role-based access
    if (!hasRequiredRole(userRole, allowedRoles)) {
      console.log('🚫 Blocked access - insufficient role. Required:', allowedRoles, 'Current:', userRole)
      // Redirect based on user role
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
  
  // Redirect authenticated users away from public routes
  if (to.meta.public === true && isAuthenticated) {
    console.log('🔄 Redirecting authenticated user from public route:', to.path)
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
  
  next()
})

// Add an onError handler to catch navigation failures
router.onError((error) => {
  console.error('Router navigation error:', error)
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    window.location.href = '/login'
  }
})

export default router