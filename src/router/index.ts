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
    // ADMIN ROUTES
    // ========================
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/modules/admin/Dashboard.vue'),
      meta: { requiresAuth: true },
    },

    // ---------- INVENTORY ----------
    {
      path: '/inventory/items',
      name: 'inventory-items',
      component: () => import('@/modules/admin/Inventory/ItemList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/inventory/items/new',
      name: 'inventory-item-new',
      component: () => import('@/modules/admin/Inventory/ItemForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/inventory/items/:id',
      name: 'inventory-item-details',
      component: () => import('@/modules/admin/Inventory/ItemDetails.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/inventory/transactions',
      name: 'inventory-transactions',
      component: () => import('@/modules/admin/Transactions/TransactionList.vue'),
      meta: { requiresAuth: true },
    },

    // ---------- WAREHOUSES ----------
    {
      path: '/warehouses',
      name: 'warehouses',
      component: () => import('@/modules/admin/Warehouses/WarehouseList.vue'),
      meta: { requiresAuth: true },
    },

    // ---------- BRANDS ----------
    {
      path: '/brands',
      name: 'brands',
      component: () => import('@/modules/admin/Brands/BrandList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/brands/new',
      name: 'brand-new',
      component: () => import('@/modules/admin/Brands/BrandForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/brands/edit/:id',
      name: 'brand-edit',
      component: () => import('@/modules/admin/Brands/BrandForm.vue'),
      meta: { requiresAuth: true },
    },

    // ---------- PRODUCTS ----------
    {
      path: '/products',
      name: 'products',
      component: () => import('@/modules/admin/Products/ProductList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products/new',
      name: 'product-new',
      component: () => import('@/modules/admin/Products/ProductForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products/edit/:id',
      name: 'product-edit',
      component: () => import('@/modules/admin/Products/ProductForm.vue'),
      meta: { requiresAuth: true },
    },

    // ---------- INVOICES ----------
    {
      path: '/invoices',
      name: 'invoices',
      component: () => import('@/modules/admin/Invoices/InvoiceList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invoices/new',
      name: 'invoice-new',
      component: () => import('@/modules/admin/Invoices/InvoiceForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invoices/:id',
      name: 'invoice-details',
      component: () => import('@/modules/admin/Invoices/InvoiceForm.vue'),
      meta: { requiresAuth: true },
    },

    // ---------- REPORTS ----------
    {
      path: '/reports/stock',
      name: 'stock-report',
      component: () => import('@/modules/admin/Reports/StockReport.vue'),
      meta: { requiresAuth: true },
    },

    // ---------- USER ----------
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/modules/admin/Profile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/modules/admin/Settings.vue'),
      meta: { requiresAuth: true },
    },

    // ========================
    // SUPER ADMIN ROUTES
    // ========================
    {
      path: '/super-admin/dashboard',
      name: 'super-admin-dashboard',
      component: () => import('@/modules/super-admin/Dashboard.vue'),
      meta: { requiresAuth: true, superAdminOnly: true },
    },
    {
      path: '/super-admin/tenants',
      name: 'super-admin-tenants',
      component: () => import('@/modules/super-admin/Tenants/TenantList.vue'),
      meta: { requiresAuth: true, superAdminOnly: true },
    },
    {
      path: '/super-admin/users',
      name: 'super-admin-users',
      component: () => import('@/modules/super-admin/Users/UserManagement.vue'),
      meta: { requiresAuth: true, superAdminOnly: true },
    },

    // ========================
    // DEFAULT REDIRECTS
    // ========================
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth check to complete
  if (!authStore.sessionChecked) {
    await authStore.checkAuth()
  }
  
  console.log('Router guard - Path:', to.path)
  console.log('Router guard - Is authenticated:', authStore.isAuthenticated)
  console.log('Router guard - Is super admin:', authStore.isSuperAdmin)
  
  // CRITICAL FIX: Immediately block all protected routes if not authenticated
  // This prevents any flash of protected content
  if (to.meta.requiresAuth === true) {
    if (!authStore.isAuthenticated) {
      console.log('🔒 Blocked access to protected route:', to.path)
      next('/login')
      return
    }
  }
  
  // Check super admin only routes
  if (to.meta.superAdminOnly === true) {
    if (!authStore.isSuperAdmin) {
      console.log('🚫 Blocked super admin only route:', to.path)
      next('/admin/dashboard')
      return
    }
  }
  
  // Redirect authenticated users away from public routes
  if (to.meta.public === true && authStore.isAuthenticated) {
    console.log('🔄 Redirecting authenticated user from public route:', to.path)
    if (authStore.isSuperAdmin) {
      next('/super-admin/dashboard')
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