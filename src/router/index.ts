import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes
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
    
    // Super Admin routes
    {
      path: '/super-admin',
      name: 'super-admin',
      redirect: '/super-admin/dashboard',
      meta: { requiresAuth: true, superAdminOnly: true },
    },
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
    
    // Admin / Inventory Manager routes
    {
      path: '/admin',
      name: 'admin',
      redirect: '/admin/dashboard',
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/modules/admin/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
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
    {
      path: '/warehouses',
      name: 'warehouses',
      component: () => import('@/modules/admin/Warehouses/WarehouseList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/modules/admin/Products/ProductList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reports/stock',
      name: 'stock-report',
      component: () => import('@/modules/admin/Reports/StockReport.vue'),
      meta: { requiresAuth: true },
    },
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
    
    // Default redirect
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

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to be initialized
  if (!authStore.sessionChecked) {
    await authStore.checkAuth()
  }
  
  console.log('🔐 Router Guard - Path:', to.path)
  console.log('🔐 Router Guard - Is Authenticated:', authStore.isAuthenticated)
  console.log('🔐 Router Guard - User Role:', authStore.user?.role)
  console.log('🔐 Router Guard - Requires Auth:', to.meta.requiresAuth)
  
  // If route requires authentication and user is not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login')
    next('/login')
    return
  }
  
  // If already authenticated and trying to access public routes (login/register)
  if (to.meta.public && authStore.isAuthenticated) {
    // Redirect based on role
    if (authStore.isSuperAdmin) {
      console.log('✅ Super admin authenticated, redirecting to super admin dashboard')
      next('/super-admin/dashboard')
    } else {
      console.log('✅ Authenticated, redirecting to admin dashboard')
      next('/admin/dashboard')
    }
    return
  }
  
  // Super admin only routes
  if (to.meta.superAdminOnly && !authStore.isSuperAdmin) {
    console.log('🚫 Not super admin, redirecting to admin dashboard')
    next('/admin/dashboard')
    return
  }
  
  // Default - proceed
  console.log('✅ Proceeding to route:', to.path)
  next()
})

export default router