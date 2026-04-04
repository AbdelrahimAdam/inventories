<template>
  <aside class="w-64 bg-gray-900 text-white min-h-screen">
    <nav class="mt-8">
      <router-link 
        to="/" 
        class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
        active-class="bg-primary"
      >
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </router-link>

      <div class="px-6 py-2 text-xs text-gray-400 uppercase mt-4">Inventory</div>
      
      <router-link 
        to="/inventory/items" 
        class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
        active-class="bg-primary"
      >
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        Items
      </router-link>

      <router-link 
        to="/inventory/transactions" 
        class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
        active-class="bg-primary"
      >
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Transactions
      </router-link>

      <router-link 
        to="/warehouses" 
        class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
        active-class="bg-primary"
      >
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Warehouses
      </router-link>

      <div class="px-6 py-2 text-xs text-gray-400 uppercase mt-4">Store</div>
      
      <router-link 
        to="/products" 
        class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
        active-class="bg-primary"
      >
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        Products
      </router-link>

      <div class="px-6 py-2 text-xs text-gray-400 uppercase mt-4">Reports</div>
      
      <router-link 
        to="/reports/stock" 
        class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
        active-class="bg-primary"
      >
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Stock Report
      </router-link>

      <div v-if="isSuperAdmin" class="px-6 py-2 text-xs text-gray-400 uppercase mt-4">Super Admin</div>
      
      <router-link 
        v-if="isSuperAdmin"
        to="/super-admin/tenants" 
        class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
        active-class="bg-primary"
      >
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Tenants
      </router-link>

      <router-link 
        v-if="isSuperAdmin"
        to="/super-admin/users" 
        class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors"
        active-class="bg-primary"
      >
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Users
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.isSuperAdmin)
</script>