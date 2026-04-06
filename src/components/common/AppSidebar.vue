<template>
  <aside 
    class="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 dark:bg-gray-950 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-screen shadow-xl"
    :class="[isMobileOpen ? 'translate-x-0' : '-translate-x-full']"
  >
    <div class="p-4 border-b border-gray-800 dark:border-gray-800 flex-shrink-0">
      <h2 class="text-xl font-bold text-center bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
        {{ isSuperAdmin ? 'Super Admin Panel' : 'P.commerce' }}
      </h2>
      <p v-if="!isSuperAdmin" class="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
        Inventory Management System
      </p>
    </div>
    
    <nav class="flex-1 overflow-y-auto pb-20">
      <!-- Dashboard -->
      <router-link 
        :to="dashboardPath" 
        @click="closeMobile"
        class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
        active-class="bg-green-600 dark:bg-green-700"
      >
        <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </router-link>

      <!-- Inventory Section -->
      <div class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase mt-4 font-semibold tracking-wider">Inventory</div>
      
      <router-link 
        to="/inventory/items" 
        @click="closeMobile"
        class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
        active-class="bg-green-600 dark:bg-green-700"
      >
        <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        Items
      </router-link>

      <router-link 
        to="/inventory/transactions" 
        @click="closeMobile"
        class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
        active-class="bg-green-600 dark:bg-green-700"
      >
        <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Transactions
      </router-link>

      <router-link 
        to="/warehouses" 
        @click="closeMobile"
        class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
        active-class="bg-green-600 dark:bg-green-700"
      >
        <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Warehouses
      </router-link>

      <!-- Store Section -->
      <div class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase mt-4 font-semibold tracking-wider">Store</div>
      
      <router-link 
        to="/brands" 
        @click="closeMobile"
        class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
        active-class="bg-green-600 dark:bg-green-700"
      >
        <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Brands
      </router-link>

      <router-link 
        to="/products" 
        @click="closeMobile"
        class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
        active-class="bg-green-600 dark:bg-green-700"
      >
        <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        Products
      </router-link>

      <!-- Invoices Section -->
      <div class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase mt-4 font-semibold tracking-wider">Invoices</div>
      
      <router-link 
        to="/invoices" 
        @click="closeMobile"
        class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
        active-class="bg-green-600 dark:bg-green-700"
      >
        <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Invoices
      </router-link>

      <!-- Reports Section -->
      <div class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase mt-4 font-semibold tracking-wider">Reports</div>
      
      <router-link 
        to="/reports/stock" 
        @click="closeMobile"
        class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
        active-class="bg-green-600 dark:bg-green-700"
      >
        <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Stock Report
      </router-link>

      <!-- Super Admin Section -->
      <template v-if="isSuperAdmin">
        <div class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase mt-4 font-semibold tracking-wider">Super Admin</div>
        
        <router-link 
          to="/super-admin/tenants" 
          @click="closeMobile"
          class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
          active-class="bg-green-600 dark:bg-green-700"
        >
          <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Tenants
        </router-link>

        <router-link 
          to="/super-admin/users" 
          @click="closeMobile"
          class="flex items-center px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors group"
          active-class="bg-green-600 dark:bg-green-700"
        >
          <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Users
        </router-link>
      </template>

      <!-- Logout Button -->
      <div class="border-t border-gray-800 dark:border-gray-800 mt-4 pt-4 mx-4">
        <button 
          @click="handleLogout"
          class="flex items-center w-full px-4 py-3 rounded-lg hover:bg-red-600/10 dark:hover:bg-red-600/20 transition-all duration-200 text-red-400 dark:text-red-400 group"
        >
          <svg class="w-5 h-5 mr-3 transition-colors group-hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// Define props with proper typing
defineProps<{
  isMobileOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'closeMobile'): void
}>()

const authStore = useAuthStore()
const router = useRouter()

const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const dashboardPath = computed(() => isSuperAdmin.value ? '/super-admin/dashboard' : '/admin/dashboard')

const closeMobile = () => {
  emit('closeMobile')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>